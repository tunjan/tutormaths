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

/**
 * "Awaiting review" — frosted blue pill with a pulsing dot to signal action
 * is required from the tutor. The animation adds urgency without alarm.
 */
function AwaitingReviewChip() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-2.5 py-[3px] text-[12px] font-medium tracking-wide text-blue-700 dark:border-blue-800 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300">
      {/* pulsing indicator */}
      <span className="relative flex size-[6px] shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60 dark:bg-blue-500 [animation-duration:1.8s]" />
        <span className="relative inline-flex size-[6px] rounded-full bg-blue-500 dark:bg-blue-400" />
      </span>
      Awaiting review
    </span>
  );
}

/**
 * "Due Soon" — warm amber pill. The solid amber dot mirrors a clock ticking.
 * Gradient gives it a subtle warmth without being alarming.
 */
function DueSoonChip() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 px-2.5 py-[3px] text-[12px] font-medium tracking-wide text-amber-800 dark:border-amber-700 dark:from-amber-950 dark:to-yellow-950 dark:text-amber-300">
      <span
        className="size-[6px] shrink-0 rounded-full bg-amber-400 dark:bg-amber-500"
        aria-hidden
      />
      Due soon
    </span>
  );
}

/**
 * "Upcoming" — clean slate pill. Quiet confidence: not urgent, not inert.
 * Slate tones keep it neutral and readable in both light and dark modes.
 */
function UpcomingChip() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-2.5 py-[3px] text-[12px] font-medium tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      <span
        className="size-[6px] shrink-0 rounded-full bg-slate-300 dark:bg-slate-600"
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
  variant: "success" | "warning" | "destructive";
  dot: string;
};

function genericContent(status: AssignmentStatus): GenericContent | null {
  if (status.kind === "review") {
    if (status.review === "approved") {
      return {
        label: reviewLabel("approved"),
        variant: "success",
        dot: "bg-green-500 dark:bg-green-400",
      };
    }
    if (status.review === "needs_work") {
      return {
        label: reviewLabel("needs_work"),
        variant: "warning",
        dot: "bg-orange-400 dark:bg-orange-300",
      };
    }
    // submitted → handled by bespoke chip above
    return null;
  }

  if (status.due === "overdue") {
    return {
      label: dueLabel("overdue"),
      variant: "destructive",
      dot: "bg-red-500",
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
      className="gap-1.5 shadow-none rounded-[6px] px-2 py-0.5 text-[13px] font-normal border border-transparent"
    >
      <span className={`size-1.5 rounded-full ${generic.dot}`} aria-hidden />
      {generic.label}
    </Badge>
  );
}
