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
      className="group relative flex items-center justify-between gap-4 py-4 px-5 transition-colors duration-200 hover:bg-[#f5f5f5] dark:hover:bg-[#171717]"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="shrink-0 relative">
          {student ? (
            <span className="grid size-9 place-items-center rounded-full bg-[#fafafa] dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-xs font-semibold text-foreground">
              {initials(student)}
            </span>
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-[#fafafa] dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-muted-foreground group-hover:text-foreground transition-colors">
              <TypeIcon className="size-4" strokeWidth={1.5} />
            </span>
          )}

          {unread && (
            <span
              className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[#ef4444] border-2 border-white dark:border-[#0a0a0a]"
              aria-label="Unread activity"
            />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-[#fafafa] truncate">
            {title}
          </h3>
          <span className="text-[13px] text-[#525252] dark:text-[#a3a3a3] truncate">
            {meta}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        {showBar && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="h-[4px] w-12 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full bg-[#000000] dark:bg-[#ffffff] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="font-mono text-[11px] text-[#525252] dark:text-[#a3a3a3]">
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
