"use client";

import { Link } from "next-view-transitions";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import {
  type ReviewStatus,
  formatDateTime,
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
  /** Shown only on the tutor's multi-student lists. */
  student?: string;
  /** True when there is unread activity (comment/submission/review) for the viewer. */
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
      className="group relative flex items-center gap-5 py-4 px-3 -mx-3 rounded-lg transition-colors duration-150 hover:bg-accent/30"
    >
      <div className="shrink-0 relative">
        {student ? (
          <span className="grid size-9 place-items-center rounded-full bg-secondary/50 text-[11px] font-semibold text-foreground">
            {initials(student)}
          </span>
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-secondary/40 text-muted-foreground group-hover:text-foreground transition-colors">
            <TypeIcon className="size-4" strokeWidth={1.5} />
          </span>
        )}

        {unread && (
          <span
            className="absolute -top-1 -right-1 size-2 rounded-full bg-foreground"
            aria-label="Unread activity"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 w-full max-w-sm">
          <h3 className="text-[15px] font-medium text-foreground truncate">
            {title}
          </h3>
          <span className="text-[13px] text-muted-foreground truncate">
            {meta}
          </span>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {showBar && (
            <div className="hidden sm:flex items-center gap-3">
              <span className="h-[2px] w-16 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full bg-foreground transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {pct}%
              </span>
            </div>
          )}
          
          <div className="hidden sm:block">
            <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
          </div>
          
          <ChevronRight className="size-4 text-muted-foreground/30 transition-all group-hover:text-foreground group-hover:translate-x-0.5" strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
