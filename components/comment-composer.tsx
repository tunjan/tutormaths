"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

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

  function submit() {
    const body = value.trim();
    if (!body || pending) return;
    const fd = new FormData();
    fd.set("assignment_id", assignmentId);
    fd.set("body", body);
    startTransition(async () => {
      try {
        await action(fd);
        setValue("");
        setError("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  // Auto-grow height on value change
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-end gap-2 rounded-md border border-border bg-card p-2 pl-4 transition-[border-color,box-shadow] duration-base ease-[var(--ease-out)] focus-within:border-border-default focus-within:shadow-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Write a comment…"
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-2 text-body placeholder:text-content-muted focus:outline-none"
        />
        <Button
          type="button"
          onClick={submit}
          disabled={pending || !value.trim()}
          aria-label="Post comment"
          size="icon-sm"
          variant="soft"
          className="shrink-0"
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}
