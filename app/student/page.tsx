import { Link } from "next-view-transitions";
import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  ListChecks,
} from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { AssignmentRow } from "@/components/assignment-row";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, relativeTime, typeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

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
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="My practice"
        description="Your assignments, with progress you control."
        actions={
          nextAssignment ? (
            <RequestHomeworkButton variant="outline" />
          ) : undefined
        }
      />

      {nextAssignment ? (
        <UpNextCard
          assignment={nextAssignment}
          unread={unread.has(nextAssignment.id)}
        />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenText aria-hidden />
            </EmptyMedia>
            <EmptyTitle>
              Nothing due right now
            </EmptyTitle>
            <EmptyDescription>
              {completed.length > 0
                ? "You are caught up. Request more practice when you are ready."
                : "Request practice from your tutor when you are ready for work."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <RequestHomeworkButton />
          </EmptyContent>
        </Empty>
      )}

      {remainingActive.length > 0 && (
        <section className="mt-10" aria-labelledby="active-tasks-heading">
          <div className="mb-3 flex items-center justify-between gap-4 px-1">
            <h2
              id="active-tasks-heading"
              className="text-h4 text-content-emphasis"
            >
              More to do
            </h2>
            <Badge variant="secondary" className="tabular-nums">
              {remainingActive.length}
            </Badge>
          </div>
          <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-md border border-border bg-card">
            {remainingActive.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/student/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                reviewStatus={a.review_status}
                unread={unread.has(a.id)}
                showTypeMarker
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mt-10" aria-labelledby="completed-tasks-heading">
          <div className="mb-3 flex items-center justify-between gap-4 px-1">
            <h2
              id="completed-tasks-heading"
              className="text-h4 text-content-emphasis"
            >
              Completed
            </h2>
            <Badge variant="secondary" className="tabular-nums">
              {completed.length}
            </Badge>
          </div>
          <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-md border border-border bg-card">
            {completed.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/student/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                reviewStatus={a.review_status}
                unread={unread.has(a.id)}
                showTypeMarker
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

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
  const AssignmentTypeIcon =
    assignment.type === "reading_notes" ? BookOpenText : ListChecks;
  const heroLabel =
    assignment.review_status === "submitted" ? "In review" : "Up next";
  const actionLabel =
    assignment.review_status === "submitted"
      ? "View submission"
      : assignment.review_status === "needs_work"
        ? "Continue revisions"
        : "Continue task";

  return (
    <Card role="region" aria-labelledby={`up-next-${assignment.id}`}>
      <CardHeader className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
        <span className="grid size-10 place-items-center rounded-md bg-bg-subtle text-content-default">
          <AssignmentTypeIcon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <CalendarClock aria-hidden />
              {heroLabel}
            </Badge>
            {unread && <Badge variant="info">New activity</Badge>}
            <AssignmentStatusBadge
              reviewStatus={assignment.review_status}
              dueAt={assignment.due_at}
            />
          </div>
          <CardTitle
            id={`up-next-${assignment.id}`}
            role="heading"
            aria-level={2}
            className="mt-4 max-w-3xl text-h2"
          >
            {assignment.title}
          </CardTitle>
          <CardDescription className="mt-2 text-pretty">
            {typeLabel(assignment.type)}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Progress
          value={assignment.completion_pct}
          aria-label={`${assignment.title} progress`}
          className="gap-2"
        >
          <ProgressLabel className="text-micro text-content-subtle">
            Progress
          </ProgressLabel>
          <ProgressValue className="text-micro text-content-emphasis" />
        </Progress>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex min-w-0 items-center gap-2 text-pretty text-caption text-content-subtle">
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          <span>
            Due {relativeTime(assignment.due_at)}
            <span className="hidden sm:inline">
              {" "}/ {formatDateTime(assignment.due_at)}
            </span>
          </span>
        </p>
        <Link
          href={`/student/assignments/${assignment.id}`}
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          {actionLabel}
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
