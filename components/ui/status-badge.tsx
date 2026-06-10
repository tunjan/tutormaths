import { Badge } from "@/components/ui/badge";
import {
  type AssignmentStatus,
  type ReviewStatus,
  assignmentStatus,
  dueLabel,
  reviewLabel,
} from "@/lib/format";

function content(status: AssignmentStatus): { 
  label: string; 
  variant: "success" | "warning" | "info" | "outline" | "destructive"; 
  dot?: string 
} {
  if (status.kind === "review") {
    if (status.review === "approved") {
      return { 
        label: reviewLabel("approved"), 
        variant: "success", 
        dot: "bg-success-green dark:bg-success-green-light" 
      };
    }
    if (status.review === "needs_work") {
      return { 
        label: reviewLabel("needs_work"), 
        variant: "warning", 
        dot: "bg-warning-orange dark:bg-warning-orange-light" 
      };
    }
    return { 
      label: reviewLabel("submitted"), 
      variant: "info", 
      dot: "bg-interactive-blue dark:bg-interactive-blue-light" 
    };
  }

  if (status.due === "overdue") {
    return { 
      label: dueLabel("overdue"), 
      variant: "destructive", 
      dot: "bg-status-error" 
    };
  }
  if (status.due === "due-soon") {
    return { 
      label: dueLabel("due-soon"), 
      variant: "warning", 
      dot: "bg-warning-orange dark:bg-warning-orange-light" 
    };
  }
  return { 
    label: dueLabel("upcoming"), 
    variant: "outline", 
    dot: "bg-gray-400" 
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
  const { label, variant, dot } = content(assignmentStatus(reviewStatus, dueAt));
  return (
    <Badge
      variant={variant}
      className="gap-1.5 shadow-none rounded-[6px] px-2 py-0.5 text-[13px] font-normal border border-transparent"
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </Badge>
  );
}
