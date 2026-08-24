"use client";

import { useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

/**
 * Compact comment composer: a growing textarea with an inline send
 * button, plus ⌘/Ctrl + Enter to post. New comments stream back into the thread
 * via Supabase Realtime, so there's no separate refresh step. The server action
 * is passed in so the same composer can serve tutor and student views.
 */
export function CommentComposer({
  assignmentId,
  action,
}: {
  assignmentId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = `comment-composer-${assignmentId}`;
  const errorId = `${textareaId}-error`;

  function submit() {
    const body = value.trim();
    if (pending) return;
    if (!body) {
      setError("Write a message before posting.");
      textareaRef.current?.focus();
      return;
    }

    const fd = new FormData();
    fd.set("assignment_id", assignmentId);
    fd.set("body", body);

    startTransition(async () => {
      try {
        await action(fd);
        setValue("");
        setError("");
      } catch {
        setError("Couldn’t post the message. Try again.");
        textareaRef.current?.focus();
      }
    });
  }

  return (
    <form
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <FieldGroup className="gap-2">
        <Field data-invalid={error ? "true" : undefined}>
          <FieldLabel htmlFor={textareaId} className="sr-only">
            Write a message
          </FieldLabel>
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              id={textareaId}
              name="body"
              value={value}
              onChange={(event) => {
                const nextValue = event.target.value;
                setValue(nextValue);
                if (error && nextValue.trim()) setError("");
              }}
              onKeyDown={(event) => {
                if (
                  (event.metaKey || event.ctrlKey) &&
                  event.key === "Enter"
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              placeholder="Write a message…"
              autoComplete="off"
              disabled={pending}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="max-h-40 min-h-11 resize-none [field-sizing:content] sm:min-h-10"
            />
            <Button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              aria-label="Post message"
              title="Post message"
              size="icon"
              variant={value.trim() ? "default" : "soft"}
              className="shrink-0"
            >
              {pending ? <Spinner aria-hidden /> : <Send aria-hidden />}
            </Button>
          </div>
          {error && <FieldError id={errorId}>{error}</FieldError>}
        </Field>
      </FieldGroup>
    </form>
  );
}
