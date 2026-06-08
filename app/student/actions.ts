"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BUCKET_SUBMISSIONS } from "@/lib/constants";

/**
 * Reports progress as a single integer 0–100. "Mark as done" simply submits
 * 100. There is no separate done flag. The guard trigger ensures a student can
 * change nothing but completion_pct; the notify trigger pings the tutor.
 */
export async function updateCompletion(formData: FormData): Promise<void> {
  const ctx = await requireStudent();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  let pct = parseInt(String(formData.get("completion_pct") ?? ""), 10);
  if (!assignmentId || !Number.isFinite(pct)) return;
  pct = Math.max(0, Math.min(100, pct));

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update({ completion_pct: pct })
    .eq("id", assignmentId)
    .eq("student_id", ctx.userId);
  if (error) throw new Error(error.message);

  revalidatePath(`/student/assignments/${assignmentId}`);
  revalidatePath("/student");
}

export interface RecordSubmissionInput {
  assignmentId: string;
  filePath: string; // already uploaded to the submissions bucket
  mimeType: string;
  sizeBytes: number;
}

/**
 * Records a student's uploaded work. The file is uploaded client-side directly
 * to storage (under {studentId}/{assignmentId}/...); this writes the row. RLS
 * verifies the assignment belongs to the caller; the notify trigger pings the
 * tutor.
 */
export async function recordSubmission(
  input: RecordSubmissionInput,
): Promise<void> {
  const ctx = await requireStudent();
  const supabase = await createClient();

  const { error } = await supabase.from("submissions").insert({
    assignment_id: input.assignmentId,
    student_id: ctx.userId,
    file_path: input.filePath,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/student/assignments/${input.assignmentId}`);
}

/**
 * Removes one of the student's own submissions (row + stored file). RLS only
 * lets a student delete their own rows; the file lives under their own folder,
 * so the user session may remove it directly.
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  const ctx = await requireStudent();
  if (!submissionId) return;

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("submissions")
    .select("file_path, assignment_id, student_id")
    .eq("id", submissionId)
    .single();
  if (!sub || sub.student_id !== ctx.userId) return;

  await supabase.storage.from(BUCKET_SUBMISSIONS).remove([sub.file_path]);

  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);
  if (error) throw new Error(error.message);

  revalidatePath(`/student/assignments/${sub.assignment_id}`);
}

/**
 * Stamps the first time the student opens an assignment so the tutor can see
 * it has been read. Write-once: the `is(null)` filter means only the first open
 * lands, and the guard trigger refuses any later change. Revalidates the tutor
 * views so the receipt shows up the next time the tutor loads the page.
 */
export async function markAssignmentOpened(assignmentId: string): Promise<void> {
  const ctx = await requireStudent();
  if (!assignmentId) return;

  const supabase = await createClient();
  await supabase
    .from("assignments")
    .update({ student_opened_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .eq("student_id", ctx.userId)
    .is("student_opened_at", null);

  revalidatePath(`/tutor/assignments/${assignmentId}`);
  revalidatePath("/tutor");
}

/** Asks the tutor for more homework (writes a notification via RPC). */
export async function requestMoreHomework(): Promise<void> {
  await requireStudent();
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_more_homework");
  if (error) throw new Error(error.message);
}
