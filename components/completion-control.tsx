"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { updateCompletion } from "@/app/student/actions";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

/** Student progress control: a slider (0–100) plus a "Mark as done" shortcut. */
export function CompletionControl({
  assignmentId,
  initial,
}: {
  assignmentId: string;
  initial: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pct, setPct] = useState(initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await updateCompletion(formData);
        const value = Number(formData.get("completion_pct"));
        toast.success(
          value >= 100 ? "Marked as done" : `Progress saved — ${value}%`,
        );
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <input type="hidden" name="completion_pct" value={pct} />
      <div className="flex items-center gap-4">
        <Slider
          value={[pct]}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)}
          className="flex-1"
        />
        <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save progress</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPct(100);
            requestAnimationFrame(() => formRef.current?.requestSubmit());
          }}
        >
          Mark as done
        </Button>
      </div>
    </form>
  );
}
