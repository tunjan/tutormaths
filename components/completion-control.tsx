"use client";

import { useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[72px_minmax(180px,1fr)_auto] md:items-center">
        <div className="flex items-baseline gap-2 md:block">
          <span className="text-[32px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
            {pct}%
          </span>
          <span className="text-sm text-muted-foreground md:sr-only">complete</span>
        </div>
        <div className="min-w-0">
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
          onClick={() =>
            needsToSubmit ? focusUpload() : save(100, { focusUpload: !hasSubmissions })
          }
          disabled={doneWithSubmission || pending}
          className="w-full md:w-auto"
        >
          {needsToSubmit && <UploadCloud data-icon="inline-start" />}
          {needsToSubmit ? "Upload work" : doneWithSubmission ? "Done" : "Mark as done"}
        </Button>
      </div>

      {needsToSubmit && (
        <div
          className="text-[13px] text-muted-foreground"
          role="status"
        >
          <span className="block rounded-panel border border-border bg-background p-3">
            You&rsquo;ve marked this done. Upload your work below to hand it in for review.
          </span>
        </div>
      )}
    </div>
  );
}
