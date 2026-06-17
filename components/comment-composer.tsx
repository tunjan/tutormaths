"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
    <div className="flex flex-col gap-1.5">
      {error && (
        <div
          className="rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-panel border border-border-soft bg-background/80 py-1.5 pl-3.5 pr-1.5 transition-colors focus-within:border-primary">
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
          className="min-h-[34px] max-h-[160px] flex-1 resize-none bg-transparent py-[5px] text-[15px] leading-6 placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          type="button"
          onClick={submit}
          disabled={pending || !value.trim()}
          aria-label="Post comment"
          size="icon"
          variant="ghost"
          className="size-[34px] shrink-0 rounded-[8px]"
        >
          <Send className="translate-x-[-0.5px]" />
        </Button>
      </div>
    </div>
  );
}
