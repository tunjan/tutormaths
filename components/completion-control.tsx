"use client";

import { useState, useTransition } from "react";
import { Check, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/**
 * Student progress control. The slider auto-saves when you let go (on commit),
 * so the displayed value and the saved value never silently disagree, and there
 * is no separate "save" step to forget. "Mark complete" is the one-tap shortcut.
 *
 * This is a *personal tracker only*: moving it to 100% does NOT hand work in.
 * Handing in happens by uploading in "Submit your work". When a student marks
 * themselves done without having submitted anything, we nudge them there —
 * otherwise the tutor would never see the work (the silent dead-end this
 * control used to create).
 */
export function CompletionControl({
  assignmentId,
  initial,
  hasSubmissions,
}: {
  assignmentId: string;
  initial: number;
  hasSubmissions: boolean;
}) {
  const [pct, setPct] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save(next: number) {
    const value = Math.max(0, Math.min(100, next));
    setPct(value);
    if (value === saved) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("assignment_id", assignmentId);
      fd.set("completion_pct", String(value));
      await updateCompletion(fd);
      setSaved(value);
      toast.success(
        value >= 100 ? "Marked as done" : `Progress saved — ${value}%`,
      );
    });
  }

  const status = pending ? "Saving…" : pct === saved ? "Saved" : "Release to save";
  const needsToSubmit = pct >= 100 && !hasSubmissions;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Slider
          value={[pct]}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)}
          onValueCommitted={(v) => save(Array.isArray(v) ? v[0] : v)}
          className="flex-1"
        />
        <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          onClick={() => save(100)}
          disabled={pending || pct >= 100}
        >
          <Check />
          Mark complete
        </Button>
        <span
          className="text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {status}
        </span>
      </div>

      {needsToSubmit && (
        <div
          className="flex items-start gap-2 rounded-lg bg-warning-muted px-3 py-2.5 text-sm text-warning"
          role="status"
        >
          <ArrowUp className="mt-0.5 size-4 shrink-0" />
          <span>
            You&rsquo;ve marked this done — but your tutor only sees it once you
            hand it in. Upload your work in{" "}
            <span className="font-medium">Submit your work</span> above.
          </span>
        </div>
      )}
    </div>
  );
}
