"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface CommentView {
  id: string;
  body: string;
  created_at: string;
  authorId: string;
  authorName: string;
  authorRole: string;
}

/** Two-letter monogram for the avatar, e.g. "Eleanor Vance" → "EV". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type CommentAction = (formData: FormData) => Promise<void>;

function CommentItem({
  assignmentId,
  comment,
  canManage,
  editAction,
  deleteAction,
  onUpdated,
  onDeleted,
}: {
  assignmentId: string;
  comment: CommentView;
  canManage: boolean;
  editAction: CommentAction;
  deleteAction: CommentAction;
  onUpdated: (commentId: string, body: string) => void;
  onDeleted: (commentId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [pending, startTransition] = useTransition();
  const isTutor = comment.authorRole === "tutor";
  const textareaId = `comment-${comment.id}-body`;

  function cancelEdit() {
    setDraft(comment.body);
    setEditing(false);
  }

  function saveEdit() {
    const body = draft.trim();
    if (!body || body === comment.body || pending) return;

    const formData = new FormData();
    formData.set("assignment_id", assignmentId);
    formData.set("comment_id", comment.id);
    formData.set("body", body);

    startTransition(async () => {
      try {
        await editAction(formData);
        onUpdated(comment.id, body);
        setEditing(false);
        toast.success("Comment updated.");
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  function removeComment() {
    if (pending) return;

    const formData = new FormData();
    formData.set("assignment_id", assignmentId);
    formData.set("comment_id", comment.id);

    startTransition(async () => {
      try {
        await deleteAction(formData);
        onDeleted(comment.id);
        toast.success("Comment deleted.");
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  return (
    <li className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-bg-muted text-micro text-foreground"
        aria-hidden
      >
        {initials(comment.authorName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-label text-foreground">
              {comment.authorName}
            </span>
            {isTutor && <Badge variant="secondary">Tutor</Badge>}
            <span className="text-caption text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {canManage && !editing && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  setDraft(comment.body);
                  setEditing(true);
                }}
              >
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This comment will be permanently removed. This action
                      can&rsquo;t be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={removeComment}
                    >
                      Delete comment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {editing ? (
          <form
            className="mt-2"
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit();
            }}
          >
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor={textareaId} className="sr-only">
                  Edit comment
                </FieldLabel>
                <Textarea
                  id={textareaId}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      cancelEdit();
                    }
                    if (
                      (event.metaKey || event.ctrlKey) &&
                      event.key === "Enter"
                    ) {
                      event.preventDefault();
                      saveEdit();
                    }
                  }}
                  rows={3}
                  disabled={pending}
                  autoFocus
                />
              </Field>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    pending ||
                    !draft.trim() ||
                    draft.trim() === comment.body
                  }
                >
                  {pending && <Spinner data-icon="inline-start" />}
                  {pending ? "Saving…" : "Save"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        ) : (
          <div className="mt-1 whitespace-pre-wrap text-body text-foreground">
            {comment.body}
          </div>
        )}
      </div>
    </li>
  );
}

export function CommentThread({
  assignmentId,
  comments,
  currentUserId,
  editAction,
  deleteAction,
  onUpdated,
  onDeleted,
}: {
  assignmentId: string;
  comments: CommentView[];
  currentUserId: string;
  editAction: CommentAction;
  deleteAction: CommentAction;
  onUpdated: (commentId: string, body: string) => void;
  onDeleted: (commentId: string) => void;
}) {
  if (comments.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-6">
        <p className="text-body text-muted-foreground">No comments yet.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border-subtle">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          assignmentId={assignmentId}
          comment={comment}
          canManage={comment.authorId === currentUserId}
          editAction={editAction}
          deleteAction={deleteAction}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
}
