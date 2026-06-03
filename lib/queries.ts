import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CommentView } from "@/components/comment-thread";

/** Loads an assignment's comments with resolved author name + role. */
export async function loadComments(
  assignmentId: string,
): Promise<CommentView[]> {
  const supabase = await createClient();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: true });

  if (!comments || comments.length === 0) return [];

  const ids = [...new Set(comments.map((c) => c.author_id))];
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", ids);

  const byId = new Map((authors ?? []).map((a) => [a.id, a]));

  return comments.map((c) => {
    const a = byId.get(c.author_id);
    return {
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      authorName: a?.full_name || a?.email || "User",
      authorRole: a?.role ?? "student",
    };
  });
}
