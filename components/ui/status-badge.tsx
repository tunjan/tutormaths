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
  overdue: "border-transparent bg-destructive-muted text-destructive",
  "due-soon": "border-transparent bg-warning-muted text-warning",
  upcoming: "border-border text-muted-foreground",
};

const reviewStyles: Record<Exclude<ReviewStatus, "assigned">, string> = {
  // Awaiting review is the tutor's call to action — a quiet steel blue.
  submitted: "border-transparent bg-info-muted text-info",
  // Approved reads positively — a calm, muted green.
  approved: "border-transparent bg-success-muted text-success",
  // "Changes requested" is an action the student must take — soft amber, kept
  // calm but distinct from the pale "Due soon" chip via its filled tint.
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
    <Badge
      variant="outline"
      className={`px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </Badge>
  );
}
