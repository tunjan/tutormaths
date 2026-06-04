"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/**
 * Student progress control. The slider auto-saves when you let go (on commit),
 * so the displayed value and the saved value never silently disagree, and there
 * is no separate "save" step to forget. "Mark complete" is the one-tap shortcut.
 */
export function CompletionControl({
  assignmentId,
  initial,
}: {
  assignmentId: string;
  initial: number;
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
    </div>
  );
}
