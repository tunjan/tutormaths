import {
  CheckCircle2,
  Clock3,
  Inbox,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import { Link } from "next-view-transitions";
import type { BrowserItem } from "@/components/tutor-assignment-browser";
import { cn } from "@/lib/utils";

export interface TutorAssignmentSummaryProps {
  items: BrowserItem[];
  nowMs: number;
}

type SummaryTone = "default" | "info" | "error" | "success";

const numberFormatter = new Intl.NumberFormat("en-GB");

const toneClasses: Record<SummaryTone, string> = {
  default: "bg-bg-subtle text-content-default",
  info: "bg-bg-info text-content-info",
  error: "bg-bg-error text-content-error",
  success: "bg-bg-success text-content-success",
};

function isOpen(item: BrowserItem) {
  return (
    item.review_status === "assigned" || item.review_status === "needs_work"
  );
}

export function TutorAssignmentSummary({
  items,
  nowMs,
}: TutorAssignmentSummaryProps) {
  const counts = items.reduce(
    (summary, item) => {
      if (item.review_status === "submitted") {
        summary.awaiting += 1;
      } else if (item.review_status === "approved") {
        summary.approved += 1;
      } else if (isOpen(item)) {
        if (new Date(item.due_at).getTime() < nowMs) summary.overdue += 1;
        else summary.active += 1;
      }

      return summary;
    },
    { awaiting: 0, overdue: 0, active: 0, approved: 0 },
  );

  return (
    <section
      aria-labelledby="assignment-summary-heading"
      className="mb-5 overflow-hidden rounded-md border border-card-edge bg-border-subtle shadow-xs"
    >
      <h2 id="assignment-summary-heading" className="sr-only">
        Assignment overview
      </h2>
      <ul className="grid min-w-0 grid-cols-2 gap-px sm:grid-cols-4">
        <SummaryLink
          href="/tutor/assignments?view=attention"
          label="To review"
          count={counts.awaiting}
          icon={Inbox}
          tone="info"
        />
        <SummaryLink
          href="/tutor/assignments?view=attention"
          label="Overdue"
          count={counts.overdue}
          icon={Clock3}
          tone="error"
        />
        <SummaryLink
          href="/tutor/assignments?view=active"
          label="Active"
          count={counts.active}
          icon={ListTodo}
          tone="default"
        />
        <SummaryLink
          href="/tutor/assignments?view=completed"
          label="Approved"
          count={counts.approved}
          icon={CheckCircle2}
          tone="success"
        />
      </ul>
    </section>
  );
}

function SummaryLink({
  href,
  label,
  count,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  count: number;
  icon: LucideIcon;
  tone: SummaryTone;
}) {
  return (
    <li className="min-w-0 bg-card">
      <Link
        href={href}
        aria-label={`${label}: ${count} ${count === 1 ? "assignment" : "assignments"}`}
        className="group flex min-h-14 min-w-0 items-center gap-2 px-2 py-2 transition-colors hover:bg-bg-muted/65 sm:gap-2.5 sm:px-4"
      >
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-sm sm:size-8",
            toneClasses[tone],
          )}
          aria-hidden
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 truncate text-label text-content-emphasis">
          {label}
        </span>
        <span className="shrink-0 font-metric text-metric tabular-nums text-foreground">
          {numberFormatter.format(count)}
        </span>
      </Link>
    </li>
  );
}
