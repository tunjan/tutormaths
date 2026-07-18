import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/format";

type NodeState = "done" | "current" | "todo";

/**
 * A compact three-step view of where an assignment sits in its lifecycle:
 * Working → Submitted → Approved. It makes the otherwise-invisible state
 * machine legible to the student, so "I dragged the slider to 100%" is never
 * confused with "my tutor has it". `needs_work` lands back on Working — the
 * student owes a fresh submission (the banner explains why).
 */
function nodesFor(status: ReviewStatus): NodeState[] {
  switch (status) {
    case "submitted":
      return ["done", "current", "todo"];
    case "approved":
      return ["done", "done", "done"];
    case "needs_work":
    case "assigned":
    default:
      return ["current", "todo", "todo"];
  }
}

const labels = ["Working", "Submitted", "Approved"] as const;

export function AssignmentSteps({ status }: { status: ReviewStatus }) {
  const states = nodesFor(status);

  return (
    <ol className="grid w-full grid-cols-3" aria-label="Assignment progress">
      {labels.map((label, i) => {
        const state = states[i];
        const isLast = i === labels.length - 1;
        return (
          <li
            key={label}
            aria-current={state === "current" ? "step" : undefined}
            className="relative flex min-w-0 flex-col gap-2"
          >
            <span className="flex items-center">
              <span
                aria-hidden
                className={cn(
                  "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-micro tabular-nums transition-colors duration-fast",
                  state === "done" &&
                    "border-transparent bg-primary text-primary-foreground",
                  state === "current" &&
                    "border-primary bg-background text-primary ring-4 ring-primary/10",
                  state === "todo" &&
                    "border-border-strong bg-background text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="size-4" /> : i + 1}
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px min-w-0 flex-1",
                    states[i + 1] === "todo" ? "bg-border-strong" : "bg-primary",
                  )}
                />
              )}
            </span>
            <span
              className={cn(
                "truncate pr-2 text-micro",
                state === "todo"
                  ? "text-muted-foreground"
                  : "font-semibold text-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
