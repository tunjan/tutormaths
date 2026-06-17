"use client";

import { useState, useTransition } from "react";
import { Check, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CompletionControl({
  assignmentId,
  initial,
  hasSubmissions,
  uploadTargetId,
}: {
  assignmentId: string;
  initial: number;
  hasSubmissions: boolean;
  uploadTargetId?: string;
}) {
  const [pct, setPct] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();

  function clamp(n: number) {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function focusUpload() {
    if (!uploadTargetId) return;
    const target = document.getElementById(uploadTargetId);
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "smooth" });
    target.focus({ preventScroll: true });
  }

  function save(next: number, options?: { focusUpload?: boolean }) {
    const value = clamp(next);
    setPct(value);
    if (value === saved) {
      if (options?.focusUpload) focusUpload();
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("assignment_id", assignmentId);
      fd.set("completion_pct", String(value));
      await updateCompletion(fd);
      setSaved(value);
      toast.success(
        value >= 100 ? "Marked as done" : `Progress saved — ${value}%`,
      );
      if (options?.focusUpload) focusUpload();
    });
  }

  const needsToSubmit = pct >= 100 && !hasSubmissions;
  const doneWithSubmission = pct === 100 && hasSubmissions;

  const statusLabel = doneWithSubmission
    ? "Completed"
    : needsToSubmit
      ? "Ready to hand in"
      : pct === 0
        ? "Not started"
        : "In progress";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-foreground">
              {statusLabel}
            </span>
            <span className="text-sm font-semibold tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </div>
          <Slider
            value={[pct]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)}
            onValueCommitted={(v) => save(Array.isArray(v) ? v[0] : v)}
            className="w-full"
            aria-label="Completion percentage"
          />
        </div>
        {needsToSubmit ? (
          <Button
            onClick={focusUpload}
            disabled={pending}
            className="w-full shrink-0 sm:w-auto"
          >
            <UploadCloud data-icon="inline-start" />
            Upload work
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon"
                  onClick={() => save(100, { focusUpload: !hasSubmissions })}
                  disabled={doneWithSubmission || pending}
                  aria-label={doneWithSubmission ? "Completed" : "Mark as done"}
                  className="shrink-0"
                />
              }
            >
              <Check data-icon="inline-start" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{doneWithSubmission ? "Completed" : "Mark as done"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {needsToSubmit && (
        <p
          className="rounded-panel border border-border bg-surface-muted px-3.5 py-2.5 text-[13px] leading-relaxed text-muted-foreground"
          role="status"
        >
          You&rsquo;ve marked this done. Upload your work below to hand it in for review.
        </p>
      )}
    </div>
  );
}
