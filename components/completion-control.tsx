"use client";

import { useState, useTransition } from "react";
import { Target, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Progress</h3>
        </div>
        <span className="text-2xl font-semibold tabular">{pct}%</span>
      </div>

      <Progress value={pct} aria-label="Completion" />

      <div className="flex items-center gap-3">
        <Slider
          value={[pct]}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)}
          onValueCommitted={(v) => save(Array.isArray(v) ? v[0] : v)}
          className="flex-1"
        />
        <div className="relative w-20 shrink-0">
          <input
            type="number"
            min={0}
            max={100}
            value={pct}
            aria-label="Completion percentage"
            onChange={(e) => setPct(clamp(Number(e.target.value)))}
            onBlur={() => save(pct)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="h-10 w-full rounded-xl border border-line-strong bg-card pr-7 pl-3 text-sm tabular shadow-calm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cobalt-soft)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        </div>
        <Button
          type="button"
          onClick={() => save(100)}
          disabled={pending || pct >= 100}
        >
          Mark as done
        </Button>
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
            <span className="font-medium">Submit your work</span> below.
          </span>
        </div>
      )}
    </div>
  );
}
