"use client";

import { useState, useTransition } from "react";
import { Check, Info, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-label text-foreground">
            {statusLabel}
          </span>
          <span className="text-label tabular-nums text-foreground">
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
        <Button size="sm" onClick={focusUpload} disabled={pending} className="w-full">
          <UploadCloud data-icon="inline-start" />
          Upload work
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => save(100, { focusUpload: !hasSubmissions })}
          disabled={doneWithSubmission || pending}
          aria-label={doneWithSubmission ? "Assignment completed" : "Mark assignment complete"}
          className="w-full"
        >
          <Check data-icon="inline-start" />
          {doneWithSubmission ? "Completed" : "Mark as complete"}
        </Button>
      )}

      {needsToSubmit && (
        <Alert variant="info" role="status">
          <Info aria-hidden />
          <AlertDescription>
            Upload below to send it to your tutor.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
