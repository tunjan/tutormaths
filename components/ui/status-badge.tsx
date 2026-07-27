import { Badge } from "@/components/ui/badge";
import {
  type AssignmentStatus,
  type ReviewStatus,
  assignmentStatus,
  dueLabel,
  reviewLabel,
} from "@/lib/format";
import { Clock, CheckCircle2, AlertCircle, AlertTriangle, Calendar } from "lucide-react";

type StatusContent = {
  label: string;
  variant: "default" | "success" | "warning" | "destructive" | "info" | "secondary";
  icon: React.ComponentType<{ className?: string }>;
  dot: string;
};

function statusContent(status: AssignmentStatus): StatusContent {
  if (status.kind === "review") {
    if (status.review === "submitted") {
      return {
        label: "Awaiting review",
        variant: "info",
        icon: Clock,
        dot: "bg-content-info",
      };
    }

    if (status.review === "approved") {
      return {
        label: reviewLabel("approved"),
        variant: "success",
        icon: CheckCircle2,
        dot: "bg-content-success",
      };
    }

    return {
      label: reviewLabel("needs_work"),
      variant: "warning",
      icon: AlertTriangle,
      dot: "bg-content-warning",
    };
  }

  if (status.due === "overdue") {
    return {
      label: dueLabel("overdue"),
      variant: "destructive",
      icon: AlertCircle,
      dot: "bg-content-error",
    };
  }

  if (status.due === "due-soon") {
    return {
      label: "Due soon",
      variant: "warning",
      icon: AlertTriangle,
      dot: "bg-content-warning",
    };
  }

  return {
    label: "Upcoming",
    variant: "secondary",
    icon: Calendar,
    dot: "bg-content-muted",
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
  const Icon = content.icon;

  return (
    <Badge variant={content.variant} className="gap-1 px-2 py-0.5">
      <Icon className="size-3 shrink-0" aria-hidden />
      {content.label}
    </Badge>
  );
}

