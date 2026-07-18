"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function revalidateAssignment(assignmentId: string) {
  revalidatePath(`/tutor/assignments/${assignmentId}`);
  revalidatePath(`/student/assignments/${assignmentId}`);
}

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

  revalidateAssignment(assignmentId);
}

/** Updates the caller's own comment. RLS repeats the ownership check. */
export async function editComment(formData: FormData): Promise<void> {
  const ctx = await requireUser();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const commentId = String(formData.get("comment_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!assignmentId || !commentId || !body) {
    throw new Error("A comment cannot be empty.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ body })
    .eq("id", commentId)
    .eq("assignment_id", assignmentId)
    .eq("author_id", ctx.userId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error("This comment could not be edited.");
  }

  revalidateAssignment(assignmentId);
}

/** Permanently removes the caller's own comment. */
export async function deleteComment(formData: FormData): Promise<void> {
  const ctx = await requireUser();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const commentId = String(formData.get("comment_id") ?? "");

  if (!assignmentId || !commentId) {
    throw new Error("This comment could not be deleted.");
  }

  const supabase = await createClient();
  // Emit a filterable UPDATE before the hard delete. Other open assignment
  // views can remove the comment live without subscribing to Supabase's
  // unfilterable DELETE events.
  const { data: marked, error: markError } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("assignment_id", assignmentId)
    .eq("author_id", ctx.userId)
    .select("id")
    .maybeSingle();

  if (markError) throw new Error(markError.message);
  if (!marked) {
    throw new Error("This comment could not be deleted.");
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("assignment_id", assignmentId)
    .eq("author_id", ctx.userId)
    .select("id")
    .maybeSingle();

  if (deleteError) throw new Error(deleteError.message);
  if (!deleted) {
    throw new Error("This comment could not be deleted.");
  }

  revalidateAssignment(assignmentId);
}
