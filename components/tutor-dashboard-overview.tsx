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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import type { BrowserItem } from "@/components/tutor-assignment-browser";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive";

type ChartPoint = {
  item: BrowserItem;
  x: number;
  y: number;
  label: string;
};

export function TutorDashboardOverview({
  focusItems,
  activeItems,
  activeCount,
  awaitingCount,
  approvedCount,
  overdueCount,
  studentCount,
  pendingInviteCount,
  averageProgress,
  totalAssignmentCount,
}: {
  focusItems: BrowserItem[];
  activeItems: BrowserItem[];
  activeCount: number;
  awaitingCount: number;
  approvedCount: number;
  overdueCount: number;
  studentCount: number;
  pendingInviteCount: number;
  averageProgress: number;
  totalAssignmentCount: number;
}) {
  const queue = (focusItems.length > 0 ? focusItems : activeItems).slice(0, 3);
  const startedCount = activeItems.filter(
    (item) => item.completion_pct > 0 || item.review_status !== "assigned",
  ).length;
  const chartItems = [...activeItems]
    .sort(
      (a, b) =>
        new Date(a.due_at).getTime() - new Date(b.due_at).getTime(),
    )
    .slice(0, 7);
  const chartPoints = makeChartPoints(chartItems);
  const learnerProgress = summarizeLearners(activeItems).slice(0, 4);
  const flowStages = [
    { label: "Active", value: activeCount },
    { label: "In progress", value: startedCount },
    { label: "In review", value: awaitingCount },
    { label: "Approved", value: approvedCount },
  ];

  return (
    <section className="mb-6 flex flex-col gap-4" aria-label="Tutor dashboard overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Active work"
          value={activeCount}
          badge={activeCount > 0 ? "Live" : "Clear"}
          badgeTone={activeCount > 0 ? "info" : "success"}
          caption={`${startedCount} currently in progress`}
        />
        <MetricCard
          label="Awaiting review"
          value={awaitingCount}
          badge={awaitingCount > 0 ? "Action" : "Clear"}
          badgeTone={awaitingCount > 0 ? "warning" : "success"}
          caption={
            awaitingCount > 0
              ? `${awaitingCount} submission${awaitingCount === 1 ? "" : "s"} ready for feedback`
              : "No submissions waiting"
          }
        />
        <MetricCard
          label="Overdue"
          value={overdueCount}
          badge={overdueCount > 0 ? "Follow up" : "Clear"}
          badgeTone={overdueCount > 0 ? "destructive" : "success"}
          caption={
            overdueCount > 0
              ? `${overdueCount} task${overdueCount === 1 ? "" : "s"} past the due date`
              : "Everything is on schedule"
          }
        />
        <MetricCard
          label="Students"
          value={studentCount}
          badge={pendingInviteCount > 0 ? `${pendingInviteCount} pending` : "Connected"}
          badgeTone={pendingInviteCount > 0 ? "default" : "success"}
          caption={`${studentCount} active learner${studentCount === 1 ? "" : "s"}`}
        />
        <MetricCard
          label="Average progress"
          value={`${averageProgress}%`}
          badge="Active work"
          badgeTone="default"
          caption="Across all open assignments"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.9fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Assignment progress</CardTitle>
            <CardDescription>
              Completion across the next {chartItems.length} active assignment{chartItems.length === 1 ? "" : "s"}, ordered by due date.
            </CardDescription>
            <CardAction className="hidden gap-8 sm:flex">
              <InlineMetric label="Average" value={`${averageProgress}%`} />
              <InlineMetric label="Open" value={activeCount} />
            </CardAction>
          </CardHeader>

          <CardContent className="mt-3">
            {chartPoints.length > 0 ? (
              <ProgressChart points={chartPoints} />
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Review flow</CardTitle>
            <CardDescription>
              Where the current assignment set sits right now.
            </CardDescription>
            <CardAction>
              <InlineMetric label="Total" value={totalAssignmentCount} />
            </CardAction>
          </CardHeader>

          <CardContent className="mt-6 flex min-h-60 items-end justify-between gap-3">
            {flowStages.map((stage) => {
              const percentage = percentageOf(stage.value, totalAssignmentCount);
              return (
                <div key={stage.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                  <span className="text-micro tabular-nums text-content-emphasis">
                    {percentage}%
                  </span>
                  <div className="flex h-28 w-full max-w-12 items-end rounded-md bg-bg-muted p-1">
                    <span
                      className="w-full rounded-sm bg-accent-ink"
                      style={{ height: `${Math.max(percentage, stage.value > 0 ? 8 : 0)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 text-center">
                    <p className="truncate text-micro text-content-subtle">{stage.label}</p>
                    <p className="mt-1 text-label tabular-nums text-content-emphasis">
                      {stage.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[0.72fr_1fr_1.12fr]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Class progress</CardTitle>
            <CardDescription>Average completion for active work.</CardDescription>
          </CardHeader>

          <CardContent className="mt-2 flex flex-1 items-center justify-center">
            <ProgressGauge value={averageProgress} />
          </CardContent>

          <CardFooter className="justify-between gap-4">
            <span className="text-caption text-content-subtle">Active assignments</span>
            <span className="text-label tabular-nums text-content-emphasis">
              {activeCount}
            </span>
          </CardFooter>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Learner pulse</CardTitle>
            <CardDescription>Average progress by student.</CardDescription>
            <CardAction>
              <Link
                href="/tutor/students"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Students
              </Link>
            </CardAction>
          </CardHeader>

          <CardContent className="mt-3 flex flex-1 flex-col gap-4">
            {learnerProgress.length > 0 ? (
              learnerProgress.map((learner) => (
                <Progress
                  key={learner.name}
                  value={learner.average}
                  className="gap-2"
                  aria-label={`${learner.name} average progress`}
                >
                  <ProgressLabel className="min-w-0 truncate text-micro text-content-subtle">
                    {learner.name}
                  </ProgressLabel>
                  <ProgressValue className="text-micro text-content-emphasis" />
                </Progress>
              ))
            ) : (
              <div className="flex min-h-36 items-center justify-center text-center">
                <p className="max-w-52 text-body text-content-subtle">
                  Learner progress will appear when assignments are active.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-between gap-4">
            <span className="text-caption text-content-subtle">Connected students</span>
            <span className="text-label tabular-nums text-content-emphasis">
              {studentCount}
            </span>
          </CardFooter>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Priority queue</CardTitle>
            <CardDescription>
              {focusItems.length > 0
                ? "Reviews and overdue work to handle first."
                : "The next active assignments in your schedule."}
            </CardDescription>
            <CardAction>
              <Badge variant={focusItems.length > 0 ? "warning" : "success"}>
                {focusItems.length > 0 ? `${focusItems.length} to check` : "On track"}
              </Badge>
            </CardAction>
          </CardHeader>

          <CardContent className="-mx-6 mt-1 flex-1">
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
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-36 items-center justify-center gap-3 px-6 text-center">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-bg-success text-content-success">
                  <CircleCheck className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-left text-body text-content-subtle">Nothing is waiting on you.</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-end">
            <Link
              href="#assignments-heading"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all
              <ArrowDown data-icon="inline-end" aria-hidden />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  badge,
  badgeTone,
  caption,
}: {
  label: string;
  value: number | string;
  badge: string;
  badgeTone: BadgeTone;
  caption: string;
}) {
  return (
    <Card size="sm" className="min-h-36">
      <CardHeader>
        <CardDescription className="font-medium">{label}</CardDescription>
        <CardAction>
          <Badge variant={badgeTone}>{badge}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-2">
        <p className="text-h2 tabular-nums text-content-emphasis">
          {value}
        </p>
        <p className="text-caption text-content-subtle">{caption}</p>
      </CardContent>
    </Card>
  );
}

function InlineMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-right">
      <p className="text-micro text-content-subtle">{label}</p>
      <p className="mt-1 text-h3 tabular-nums text-content-emphasis">
        {value}
      </p>
    </div>
  );
}

function ProgressChart({ points }: { points: ChartPoint[] }) {
  const baseline = 158;
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `42,${baseline} ${linePoints} 704,${baseline}`;
  const gridValues = [100, 75, 50, 25, 0];

  return (
    <svg
      viewBox="0 0 720 190"
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label="Assignment completion percentage by due date"
    >
      <title>Assignment completion percentage by due date</title>
      {gridValues.map((value) => {
        const y = 12 + ((100 - value) / 100) * 146;
        return (
          <g key={value}>
            <line
              x1="42"
              y1={y}
              x2="704"
              y2={y}
              stroke="var(--chart-grid)"
              strokeDasharray="4 6"
            />
            <text
              x="0"
              y={y + 4}
              fill="var(--content-subtle)"
              fontSize="12"
              fontWeight="500"
            >
              {value}%
            </text>
          </g>
        );
      })}

      <polygon points={areaPoints} fill="var(--bg-info)" />
      <polyline
        points={linePoints}
        fill="none"
        stroke="var(--chart-primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point) => (
        <g key={point.item.id}>
          <circle cx={point.x} cy={point.y} r="7" fill="var(--bg-default)" />
          <circle cx={point.x} cy={point.y} r="4" fill="var(--chart-primary)" />
          <text
            x={point.x}
            y="181"
            textAnchor="middle"
            fill="var(--content-subtle)"
            fontSize="12"
            fontWeight="500"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function EmptyChart() {
  return (
    <div className="flex min-h-52 items-center justify-center text-center">
      <div>
        <p className="text-label text-content-emphasis">No active work to chart</p>
        <p className="mt-1 text-body text-content-subtle">
          New assignments will appear here automatically.
        </p>
      </div>
    </div>
  );
}

function ProgressGauge({ value }: { value: number }) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="relative w-full max-w-64">
      <svg viewBox="0 0 220 126" className="h-auto w-full" role="img" aria-label={`${clampedValue}% average class progress`}>
        <title>{clampedValue}% average class progress</title>
        <path
          d="M 20 108 A 90 90 0 0 1 200 108"
          fill="none"
          stroke="var(--bg-subtle)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength="100"
        />
        <path
          d="M 20 108 A 90 90 0 0 1 200 108"
          fill="none"
          stroke="var(--chart-secondary)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${clampedValue} ${100 - clampedValue}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <p className="text-h2 tabular-nums text-content-emphasis">
          {clampedValue}%
        </p>
        <p className="mt-2 text-caption text-content-subtle">Average completion</p>
      </div>
    </div>
  );
}

function makeChartPoints(items: BrowserItem[]): ChartPoint[] {
  if (items.length === 0) return [];
  const left = 42;
  const right = 704;
  const top = 12;
  const chartHeight = 146;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  });

  return items.map((item, index) => {
    const x =
      items.length === 1
        ? (left + right) / 2
        : left + (index / (items.length - 1)) * (right - left);
    const progress = Math.max(0, Math.min(100, item.completion_pct));
    return {
      item,
      x,
      y: top + ((100 - progress) / 100) * chartHeight,
      label: formatter.format(new Date(item.due_at)),
    };
  });
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
  })).sort((a, b) => b.assignments - a.assignments || a.name.localeCompare(b.name));
}

function percentageOf(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
