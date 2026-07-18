"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CommentThread, type CommentView } from "@/components/comment-thread";

export interface Participant {
  name: string;
  role: string;
}

type CommentAction = (formData: FormData) => Promise<void>;

/**
 * Renders the comment thread and appends new comments live via Supabase
 * Realtime, so a tutor↔student exchange updates without reloading. The author's
 * name/role is resolved from the participant map (the two people on the
 * assignment); RLS still scopes which rows each client receives.
 */
export function LiveCommentThread({
  assignmentId,
  initial,
  participants,
  currentUserId,
  editAction,
  deleteAction,
}: {
  assignmentId: string;
  initial: CommentView[];
  participants: Record<string, Participant>;
  currentUserId: string;
  editAction: CommentAction;
  deleteAction: CommentAction;
}) {
  // Resolve display name/role from the known participants where possible. This
  // matters for the student view, where RLS hides the tutor's profile row so the
  // server-side name resolution can't see it.
  const resolve = (c: CommentView): CommentView => {
    const who = participants[c.authorId];
    return who
      ? { ...c, authorName: who.name, authorRole: who.role }
      : c;
  };

  const [comments, setComments] = useState<CommentView[]>(() =>
    initial.map(resolve),
  );
  const participantsRef = useRef(participants);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${assignmentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `assignment_id=eq.${assignmentId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            body: string;
            created_at: string;
            author_id: string;
          };
          setComments((prev) => {
            if (prev.some((c) => c.id === row.id)) return prev;
            const who = participantsRef.current[row.author_id];
            return [
              ...prev,
              {
                id: row.id,
                body: row.body,
                created_at: row.created_at,
                authorId: row.author_id,
                authorName: who?.name ?? "User",
                authorRole: who?.role ?? "student",
              },
            ];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "comments",
          filter: `assignment_id=eq.${assignmentId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            body: string;
            deleted_at: string | null;
          };
          setComments((prev) =>
            row.deleted_at
              ? prev.filter((comment) => comment.id !== row.id)
              : prev.map((comment) =>
                  comment.id === row.id
                    ? { ...comment, body: row.body }
                    : comment,
                ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignmentId]);

  return (
    <CommentThread
      assignmentId={assignmentId}
      comments={comments}
      currentUserId={currentUserId}
      editAction={editAction}
      deleteAction={deleteAction}
      onUpdated={(commentId, body) =>
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? { ...comment, body } : comment,
          ),
        )
      }
      onDeleted={(commentId) =>
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId),
        )
      }
    />
  );
}
