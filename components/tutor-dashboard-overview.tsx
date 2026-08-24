import type { ReactNode } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
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

export function TutorDashboardOverview({
  focusItems,
  activeItems,
  activeCount,
  awaitingCount,
  overdueCount,
}: {
  focusItems: BrowserItem[];
  activeItems: BrowserItem[];
  activeCount: number;
  awaitingCount: number;
  overdueCount: number;
}) {
  const startedCount = activeItems.filter(
    (item) => item.completion_pct > 0 || item.review_status !== "assigned",
  ).length;
  const hasPriorityWork = focusItems.length > 0;
  const queue = (hasPriorityWork ? focusItems : activeItems).slice(0, 3);
  const learnerSummaries = summarizeLearners(activeItems);
  const learnerProgress = learnerSummaries.slice(0, 3);
  const averageProgress = learnerSummaries.length
    ? Math.round(
        learnerSummaries.reduce((total, learner) => total + learner.average, 0) /
          learnerSummaries.length,
      )
    : 0;
  const learnerSummary = learnerSummaries.length > learnerProgress.length
    ? `Lowest progress first · ${learnerProgress.length} of ${learnerSummaries.length} shown.`
    : "Lowest progress first.";

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="dashboard-overview-heading"
    >
      <h2 id="dashboard-overview-heading" className="sr-only">
        Dashboard overview
      </h2>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)]">
        <Metric
          label="Need attention"
          value={focusItems.length}
          detail={
            hasPriorityWork ? (
              <>
                <span className="text-content-info">
                  {awaitingCount} awaiting review
                </span>
                <span className="text-content-muted" aria-hidden>
                  ·
                </span>
                <span className="text-content-error">
                  {overdueCount} overdue
                </span>
              </>
            ) : (
              "No follow-up needed"
            )
          }
        />
        <Metric
          label="Open assignments"
          value={activeCount}
          detail={`${startedCount} started`}
        />
      </dl>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <Card
          className="min-w-0 gap-0 bg-surface-raised p-0"
          aria-labelledby="priority-queue-heading"
        >
          <CardHeader className="px-5 pt-4 pb-3">
            <h3
              id="priority-queue-heading"
              className="text-heading-md text-foreground"
            >
              Priority queue
            </h3>
            <CardDescription className="max-w-[60ch] text-caption">
              {hasPriorityWork
                ? "Review submissions first, then follow up on overdue work."
                : "The next active assignments by due date."}
            </CardDescription>
            <CardAction>
              <Badge
                variant={hasPriorityWork ? "secondary" : "outline"}
                className="font-metric"
              >
                {hasPriorityWork
                  ? `${focusItems.length} priorities`
                  : "On track"}
              </Badge>
            </CardAction>
          </CardHeader>

          <CardContent className="min-w-0 flex-1 p-0">
            {queue.length > 0 ? (
              <div className="divide-y divide-border-muted">
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
                    className="px-5 py-2"
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-28 items-center gap-3 px-5 py-4">
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

          <div className="mt-auto flex min-h-12 items-center justify-between gap-4 px-5 py-2">
            <span className="text-caption text-content-muted">
              {hasPriorityWork
                ? "Reviews first · then oldest overdue"
                : "Next due first"}
            </span>
            <Link
              href={`/tutor/assignments?view=${hasPriorityWork ? "attention" : "active"}`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              All assignments
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
          </div>
        </Card>

        <Card
          className="min-w-0 gap-0 bg-surface-raised p-0"
          aria-labelledby="learner-progress-heading"
        >
          <CardHeader className="px-5 pt-4 pb-3">
            <h3
              id="learner-progress-heading"
              className="text-heading-md text-foreground"
            >
              Learner progress
            </h3>
            <CardDescription className="max-w-[60ch] text-caption">
              {learnerSummary}
            </CardDescription>
            <CardAction>
              <Link
                href="/tutor/students"
                aria-label="View all students"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "px-2 text-caption",
                )}
              >
                View all
              </Link>
            </CardAction>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col px-5 py-4">
            {learnerProgress.length > 0 ? (
              <>
                <div className="border-b border-border-muted pb-3">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-eyebrow text-content-subtle">
                        Class average
                      </p>
                      <p className="mt-0.5 truncate text-caption text-content-muted font-metric">
                        {activeCount} active assignment
                        {activeCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="text-metric font-metric text-foreground">
                      {averageProgress}%
                    </p>
                  </div>
                  <Progress
                    value={averageProgress}
                    className="mt-2.5 gap-0 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-border"
                    aria-label={`${averageProgress}% class average progress`}
                  />
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-eyebrow text-content-subtle">
                      Student
                    </p>
                    <p className="font-eyebrow text-content-subtle">
                      Average
                    </p>
                  </div>
                  <div className="mt-1 divide-y divide-border-muted">
                    {learnerProgress.map((learner) => (
                      <Progress
                        key={learner.id}
                        value={learner.average}
                        className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-2 [&_[data-slot=progress-track]]:col-span-2 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-border"
                        aria-label={`${learner.name} average progress`}
                      >
                        <ProgressLabel className="flex min-w-0 items-baseline gap-1.5">
                          <span className="truncate text-body text-foreground">
                            {learner.name}
                          </span>
                          <span className="shrink-0 text-caption text-content-muted font-metric">
                            · {learner.assignments} active
                          </span>
                        </ProgressLabel>
                        <ProgressValue className="self-start text-body text-foreground font-metric" />
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

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail: ReactNode;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 rounded-md bg-surface-raised px-5 py-4 shadow-xs">
      <dt className="col-span-2 text-caption font-medium text-content-subtle">
        {label}
      </dt>
      <dd className="text-metric font-metric text-foreground">{value}</dd>
      <dd className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-caption text-muted-foreground font-metric">
        {detail}
      </dd>
    </div>
  );
}

function summarizeLearners(items: BrowserItem[]) {
  const totals = new Map<
    string,
    { name: string; count: number; progress: number }
  >();

  items.forEach((item) => {
    const current = totals.get(item.studentId) ?? {
      name: item.student,
      count: 0,
      progress: 0,
    };
    current.count += 1;
    current.progress += item.completion_pct;
    totals.set(item.studentId, current);
  });

  return Array.from(totals, ([id, value]) => ({
    id,
    name: value.name,
    assignments: value.count,
    average: Math.round(value.progress / value.count),
  })).sort(
    (a, b) => a.average - b.average || a.name.localeCompare(b.name),
  );
}
