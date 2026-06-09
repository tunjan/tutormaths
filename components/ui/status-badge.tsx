import { Badge } from "@/components/ui/badge";
import {
  type AssignmentStatus,
  type DueState,
  type ReviewStatus,
  assignmentStatus,
  dueLabel,
  reviewLabel,
} from "@/lib/format";

const dueStyles: Record<Exclude<DueState, "done">, string> = {
  overdue: "border-border text-foreground",
  "due-soon": "border-border text-foreground",
  upcoming: "border-transparent text-muted-foreground",
};

const reviewStyles: Record<Exclude<ReviewStatus, "assigned">, string> = {
  submitted: "border-transparent text-muted-foreground",
  approved: "border-transparent text-muted-foreground",
  needs_work: "border-border text-foreground",
};

function content(status: AssignmentStatus): { label: string; className: string; dot?: string } {
  if (status.kind === "review") {
    const isNeedsWork = status.review === "needs_work";
    return { 
      label: reviewLabel(status.review), 
      className: reviewStyles[status.review],
      dot: isNeedsWork ? "bg-foreground" : "bg-muted-foreground"
    };
  }
  const isOverdue = status.due === "overdue";
  return { 
    label: dueLabel(status.due), 
    className: dueStyles[status.due],
    dot: isOverdue ? "bg-foreground" : "bg-muted-foreground"
  };
}

/**
 * The single dominant chip for an assignment: the tutor's review verdict when
 * one exists, otherwise the time-based due state.
 */
export function AssignmentStatusBadge({
  reviewStatus,
  dueAt,
}: {
  reviewStatus: ReviewStatus;
  dueAt: string;
}) {
  const { label, className, dot } = content(assignmentStatus(reviewStatus, dueAt));
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 shadow-none rounded-md px-2 py-0.5 text-[13px] font-normal border ${className}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </Badge>
  );
}
