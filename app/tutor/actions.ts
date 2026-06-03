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
  filePath: string; // object key already uploaded to assignment-files
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
  });
  if (error) throw new Error(error.message);

  revalidatePath("/tutor");
  redirect(`/tutor/assignments/${input.id}`);
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

  revalidatePath("/tutor/settings");
}

/** Edits an assignment's metadata (not the attached PDF). */
export async function updateAssignment(formData: FormData): Promise<void> {
  await requireTutor();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "") as
    | "problem_set"
    | "reading_notes";
  const dueLocal = String(formData.get("due_at") ?? "");
  if (!id || !title || !dueLocal) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update({
      title,
      description: description || null,
      type,
      due_at: new Date(dueLocal).toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/tutor/assignments/${id}`);
  revalidatePath("/tutor");
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
