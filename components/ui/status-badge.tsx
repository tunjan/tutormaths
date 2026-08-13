import { Badge } from "@/components/ui/badge";
import {
  type AssignmentStatus,
  type ReviewStatus,
  assignmentStatus,
  dueLabel,
  reviewLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type StatusContent = {
  label: string;
  variant: "default" | "success" | "warning" | "destructive" | "info";
  dot: string;
};

function statusContent(status: AssignmentStatus): StatusContent {
  if (status.kind === "review") {
    if (status.review === "submitted") {
      return {
        label: "Awaiting review",
        variant: "info",
        dot: "bg-content-info",
      };
    }

    if (status.review === "approved") {
      return {
        label: reviewLabel("approved"),
        variant: "success",
        dot: "bg-content-success",
      };
    }

    return {
      label: reviewLabel("needs_work"),
      variant: "warning",
      dot: "bg-content-warning",
    };
  }

  if (status.due === "overdue") {
    return {
      label: dueLabel("overdue"),
      variant: "destructive",
      dot: "bg-content-error",
    };
  }

  if (status.due === "due-soon") {
    return {
      label: "Due soon",
      variant: "warning",
      dot: "bg-content-warning",
    };
  }

  return {
    label: "Upcoming",
    variant: "default",
    dot: "bg-content-subtle/60",
  };
}

/** The single dominant state chip for an assignment. */
export function AssignmentStatusBadge({
  reviewStatus,
  dueAt,
}: {
  reviewStatus: ReviewStatus;
  dueAt: string;
}) {
  const content = statusContent(assignmentStatus(reviewStatus, dueAt));

  return (
    <Badge variant={content.variant} className="gap-1">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", content.dot)}
        aria-hidden
      />
      {content.label}
    </Badge>
  );
}
