import { Link } from "next-view-transitions";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import {
  type ReviewStatus,
  formatDateTime,
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

  // A calm card-row: a leading identity tile (the student's initials on the
  // tutor's lists, otherwise a quiet type glyph), the title and metadata, then
  // an optional progress track and the single dominant status chip.
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-accent active:bg-accent/70"
    >
      {student ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
          {initials(student)}
        </span>
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <TypeIcon className="size-4" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {unread && (
            <span
              className="pulse-glow size-2 shrink-0 rounded-full bg-primary"
              aria-label="Unread activity"
            />
          )}
          <span className="truncate text-[0.95rem] font-medium text-foreground">
            {title}
          </span>
        </div>
        <p
          className="mt-0.5 truncate text-sm text-muted-foreground"
          title={formatDateTime(dueAt)}
        >
          {meta}
        </p>
      </div>

      {showBar && (
        <div className="hidden w-28 items-center gap-2 md:flex">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="progress-gradient block h-full rounded-full"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="w-8 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
            {pct}%
          </span>
        </div>
      )}

      <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
    </Link>
  );
}
