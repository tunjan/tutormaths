"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Compact comment composer: a growing textarea with an inline circular "send"
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

  return (
    <div className="flex flex-col gap-1.5">
      {error && (
        <div
          className="rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
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
          className="min-h-11 flex-1 resize-none rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-calm transition-colors placeholder:text-ink-faint focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cobalt-soft)]"
        />
        <Button
          type="button"
          size="icon"
          onClick={submit}
          disabled={pending || !value.trim()}
          aria-label="Post comment"
          className="shrink-0 rounded-xl"
        >
          <Send />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Press ⌘/Ctrl + Enter to post.
      </p>
    </div>
  );
}
