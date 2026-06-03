"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Adds a comment to an assignment. Works for both tutor and student — RLS
 * decides who may comment on which assignment, and the notify_comment trigger
 * routes the notification to the other party. author_id is always the caller.
 */
export async function addComment(formData: FormData): Promise<void> {
  const ctx = await requireUser();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!assignmentId || !body) return;

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    assignment_id: assignmentId,
    author_id: ctx.userId,
    body,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/tutor/assignments/${assignmentId}`);
  revalidatePath(`/student/assignments/${assignmentId}`);
}
