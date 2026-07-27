"use client";

import { Link } from "next-view-transitions";
import { BookOpenText, ChevronRight, ListChecks } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import {
  type ReviewStatus,
  relativeTime,
  typeLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export interface AssignmentRowProps {
  href: string;
  title: string;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  pct: number;
  reviewStatus: ReviewStatus;
  student?: string;
  unread?: boolean;
  showTypeMarker?: boolean;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AssignmentRow({
  href,
  title,
  type,
  dueAt,
  pct,
  reviewStatus,
  student,
  unread,
  showTypeMarker = false,
}: AssignmentRowProps) {
  const AssignmentTypeIcon =
    type === "reading_notes" ? BookOpenText : ListChecks;
  const dueText =
    reviewStatus === "approved" ? "completed" : `due ${relativeTime(dueAt)}`;
  const stateText =
    reviewStatus === "submitted"
      ? "awaiting review"
      : reviewStatus === "needs_work"
        ? "needs changes"
        : dueText;
  const progressText =
    pct > 0 && pct < 100 && reviewStatus !== "approved"
      ? `${pct}% complete`
      : null;
  const meta = [
    student ?? (showTypeMarker ? typeLabel(type) : null),
    stateText,
    reviewStatus === "needs_work" ? dueText : null,
    progressText,
  ]
    .filter(Boolean)
    .join(showTypeMarker ? " / " : " · ");

  return (
    <Link
      href={href}
      className="group relative flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-6 focus-visible:outline-none focus-visible:bg-muted/60"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative shrink-0">
          <span
            className={cn(
              "grid place-items-center border text-xs font-semibold",
              showTypeMarker
                ? "size-9 rounded-sm border-border bg-muted/60 text-foreground"
                : "size-8 rounded-full border-border bg-muted text-foreground",
            )}
          >
            {student ? (
              initials(student)
            ) : showTypeMarker ? (
              <AssignmentTypeIcon
                className="size-4"
                strokeWidth={1.75}
                aria-hidden
              />
            ) : (
              "—"
            )}
          </span>

          {unread && (
            <span
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-card bg-accent-9"
              aria-label="Unread activity"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h3>
          <span className="truncate text-xs text-muted-foreground">
            {meta}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden sm:block">
          <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
        </div>

        <ChevronRight
          className="hidden size-4 text-muted-foreground/40 transition-colors group-hover:text-foreground sm:block"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}
