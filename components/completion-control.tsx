"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

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

  function clamp(n: number) {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function save(next: number) {
    const value = clamp(next);
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

  const needsToSubmit = pct >= 100 && !hasSubmissions;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <span className="text-[28px] font-semibold tracking-tight tabular-nums w-16 text-foreground">
          {pct}%
        </span>
        <div className="flex-1 min-w-[150px] max-w-[280px]">
          <Slider
            value={[pct]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)}
            onValueCommitted={(v) => save(Array.isArray(v) ? v[0] : v)}
            className="w-full"
          />
        </div>
        <Button
          onClick={() => save(100)}
          disabled={pct === 100 || pending}
          className="ml-auto rounded-lg h-9 px-4 text-[13px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Mark as done
        </Button>
      </div>

      {needsToSubmit && (
        <div
          className="text-[13px] text-muted-foreground"
          role="status"
        >
          <span className="block p-3 bg-secondary/30 rounded-md border border-border/40">
            You&rsquo;ve marked this done. Don&rsquo;t forget to upload your work below to hand it in.
          </span>
        </div>
      )}
    </div>
  );
}
