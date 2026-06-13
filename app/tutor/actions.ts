"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";

export interface CreateAssignmentInput {
  id: string; // pre-generated UUID (also used as the storage folder)
  studentId: string;
  type: "problem_set" | "reading_notes";
  title: string;
  description: string | null;
  dueAt: string; // ISO timestamp
  filePath: string | null; // object key already uploaded to assignment-files
  latexBody: string | null; // Markdown+LaTeX body, when no file is attached
  categoryId?: string | null; // optional topic tag
}

/**
 * Inserts an assignment after the tutor has uploaded its PDF. The PDF is
 * uploaded client-side directly to storage (under {studentId}/{id}/...), so
 * this only writes the row. RLS requires is_tutor(); the notify trigger pings
 * the student.
 */
export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<void> {
  const ctx = await requireTutor();

  if (new Date(input.dueAt).getTime() <= Date.now()) {
    throw new Error("The due date must be in the future.");
  }

  const latexBody = input.latexBody?.trim() || null;
  if (!input.filePath && !latexBody) {
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
    file_path: input.filePath,
    latex_body: latexBody,
    category_id: input.categoryId || null,
  });
  if (error) throw new Error(error.message);

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

/**
 * Edits an assignment's metadata, and optionally replaces the attached PDF.
 * When a new `file_path` is supplied (already uploaded client-side), the old
 * object is removed from storage afterwards.
 */
export async function updateAssignment(formData: FormData): Promise<void> {
  await requireTutor();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "") as
    | "problem_set"
    | "reading_notes";
  const dueLocal = String(formData.get("due_at") ?? "");
  const newFilePath = String(formData.get("file_path") ?? "").trim();
  // "file" | "latex" — which content source the tutor saved. Omitted means the
  // content wasn't touched (metadata-only edit).
  const source = String(formData.get("source") ?? "");
  const latexBody = String(formData.get("latex_body") ?? "").trim();
  // category_id is sent as "" to clear the tag, or omitted to leave unchanged.
  const hasCategory = formData.has("category_id");
  const categoryId = String(formData.get("category_id") ?? "").trim();
  if (!id || !title || !dueLocal) return;

  if (new Date(dueLocal).getTime() <= Date.now()) {
    throw new Error("The due date must be in the future.");
  }

  const supabase = await createClient();

  // Resolve the content change (if any) and what file, if any, to clean up.
  // Switching to LaTeX, or replacing the file, leaves the old object orphaned.
  let contentUpdate: { file_path?: string | null; latex_body?: string | null } =
    {};
  let removeFilePath: string | null = null;

  if (source === "latex") {
    if (!latexBody) throw new Error("Write the assignment in LaTeX.");
    contentUpdate = { latex_body: latexBody, file_path: null };
  } else if (source === "file" && newFilePath) {
    contentUpdate = { file_path: newFilePath, latex_body: null };
  }

  if (Object.keys(contentUpdate).length > 0) {
    const { data: existing } = await supabase
      .from("assignments")
      .select("file_path")
      .eq("id", id)
      .single();
    const oldFilePath = existing?.file_path ?? null;
    if (oldFilePath && oldFilePath !== newFilePath) removeFilePath = oldFilePath;
  }

  const { error } = await supabase
    .from("assignments")
    .update({
      title,
      description: description || null,
      type,
      due_at: new Date(dueLocal).toISOString(),
      ...contentUpdate,
      ...(hasCategory ? { category_id: categoryId || null } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (removeFilePath) {
    await supabase.storage.from(BUCKET_ASSIGNMENTS).remove([removeFilePath]);
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
 * comments, notifications, reminders) cascade, but storage objects are not
 * FK-linked, so we remove them explicitly. Student submission files live under
 * the students' folders, which the tutor's session can't delete — so we use the
 * service-role admin client (which bypasses storage RLS) for the file removal.
 */
export async function deleteAssignment(id: string): Promise<void> {
  await requireTutor();
  const supabase = await createClient();

  const { data: a } = await supabase
    .from("assignments")
    .select("file_path")
    .eq("id", id)
    .single();
  const { data: subs } = await supabase
    .from("submissions")
    .select("file_path")
    .eq("assignment_id", id);

  const admin = createAdminClient();
  if (a?.file_path) {
    await admin.storage.from(BUCKET_ASSIGNMENTS).remove([a.file_path]);
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
