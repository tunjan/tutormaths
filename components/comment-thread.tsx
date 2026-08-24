"use client";

import { useRef, useState, useTransition } from "react";
import { AlertCircle, Ellipsis, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LatexContent } from "@/components/ui/latex-content";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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

function commentComposerId(assignmentId: string): string {
  return `comment-composer-${assignmentId}`;
}

type CommentAction = (formData: FormData) => Promise<void>;

function CommentItem({
  assignmentId,
  comment,
  canManage,
  editAction,
  onUpdated,
  onRequestDelete,
}: {
  assignmentId: string;
  comment: CommentView;
  canManage: boolean;
  editAction: CommentAction;
  onUpdated: (commentId: string, body: string) => void;
  onRequestDelete: (
    comment: CommentView,
    returnFocus: HTMLElement | null,
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [editError, setEditError] = useState("");
  const [pending, startTransition] = useTransition();
  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const menuActionRef = useRef<"edit" | "delete" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = `comment-${comment.id}-body`;
  const errorId = `${textareaId}-error`;
  const displayName = canManage ? "You" : comment.authorName;

  function restoreActionsFocus() {
    requestAnimationFrame(() => actionsButtonRef.current?.focus());
  }

  function cancelEdit() {
    setDraft(comment.body);
    setEditError("");
    setEditing(false);
    restoreActionsFocus();
  }

  function saveEdit() {
    if (pending) return;

    const body = draft.trim();
    if (!body) {
      setEditError("A message cannot be empty.");
      textareaRef.current?.focus();
      return;
    }
    if (body === comment.body) {
      setEditError("Make a change before saving.");
      textareaRef.current?.focus();
      return;
    }

    const formData = new FormData();
    formData.set("assignment_id", assignmentId);
    formData.set("comment_id", comment.id);
    formData.set("body", body);

    startTransition(async () => {
      try {
        await editAction(formData);
        onUpdated(comment.id, body);
        setDraft(body);
        setEditError("");
        setEditing(false);
        toast.success("Message updated.");
        restoreActionsFocus();
      } catch {
        setEditError("Couldn’t update the message. Try again.");
        textareaRef.current?.focus();
      }
    });
  }

  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-muted text-caption text-foreground"
        aria-hidden
      >
        {initials(comment.authorName)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-1.5 pt-0.5">
            <span
              className="min-w-0 truncate text-label text-foreground"
              title={comment.authorName}
            >
              {displayName}
            </span>
            <span
              className="shrink-0 text-caption text-muted-foreground"
              aria-hidden
            >
              ·
            </span>
            <time
              dateTime={comment.created_at}
              title={formatDateTime(comment.created_at)}
              suppressHydrationWarning
              className="shrink-0 text-caption tabular-nums text-muted-foreground"
            >
              {formatDate(comment.created_at)}
            </time>
          </div>

          {canManage && !editing && (
            <DropdownMenu
              onOpenChangeComplete={(open) => {
                if (open) return;

                const action = menuActionRef.current;
                menuActionRef.current = null;
                if (action === "edit") {
                  setDraft(comment.body);
                  setEditError("");
                  setEditing(true);
                }
                if (action === "delete") {
                  onRequestDelete(comment, actionsButtonRef.current);
                }
              }}
            >
              <DropdownMenuTrigger
                render={
                  <Button
                    ref={actionsButtonRef}
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={pending}
                    aria-label="Message actions"
                    title="Message actions"
                    className="-mt-1 -mr-1 shrink-0"
                  >
                    <Ellipsis data-icon="inline-start" aria-hidden />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" sideOffset={4} className="w-36">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      menuActionRef.current = "edit";
                    }}
                  >
                    <Pencil aria-hidden />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      menuActionRef.current = "delete";
                    }}
                  >
                    <Trash2 aria-hidden />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {editing ? (
          <form
            className="mt-2"
            aria-busy={pending}
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit();
            }}
          >
            <FieldGroup className="gap-3">
              <Field data-invalid={editError ? "true" : undefined}>
                <FieldLabel htmlFor={textareaId} className="sr-only">
                  Edit message
                </FieldLabel>
                <Textarea
                  ref={textareaRef}
                  id={textareaId}
                  name="body"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    if (editError) setEditError("");
                  }}
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
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={3}
                  disabled={pending}
                  aria-invalid={editError ? true : undefined}
                  aria-describedby={editError ? errorId : undefined}
                  autoFocus
                />
                {editError && (
                  <FieldError id={errorId}>{editError}</FieldError>
                )}
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
                  disabled={pending}
                  aria-busy={pending}
                >
                  {pending && <Spinner data-icon="inline-start" />}
                  Save
                </Button>
              </div>
            </FieldGroup>
          </form>
        ) : (
          <LatexContent
            source={comment.body}
            className="mt-1.5 text-body text-content-emphasis"
          />
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
  const [deleteTarget, setDeleteTarget] = useState<CommentView | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletePending, startDelete] = useTransition();
  const deleteReturnFocusRef = useRef<HTMLElement | null>(null);
  const deleteSucceededRef = useRef(false);

  function composerElement(): HTMLElement | null {
    return document.getElementById(commentComposerId(assignmentId));
  }

  function requestDelete(
    comment: CommentView,
    returnFocus: HTMLElement | null,
  ) {
    deleteReturnFocusRef.current = returnFocus;
    deleteSucceededRef.current = false;
    setDeleteTarget(comment);
    setDeleteError("");
    setDeleteOpen(true);
  }

  function removeMessage() {
    if (!deleteTarget || deletePending) return;

    const target = deleteTarget;
    const formData = new FormData();
    formData.set("assignment_id", assignmentId);
    formData.set("comment_id", target.id);

    startDelete(async () => {
      try {
        await deleteAction(formData);
        deleteSucceededRef.current = true;
        toast.success("Message deleted.");
        setDeleteOpen(false);
      } catch {
        setDeleteError("Couldn’t delete the message. Try again.");
      }
    });
  }

  return (
    <>
      <div
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {comments.length === 0 ? (
          <Empty className="items-start gap-0 rounded-none bg-transparent p-0 text-left sm:p-0">
            <EmptyHeader className="items-start">
              <EmptyDescription>
                No messages yet. Start the conversation below.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col divide-y divide-border-subtle">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                assignmentId={assignmentId}
                comment={comment}
                canManage={comment.authorId === currentUserId}
                editAction={editAction}
                onUpdated={onUpdated}
                onRequestDelete={requestDelete}
              />
            ))}
          </ul>
        )}
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          if (!deletePending) setDeleteOpen(nextOpen);
        }}
        onOpenChangeComplete={(open) => {
          if (open) return;

          const returnFocus = deleteReturnFocusRef.current;
          if (deleteSucceededRef.current && deleteTarget) {
            const deletedId = deleteTarget.id;
            deleteSucceededRef.current = false;
            onDeleted(deletedId);
            requestAnimationFrame(() => composerElement()?.focus());
          } else {
            requestAnimationFrame(() => {
              if (returnFocus?.isConnected) returnFocus.focus();
              else composerElement()?.focus();
            });
          }

          setDeleteTarget(null);
          setDeleteError("");
          deleteReturnFocusRef.current = null;
        }}
      >
        <AlertDialogContent
          finalFocus={() => {
            if (deleteSucceededRef.current) return composerElement() ?? true;
            const returnFocus = deleteReturnFocusRef.current;
            return returnFocus?.isConnected
              ? returnFocus
              : (composerElement() ?? true);
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be permanently removed. This can&rsquo;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive" role="alert">
              <AlertCircle aria-hidden />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePending}
              aria-busy={deletePending}
              onClick={removeMessage}
            >
              {deletePending && <Spinner data-icon="inline-start" />}
              Delete message
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
