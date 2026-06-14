"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";

/** A file already uploaded client-side to the assignment-files bucket. */
export interface AssignmentFileInput {
  filePath: string; // object key under {studentId}/{assignmentId}/...
  mimeType: string;
  sizeBytes: number;
}

export interface CreateAssignmentInput {
  id: string; // pre-generated UUID (also used as the storage folder)
  studentId: string;
  type: "problem_set" | "reading_notes";
  title: string;
  description: string | null;
  dueAt: string; // ISO timestamp
  files: AssignmentFileInput[]; // attachments already uploaded (empty for LaTeX)
  latexBody: string | null; // Markdown+LaTeX body, when no file is attached
  categoryId?: string | null; // optional topic tag
}

/**
 * Inserts an assignment after the tutor has uploaded its files (or written a
 * LaTeX body). Files are uploaded client-side directly to storage (under
 * {studentId}/{id}/...), so this writes the assignment row plus one
 * assignment_files row per attachment. RLS requires is_tutor(); the notify
 * trigger pings the student.
 */
export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<void> {
  const ctx = await requireTutor();

  if (new Date(input.dueAt).getTime() <= Date.now()) {
    throw new Error("The due date must be in the future.");
  }

  const latexBody = input.latexBody?.trim() || null;
  if (input.files.length === 0 && !latexBody) {
    throw new Error("Attach a file or write the assignment in LaTeX.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("assignments").insert({
    id: input.id,
    tutor_id: ctx.userId,
    student_id: input.studentId,
    type: input.type,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    due_at: input.dueAt,
    latex_body: latexBody,
    category_id: input.categoryId || null,
  });
  if (error) throw new Error(error.message);

  if (input.files.length > 0) {
    const { error: filesErr } = await supabase.from("assignment_files").insert(
      input.files.map((f, i) => ({
        assignment_id: input.id,
        file_path: f.filePath,
        mime_type: f.mimeType,
        size_bytes: f.sizeBytes,
        sort_order: i,
      })),
    );
    if (filesErr) {
      // Don't leave an attachment-less file assignment behind.
      await supabase.from("assignments").delete().eq("id", input.id);
      throw new Error(filesErr.message);
    }
  }

  revalidatePath("/tutor");
  redirect(`/tutor/assignments/${input.id}`);
}

/**
 * Cancels a pending student invite (before the student has redeemed it).
 * RLS restricts this to the tutor; deleting an already-accepted invite is a
 * no-op since those rows are kept only as a redemption record.
 */
export async function revokeInvite(id: string): Promise<void> {
  await requireTutor();
  const supabase = await createClient();

  const { error } = await supabase
    .from("student_invites")
    .delete()
    .eq("id", id)
    .is("accepted_at", null);
  if (error) throw new Error(error.message);

  revalidatePath("/tutor/students");
}

/** Updates the tutor's reminder windows (hours before due), e.g. "48,24,6". */
export async function updateReminderWindows(formData: FormData): Promise<void> {
  const ctx = await requireTutor();
  const raw = String(formData.get("windows") ?? "");
  const windows = Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),
  ).sort((a, b) => b - a);

  if (windows.length === 0) return;

  const supabase = await createClient();
  const { error } = await supabase.from("tutor_settings").upsert({
    tutor_id: ctx.userId,
    reminder_windows: windows,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/tutor", "layout");
}

export interface UpdateAssignmentInput {
  id: string;
  title: string;
  description: string | null;
  type: "problem_set" | "reading_notes";
  dueAt: string; // ISO timestamp
  categoryId?: string | null; // omit (hasCategory false) to leave unchanged
  hasCategory?: boolean;
  // Content change. "latex" switches to a LaTeX body (and clears all files);
  // "file" manages attachments (and clears any LaTeX body). Omit to leave the
  // content untouched (metadata-only edit).
  source?: "file" | "latex";
  latexBody?: string | null;
  addedFiles?: AssignmentFileInput[]; // newly uploaded attachments
  removedFileIds?: string[]; // assignment_files ids to delete
}

/**
 * Edits an assignment's metadata and content. Switching to LaTeX clears all
 * attachments; managing files clears any LaTeX body. New files are uploaded
 * client-side first; removed files are deleted from both the table and the
 * storage bucket here.
 */
export async function updateAssignment(
  input: UpdateAssignmentInput,
): Promise<void> {
  await requireTutor();
  const { id, source } = input;
  const title = input.title.trim();
  if (!id || !title || !input.dueAt) return;

  if (new Date(input.dueAt).getTime() <= Date.now()) {
    throw new Error("The due date must be in the future.");
  }

  const supabase = await createClient();

  // Switching to LaTeX clears any attachments; switching to file clears LaTeX.
  let contentUpdate: { latex_body?: string | null } = {};
  if (source === "latex") {
    const latexBody = input.latexBody?.trim();
    if (!latexBody) throw new Error("Write the assignment in LaTeX.");
    contentUpdate = { latex_body: latexBody };
  } else if (source === "file") {
    contentUpdate = { latex_body: null };
  }

  const { error } = await supabase
    .from("assignments")
    .update({
      title,
      description: input.description?.trim() || null,
      type: input.type,
      due_at: input.dueAt,
      ...contentUpdate,
      ...(input.hasCategory ? { category_id: input.categoryId || null } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // When switching to LaTeX, remove every attachment (rows + storage objects).
  if (source === "latex") {
    const { data: all } = await supabase
      .from("assignment_files")
      .select("file_path")
      .eq("assignment_id", id);
    if (all && all.length > 0) {
      await supabase.from("assignment_files").delete().eq("assignment_id", id);
      await supabase.storage
        .from(BUCKET_ASSIGNMENTS)
        .remove(all.map((f) => f.file_path));
    }
    revalidatePath(`/tutor/assignments/${id}`);
    revalidatePath("/tutor");
    return;
  }

  // Remove deleted attachments: read their paths, delete the rows, then objects.
  const removedIds = input.removedFileIds ?? [];
  if (removedIds.length > 0) {
    const { data: gone } = await supabase
      .from("assignment_files")
      .select("file_path")
      .in("id", removedIds);
    const { error: delErr } = await supabase
      .from("assignment_files")
      .delete()
      .in("id", removedIds);
    if (delErr) throw new Error(delErr.message);
    const paths = (gone ?? []).map((f) => f.file_path);
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET_ASSIGNMENTS).remove(paths);
    }
  }

  // Append new attachments after the current highest sort_order.
  const added = input.addedFiles ?? [];
  if (added.length > 0) {
    const { data: rows } = await supabase
      .from("assignment_files")
      .select("sort_order")
      .eq("assignment_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);
    const base = (rows?.[0]?.sort_order ?? -1) + 1;
    const { error: addErr } = await supabase.from("assignment_files").insert(
      added.map((f, i) => ({
        assignment_id: id,
        file_path: f.filePath,
        mime_type: f.mimeType,
        size_bytes: f.sizeBytes,
        sort_order: base + i,
      })),
    );
    if (addErr) throw new Error(addErr.message);
  }

  revalidatePath(`/tutor/assignments/${id}`);
  revalidatePath("/tutor");
}

/**
 * Records the tutor's verdict on submitted work. The notify_review trigger
 * pings the student; reviewed_at is stamped for the history. Decoupled from
 * completion_pct (the student's self-report) by design.
 */
export async function reviewSubmission(
  assignmentId: string,
  decision: "approved" | "needs_work",
): Promise<void> {
  await requireTutor();
  const supabase = await createClient();

  const { error } = await supabase
    .from("assignments")
    .update({ review_status: decision, reviewed_at: new Date().toISOString() })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);

  revalidatePath(`/tutor/assignments/${assignmentId}`);
  revalidatePath("/tutor");
  revalidatePath(`/student/assignments/${assignmentId}`);
  revalidatePath("/student");
}

/**
 * Deletes an assignment and ALL of its storage files. The DB rows (submissions,
 * comments, notifications, reminders, assignment_files) cascade, but storage
 * objects are not FK-linked, so we remove them explicitly. Student submission
 * files live under the students' folders, which the tutor's session can't
 * delete — so we use the service-role admin client (which bypasses storage RLS)
 * for the file removal.
 */
export async function deleteAssignment(id: string): Promise<void> {
  await requireTutor();
  const supabase = await createClient();

  const { data: files } = await supabase
    .from("assignment_files")
    .select("file_path")
    .eq("assignment_id", id);
  const { data: subs } = await supabase
    .from("submissions")
    .select("file_path")
    .eq("assignment_id", id);

  const admin = createAdminClient();
  if (files && files.length > 0) {
    await admin.storage
      .from(BUCKET_ASSIGNMENTS)
      .remove(files.map((f) => f.file_path));
  }
  if (subs && subs.length > 0) {
    await admin.storage
      .from(BUCKET_SUBMISSIONS)
      .remove(subs.map((s) => s.file_path));
  }

  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/tutor");
  redirect("/tutor");
}
