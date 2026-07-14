"use client";

import { Link } from "next-view-transitions";
import { ChevronRight } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import {
  type ReviewStatus,
  relativeTime,
} from "@/lib/format";

export interface AssignmentRowProps {
  href: string;
  title: string;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  pct: number;
  reviewStatus: ReviewStatus;
  student?: string;
  unread?: boolean;
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
  dueAt,
  pct,
  reviewStatus,
  student,
  unread,
}: AssignmentRowProps) {
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
    student,
    stateText,
    reviewStatus === "needs_work" ? dueText : null,
    progressText,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={href}
      className="group relative flex items-center justify-between gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-surface-hover sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative shrink-0">
          <span className="grid size-8 place-items-center rounded-full border border-border-subtle bg-surface-muted text-[11px] font-semibold text-content-default">
            {student ? initials(student) : "—"}
          </span>

          {unread && (
            <span
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-surface-raised bg-status-review"
              aria-label="Unread activity"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold text-text-heading">
            {title}
          </h3>
          <span className="truncate text-xs text-content-subtle">
            {meta}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden sm:block">
          <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
        </div>

        <ChevronRight
          className="hidden size-4 text-muted-foreground/35 transition-colors group-hover:text-foreground sm:block"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}
