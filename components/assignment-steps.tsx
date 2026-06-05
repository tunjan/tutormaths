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
    <ol className="flex w-full items-center gap-2" aria-label="Assignment progress">
      {labels.map((label, i) => {
        const state = states[i];
        const isLast = i === labels.length - 1;
        return (
          <li
            key={label}
            className={cn("flex items-center gap-2", !isLast && "flex-1")}
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors",
                  state === "done" &&
                    "border-transparent bg-primary text-primary-foreground",
                  state === "current" &&
                    "border-info bg-info-muted text-info",
                  state === "todo" &&
                    "border-border bg-transparent text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  state === "todo"
                    ? "text-muted-foreground"
                    : "font-medium text-foreground",
                )}
              >
                {label}
              </span>
            </span>
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1",
                  states[i + 1] === "todo" ? "bg-border" : "bg-primary",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
