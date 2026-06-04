"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Marks every unread notification tied to one assignment as read for the
 * caller. Called when they open the assignment, so opening it clears both the
 * row's unread dot and the matching items in the notification bell.
 */
export async function markAssignmentRead(assignmentId: string): Promise<void> {
  const ctx = await requireUser();
  if (!assignmentId) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", ctx.userId)
    .eq("assignment_id", assignmentId)
    .is("read_at", null);

  revalidatePath("/tutor");
  revalidatePath("/student");
}
