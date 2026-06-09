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

/** A stable, pleasant avatar tint derived from the name — gives each student a
 *  recognisable colour, in the spirit of the reference's coloured avatars. */
function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `oklch(0.62 0.13 ${hue})`;
}

/** Progress fill colour by completion — amber getting going, cobalt underway,
 *  green when done. */
function barTone(pct: number): string {
  if (pct >= 100) return "var(--success)";
  if (pct >= 50) return "var(--primary)";
  if (pct > 0) return "oklch(0.7 0.14 75)";
  return "var(--line-strong)";
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
      className="group flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-accent active:bg-accent/70"
    >
      {student ? (
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ring-2 ring-card"
          style={{ backgroundColor: tintFor(student) }}
        >
          {initials(student)}
        </span>
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <TypeIcon className="size-[1.05rem]" />
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
          className="mt-0.5 truncate text-sm text-ink-faint"
          title={formatDateTime(dueAt)}
        >
          {meta}
        </p>
      </div>

      {showBar && (
        <div className="hidden w-28 items-center gap-2 md:flex">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border">
            <span
              className="block h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, backgroundColor: barTone(pct) }}
            />
          </span>
          <span className="tabular w-8 shrink-0 text-right text-xs text-muted-foreground">
            {pct}%
          </span>
        </div>
      )}

      <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
      <ChevronRight className="size-4 shrink-0 text-ink-faint/50 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-faint" />
    </Link>
  );
}
