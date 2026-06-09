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

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 py-3 transition-opacity duration-150 hover:opacity-70"
    >
      {student ? (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium text-foreground ring-1 ring-border/50">
          {initials(student)}
        </span>
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border/40 bg-secondary/20 text-muted-foreground">
          <TypeIcon className="size-4" strokeWidth={1.5} />
        </span>
      )}

      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-2">
          {unread && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-foreground"
              aria-label="Unread activity"
            />
          )}
          <span className="truncate text-base font-normal text-foreground">
            {title}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span
            className="truncate text-sm text-muted-foreground"
            title={formatDateTime(dueAt)}
          >
            {meta}
          </span>
          {showBar && (
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-12 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full bg-foreground transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="tabular text-xs font-medium text-muted-foreground">
                {pct}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
        <ChevronRight
          className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/60"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  );
}
