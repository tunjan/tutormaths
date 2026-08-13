import { ArrowDown, CircleCheck } from "lucide-react";
import { Link } from "next-view-transitions";
import { AssignmentRow } from "@/components/assignment-row";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import type { BrowserItem } from "@/components/tutor-assignment-browser";
import { cn } from "@/lib/utils";

type MetricTone = "neutral" | "warning" | "danger";

type DashboardMetric = {
  label: string;
  value: number | string;
  detail: string;
  tone?: MetricTone;
};

export function TutorDashboardOverview({
  focusItems,
  activeItems,
  activeCount,
  awaitingCount,
  overdueCount,
  pendingInviteCount,
  averageProgress,
}: {
  focusItems: BrowserItem[];
  activeItems: BrowserItem[];
  activeCount: number;
  awaitingCount: number;
  overdueCount: number;
  pendingInviteCount: number;
  averageProgress: number;
}) {
  const startedCount = activeItems.filter(
    (item) => item.completion_pct > 0 || item.review_status !== "assigned",
  ).length;
  const hasPriorityWork = focusItems.length > 0;
  const queue = (hasPriorityWork ? focusItems : activeItems).slice(0, 4);
  const learnerProgress = summarizeLearners(activeItems).slice(0, 4);

  // Student count and average progress live in the learner card below, so the
  // metric row carries only what the tutor can act on.
  const metrics: DashboardMetric[] = [
    {
      label: "Active work",
      value: activeCount,
      detail: `${startedCount} started`,
    },
    {
      label: "Awaiting review",
      value: awaitingCount,
      detail: awaitingCount > 0 ? "Feedback needed" : "Nothing waiting",
      tone: awaitingCount > 0 ? "warning" : "neutral",
    },
    {
      label: "Overdue",
      value: overdueCount,
      detail: overdueCount > 0 ? "Follow up needed" : "On schedule",
      tone: overdueCount > 0 ? "danger" : "neutral",
    },
  ];

  return (
    <section
      className="mb-8 flex flex-col gap-4"
      aria-labelledby="dashboard-overview-heading"
    >
      <h2 id="dashboard-overview-heading" className="sr-only">
        Dashboard overview
      </h2>

      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        {metrics.map((metric) => (
          <Metric key={metric.label} metric={metric} />
        ))}
      </dl>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)]">
        <Card
          className="min-w-0 gap-0 rounded-md border-border bg-surface-raised p-0 shadow-none"
          aria-labelledby="priority-queue-heading"
        >
          <CardHeader className="border-b border-border px-5 py-4">
            <h3
              id="priority-queue-heading"
              className="whitespace-nowrap text-heading-md text-foreground"
            >
              Priority queue
            </h3>
            <CardDescription className="text-pretty text-body">
              {hasPriorityWork
                ? "Submissions and overdue work to handle first."
                : "The next active assignments by due date."}
            </CardDescription>
            <CardAction>
              {/* Neutral: the count is already tallied in the metrics above,
                  and the rows below carry their own status colour. */}
              <Badge variant={hasPriorityWork ? "secondary" : "outline"}>
                {hasPriorityWork ? `${focusItems.length} to check` : "On track"}
              </Badge>
            </CardAction>
          </CardHeader>

          <CardContent className="min-w-0 flex-1 p-0">
            {queue.length > 0 ? (
              <div className="divide-y divide-border-muted border-b border-border">
                {queue.map((item) => (
                  <AssignmentRow
                    key={item.id}
                    href={`/tutor/assignments/${item.id}`}
                    title={item.title}
                    type={item.type}
                    dueAt={item.due_at}
                    pct={item.completion_pct}
                    reviewStatus={item.review_status}
                    student={item.student}
                    unread={item.unread}
                    className="px-5 py-3"
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-28 items-center gap-3 border-b border-border px-5 py-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-bg-success text-content-success">
                  <CircleCheck className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="text-label text-foreground">Nothing is waiting</p>
                  <p className="mt-1 text-pretty text-caption text-muted-foreground">
                    New assignments will appear here automatically.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <div className="mt-auto flex items-center justify-between gap-4 px-5 py-2.5">
            <span className="text-caption text-content-subtle">
              Sorted by urgency
            </span>
            <Link
              href="#assignments-heading"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View assignments
              <ArrowDown data-icon="inline-end" aria-hidden />
            </Link>
          </div>
        </Card>

        <Card
          className="min-w-0 gap-0 rounded-md border-border bg-surface-raised p-0 shadow-none"
          aria-labelledby="learner-progress-heading"
        >
          <CardHeader className="border-b border-border px-5 py-4">
            <h3
              id="learner-progress-heading"
              className="whitespace-nowrap text-heading-md text-foreground"
            >
              Learner progress
            </h3>
            <CardDescription className="text-body">
              Average across active assignments.
            </CardDescription>
            <CardAction>
              <Link
                href="/tutor/students"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "px-2 text-caption",
                )}
              >
                {pendingInviteCount > 0
                  ? `Students · ${pendingInviteCount} pending`
                  : "Students"}
              </Link>
            </CardAction>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col p-5">
            {learnerProgress.length > 0 ? (
              <>
                <div className="border-b border-border pb-4">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-eyebrow text-content-subtle">
                        Class average
                      </p>
                      <p className="mt-0.5 truncate text-caption text-content-muted">
                        {activeCount} active assignment
                        {activeCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="text-heading-md tabular-nums text-foreground">
                      {averageProgress}%
                    </p>
                  </div>
                  <Progress
                    value={averageProgress}
                    className="mt-2.5 gap-0 [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:bg-border"
                    aria-label={`${averageProgress}% class average progress`}
                  />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-eyebrow text-content-subtle">
                      Student
                    </p>
                    <p className="font-eyebrow text-content-subtle">
                      Average
                    </p>
                  </div>
                  <div className="mt-1.5 divide-y divide-border-muted">
                    {learnerProgress.map((learner) => (
                      <Progress
                        key={learner.name}
                        value={learner.average}
                        className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-2.5 [&_[data-slot=progress-track]]:col-span-2 [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:bg-border"
                        aria-label={`${learner.name} average progress`}
                      >
                        <ProgressLabel className="flex min-w-0 items-baseline gap-1.5">
                          <span className="truncate text-caption text-foreground">
                            {learner.name}
                          </span>
                          <span className="shrink-0 text-caption text-content-muted">
                            · {learner.assignments} active
                          </span>
                        </ProgressLabel>
                        <ProgressValue className="self-start text-caption text-foreground" />
                      </Progress>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-32 flex-1 items-center justify-center text-center">
                <p className="max-w-56 text-pretty text-body text-muted-foreground">
                  Learner progress will appear when assignments are active.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({ metric }: { metric: DashboardMetric }) {
  return (
    <div className="min-w-0 bg-surface-raised px-4 py-3.5">
      <dt className="font-eyebrow text-muted-foreground">{metric.label}</dt>
      {/* The value carries the tone on its own — a coloured dot and a coloured
          caption alongside it made every tile read as an alarm. */}
      <div className="mt-2 flex min-w-0 items-baseline justify-between gap-3 lg:block xl:flex">
        <dd
          className={cn(
            "text-heading-md tabular-nums",
            metric.tone === "warning"
              ? "text-content-warning"
              : metric.tone === "danger"
                ? "text-content-error"
                : "text-foreground",
          )}
        >
          {metric.value}
        </dd>
        <p className="min-w-0 text-caption text-muted-foreground lg:mt-0.5 xl:mt-0">
          {metric.detail}
        </p>
      </div>
    </div>
  );
}

function summarizeLearners(items: BrowserItem[]) {
  const totals = new Map<string, { count: number; progress: number }>();

  items.forEach((item) => {
    const current = totals.get(item.student) ?? { count: 0, progress: 0 };
    current.count += 1;
    current.progress += item.completion_pct;
    totals.set(item.student, current);
  });

  return Array.from(totals, ([name, value]) => ({
    name,
    assignments: value.count,
    average: Math.round(value.progress / value.count),
  })).sort(
    (a, b) =>
      b.assignments - a.assignments || a.name.localeCompare(b.name),
  );
}
