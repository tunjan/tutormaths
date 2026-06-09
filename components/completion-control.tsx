"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/**
 * Student progress control. The slider and the numeric box auto-save when you
 * let go / leave the field, so the displayed value and the saved value never
 * silently disagree, and there is no separate "save" step to forget. The filled
 * bar mirrors the value live. "Mark as done" is the one-tap shortcut to 100%.
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium">Progress</h3>
        <p className="text-sm text-muted-foreground">
          Track your completion. Marking as 100% does not submit your work.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <span className="text-2xl font-semibold tracking-tight tabular-nums w-14">{pct}%</span>
          <div className="flex-1">
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
        </div>
        
        <div>
          <Button
            onClick={() => save(100)}
            disabled={pct === 100 || pending}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-[6px] shadow-none h-9 px-4 text-[14px] font-medium transition-colors"
          >
            Mark as done
          </Button>
        </div>
      </div>

      {needsToSubmit && (
        <div
          className="text-sm text-muted-foreground"
          role="status"
        >
          <span className="block border-l-2 border-border pl-3 py-0.5">
            You&rsquo;ve marked this done. Don&rsquo;t forget to upload your work below to hand it in.
          </span>
        </div>
      )}
    </div>
  );
}

