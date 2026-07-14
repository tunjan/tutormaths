import { Badge } from "@/components/ui/badge";
import {
  type AssignmentStatus,
  type ReviewStatus,
  assignmentStatus,
  dueLabel,
  reviewLabel,
} from "@/lib/format";

/* -------------------------------------------------------------------------- */
/*  Bespoke chips for the three highlighted states                             */
/* -------------------------------------------------------------------------- */

function AwaitingReviewChip() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-status-review-border bg-status-review-bg px-2 py-0.5 text-xs font-medium text-status-review">
      <span className="size-[6px] shrink-0 rounded-full bg-status-review" aria-hidden />
      Awaiting review
    </span>
  );
}

/**
 * "Due soon" uses the attention pair because the student has something to do.
 */
function DueSoonChip() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-status-due-border bg-status-due-bg px-2 py-0.5 text-xs font-medium text-status-due">
      <span
        className="size-[6px] shrink-0 rounded-full bg-status-due"
        aria-hidden
      />
      Due soon
    </span>
  );
}

/**
 * "Upcoming" stays neutral so it does not compete with action states.
 */
function UpcomingChip() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border-subtle bg-bg-subtle px-2.5 py-[3px] text-xs font-medium text-content-subtle">
      <span
        className="size-[6px] shrink-0 rounded-full bg-content-subtle/55"
        aria-hidden
      />
      Upcoming
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Generic content helper for the remaining states                           */
/* -------------------------------------------------------------------------- */

type GenericContent = {
  label: string;
  variant: "success" | "accent-alt" | "destructive";
  dot: string;
};

function genericContent(status: AssignmentStatus): GenericContent | null {
  if (status.kind === "review") {
    if (status.review === "approved") {
      return {
        label: reviewLabel("approved"),
        variant: "success",
        dot: "bg-content-success",
      };
    }
    if (status.review === "needs_work") {
      return {
        label: reviewLabel("needs_work"),
        variant: "accent-alt",
        dot: "bg-content-attention",
      };
    }
    // submitted → handled by bespoke chip above
    return null;
  }

  if (status.due === "overdue") {
    return {
      label: dueLabel("overdue"),
      variant: "destructive",
      dot: "bg-content-error",
    };
  }

  // due-soon / upcoming → handled by bespoke chips
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Public component                                                           */
/* -------------------------------------------------------------------------- */

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
  const status = assignmentStatus(reviewStatus, dueAt);

  // Bespoke chips for the three featured states
  if (status.kind === "review" && status.review === "submitted") {
    return <AwaitingReviewChip />;
  }
  if (status.kind === "due" && status.due === "due-soon") {
    return <DueSoonChip />;
  }
  if (status.kind === "due" && status.due === "upcoming") {
    return <UpcomingChip />;
  }

  // Fallback to generic Badge for approved / needs_work / overdue
  const generic = genericContent(status);
  if (!generic) return null;

  return (
    <Badge
      variant={generic.variant}
      className="gap-1.5 shadow-none"
    >
      <span className={`size-1.5 rounded-full ${generic.dot}`} aria-hidden />
      {generic.label}
    </Badge>
  );
}
