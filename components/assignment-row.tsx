"use client";

import { Link } from "next-view-transitions";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import {
  type ReviewStatus,
  relativeTime,
  typeLabel,
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
  type,
  dueAt,
  pct,
  reviewStatus,
  student,
  unread,
}: AssignmentRowProps) {
  const dueText =
    reviewStatus === "approved" ? "completed" : `due ${relativeTime(dueAt)}`;
  const meta = [student, typeLabel(type), dueText].filter(Boolean).join(" · ");
  const showBar = pct > 0 && pct < 100 && reviewStatus !== "approved";
  const TypeIcon = type === "reading_notes" ? BookOpen : FileText;

  return (
    <Link
      href={href}
      className="group relative flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-surface-hover"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="shrink-0 relative">
          {student ? (
            <span className="grid size-9 place-items-center rounded-full bg-surface-muted border border-border-strong text-xs font-semibold text-foreground">
              {initials(student)}
            </span>
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-surface-muted border border-border-strong text-muted-foreground transition-colors group-hover:text-foreground">
              <TypeIcon className="size-4" strokeWidth={1.5} />
            </span>
          )}

          {unread && (
            <span
              className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-status-overdue border-2 border-surface-raised"
              aria-label="Unread activity"
            />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold text-text-heading">
            {title}
          </h3>
          <span className="truncate text-[13px] text-text-muted">
            {meta}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        {showBar && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="h-[4px] w-12 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="font-mono text-[11px] text-text-muted">
              {pct}%
            </span>
          </div>
        )}
        
        <div className="hidden sm:block">
          <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
        </div>
        
        <ChevronRight className="size-4 text-muted-foreground/40 transition-all group-hover:text-foreground group-hover:translate-x-0.5" strokeWidth={2} />
      </div>
    </Link>
  );
}
