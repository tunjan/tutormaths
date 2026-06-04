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
  overdue: "border-transparent bg-destructive/10 text-destructive",
  "due-soon": "border-transparent bg-warning-muted text-warning",
  upcoming: "border-border text-muted-foreground",
};

const reviewStyles: Record<Exclude<ReviewStatus, "assigned">, string> = {
  submitted: "border-transparent bg-secondary text-secondary-foreground",
  approved: "border-transparent bg-primary/10 text-primary",
  needs_work: "border-transparent bg-warning-muted text-warning",
};

function content(status: AssignmentStatus): { label: string; className: string } {
  if (status.kind === "review") {
    return { label: reviewLabel(status.review), className: reviewStyles[status.review] };
  }
  return { label: dueLabel(status.due), className: dueStyles[status.due] };
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
  const { label, className } = content(assignmentStatus(reviewStatus, dueAt));
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
