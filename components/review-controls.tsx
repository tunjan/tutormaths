"use client";

import { useState, useTransition } from "react";
import { Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { reviewSubmission } from "@/app/tutor/actions";
import { Button } from "@/components/ui/button";
import { type ReviewStatus } from "@/lib/format";

/**
 * The tutor's verdict control. Approve / Return for revision are independent of
 * the student's progress slider — this is the tutor's source of truth for done.
 */
export function ReviewControls({
  assignmentId,
  status,
}: {
  assignmentId: string;
  status: ReviewStatus;
}) {
  // Hooks must run unconditionally and in a stable order, so they come before
  // any early return (rules-of-hooks).
  const [pending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState("");

  function decide(decision: "approved" | "needs_work") {
    startTransition(async () => {
      try {
        await reviewSubmission(assignmentId, decision);
        toast.success(
          decision === "approved"
            ? "Approved — the student has been notified."
            : "Returned for revision — the student has been notified.",
        );
        setGlobalError("");
      } catch (e) {
        setGlobalError((e as Error).message);
      }
    });
  }

  if (status === "assigned") {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing to review yet — the student hasn&rsquo;t submitted any work.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {globalError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {globalError}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        onClick={() => decide("approved")}
        disabled={pending || status === "approved"}
      >
        <Check />
        {status === "approved" ? "Approved" : "Approve"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => decide("needs_work")}
        disabled={pending || status === "needs_work"}
      >
        <RotateCcw />
        {status === "needs_work" ? "Changes requested" : "Return for revision"}
      </Button>
      </div>
    </div>
  );
}
