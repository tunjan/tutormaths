import { Link } from "next-view-transitions";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { AssignmentRow } from "@/components/assignment-row";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, relativeTime, typeLabel } from "@/lib/format";

export default async function StudentDashboard() {
  await requireStudent();
  const supabase = await createClient();

  const [{ data: assignments }, unread] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, type, due_at, completion_pct, review_status")
      .order("due_at", { ascending: true }),
    unreadAssignmentIds(),
  ]);

  const all = assignments ?? [];
  const active = all.filter((a) => a.review_status !== "approved");
  const completed = all.filter((a) => a.review_status === "approved");
  const actionable = active.filter(
    (a) => a.review_status === "assigned" || a.review_status === "needs_work",
  );
  const nextAssignment = actionable[0] ?? active[0];
  const remainingActive = nextAssignment
    ? active.filter((a) => a.id !== nextAssignment.id)
    : [];

  return (
    <div className="w-full py-2 animate-rise">
      <PageHeader
        title="My practice"
        description="Your assignments, with progress you control."
        actions={<RequestHomeworkButton />}
      />

      {nextAssignment ? (
        <UpNextCard
          assignment={nextAssignment}
          unread={unread.has(nextAssignment.id)}
        />
      ) : (
        <div className="rounded-[12px] border border-border-soft bg-surface-paper p-6 text-center shadow-[var(--shadow-sm)]">
          <h2 className="text-xl font-semibold tracking-tight text-text-heading">
            Nothing due right now
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
            {completed.length > 0
              ? "You are caught up. Request more practice when you are ready."
              : "Request practice from your tutor when you are ready for work."}
          </p>
          <div className="mt-5 flex justify-center">
            <RequestHomeworkButton />
          </div>
        </div>
      )}

      {nextAssignment && (
        <>
          <div className="mb-4 mt-10 flex items-baseline justify-between border-b border-border-strong pb-3">
            <h2 className="text-h4 font-semibold tracking-tight text-foreground">Active Tasks</h2>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {remainingActive.length} more
            </span>
          </div>

          {remainingActive.length > 0 ? (
            <div className="mb-10 flex flex-col overflow-hidden rounded-[12px] border border-border-strong bg-surface-raised shadow-[var(--shadow-sm)] divide-y divide-border-strong stagger-children">
              {remainingActive.map((a) => (
                <div key={a.id} className="animate-fade-in">
                  <AssignmentRow
                    href={`/student/assignments/${a.id}`}
                    title={a.title}
                    type={a.type}
                    dueAt={a.due_at}
                    pct={a.completion_pct}
                    reviewStatus={a.review_status}
                    unread={unread.has(a.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-10 rounded-[12px] border border-border-soft bg-surface-muted p-5 text-center text-sm text-text-muted">
              That is your only active task.
            </p>
          )}
        </>
      )}

      {completed.length > 0 && (
        <div className="animate-fade-in mt-10" style={{ animationDelay: '100ms' }}>
          <div className="mb-4 flex items-baseline justify-between border-b border-border-strong pb-3">
            <h2 className="text-h4 font-semibold tracking-tight text-foreground">Completed</h2>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {completed.length} task{completed.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden rounded-[12px] border border-border-strong bg-surface-raised shadow-[var(--shadow-sm)] divide-y divide-border-strong stagger-children">
            {completed.map((a) => (
              <div key={a.id} className="animate-fade-in">
                <AssignmentRow
                  href={`/student/assignments/${a.id}`}
                  title={a.title}
                  type={a.type}
                  dueAt={a.due_at}
                  pct={a.completion_pct}
                  reviewStatus={a.review_status}
                  unread={unread.has(a.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Calm, monochrome backdrop patterns for the "Up next" card's side panel.
 * One is picked at random per render so the hero feels alive without adding
 * colour or noise — every variant stays within the paper/gray palette.
 */
const CARD_PATTERNS: React.CSSProperties[] = [
  {
    backgroundImage:
      "linear-gradient(135deg, var(--surface-muted) 25%, transparent 25%), linear-gradient(225deg, var(--surface-muted) 25%, transparent 25%), linear-gradient(45deg, var(--surface-muted) 25%, transparent 25%), linear-gradient(315deg, var(--surface-muted) 25%, var(--surface-paper) 25%)",
    backgroundSize: "18px 18px",
    backgroundPosition: "9px 0, 9px 0, 0 0, 0 0",
  },
  {
    backgroundImage: "radial-gradient(var(--border-strong) 1.4px, transparent 1.5px)",
    backgroundSize: "16px 16px",
  },
  {
    backgroundImage:
      "repeating-linear-gradient(45deg, var(--surface-muted) 0, var(--surface-muted) 1.5px, transparent 1.5px, transparent 11px)",
  },
  {
    backgroundImage:
      "linear-gradient(var(--surface-muted) 1px, transparent 1px), linear-gradient(90deg, var(--surface-muted) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
  },
  {
    backgroundImage:
      "repeating-linear-gradient(0deg, var(--border-soft) 0 1px, transparent 1px 13px), repeating-linear-gradient(90deg, var(--border-soft) 0 1px, transparent 1px 13px)",
  },
];

function UpNextCard({
  assignment,
  unread,
}: {
  assignment: {
    id: string;
    title: string;
    type: "problem_set" | "reading_notes";
    due_at: string;
    completion_pct: number;
    review_status: "assigned" | "submitted" | "approved" | "needs_work";
  };
  unread: boolean;
}) {
  // Pick a backdrop from the id so each task keeps its own pattern across
  // renders (stable, no hydration drift) while the set still feels varied.
  const patternSeed = Array.from(assignment.id).reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0,
  );
  const pattern = CARD_PATTERNS[patternSeed % CARD_PATTERNS.length];

  return (
    <section className="relative overflow-hidden rounded-[16px] border border-border-strong bg-surface-paper shadow-[var(--shadow-sm)]">
      <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
        <div className="p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-raised px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-subtle">
              <CalendarClock className="size-3.5" />
              Up next
            </span>
            {unread && (
              <span className="rounded-full bg-status-overdue-bg px-2.5 py-1 text-xs font-medium text-status-overdue">
                New activity
              </span>
            )}
            <AssignmentStatusBadge
              reviewStatus={assignment.review_status}
              dueAt={assignment.due_at}
            />
          </div>

          <h2 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-text-heading sm:text-3xl">
            {assignment.title}
          </h2>
          <p className="mt-3 text-sm text-text-muted">
            {typeLabel(assignment.type)} · due {relativeTime(assignment.due_at)} ·{" "}
            {formatDateTime(assignment.due_at)}
          </p>

          <div className="mt-6 w-full max-w-[220px]">
            <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-text-subtle">
              <span>Progress</span>
              <span className="font-mono">{assignment.completion_pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border-soft">
              <span
                className="block h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${assignment.completion_pct}%` }}
              />
            </div>
          </div>
        </div>

        <div
          className="hidden w-48 border-l border-border-soft bg-surface-paper lg:block"
          style={pattern}
        />
      </div>

      <Link
        href={`/student/assignments/${assignment.id}`}
        aria-label={`Open task: ${assignment.title}`}
        className="group absolute bottom-5 right-5 z-10 inline-flex size-12 items-center justify-center rounded-full border border-border-strong bg-primary text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-200 hover:scale-105 hover:shadow-[var(--shadow-lg)] focus-visible:scale-105"
      >
        <ArrowUpRight className="size-5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
