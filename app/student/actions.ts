"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

/** Asks the tutor for more homework (writes a notification via RPC). */
export async function requestMoreHomework(): Promise<void> {
  await requireStudent();
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_more_homework");
  if (error) throw new Error(error.message);
}
