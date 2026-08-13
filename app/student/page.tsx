import { Link } from "next-view-transitions";
import { ArrowRight, BookOpenText, CalendarClock } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { AssignmentRow } from "@/components/assignment-row";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
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
    <div className="mx-auto w-full max-w-5xl">
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
  const heroLabel =
    assignment.review_status === "submitted" ? "In review" : "Up next";
  const actionLabel =
    assignment.review_status === "submitted"
      ? "View submission"
      : assignment.review_status === "needs_work"
        ? "Continue revisions"
        : "Continue task";
  const progressLabel =
    assignment.completion_pct === 0
      ? "Not started"
      : assignment.completion_pct === 100
        ? "Complete"
        : "In progress";

  return (
    <Card
      role="region"
      aria-labelledby={`up-next-${assignment.id}`}
      className="gap-0 border-border p-0 shadow-sm"
    >
      <div className="grid xl:grid-cols-[minmax(0,1fr)_17rem]">
        <CardHeader className="p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
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
                className="mt-5 max-w-2xl text-balance text-h2"
              >
                {assignment.title}
              </CardTitle>
              <CardDescription className="mt-1.5 text-pretty">
                {typeLabel(assignment.type)}
              </CardDescription>

              <p className="mt-6 flex min-w-0 items-center gap-2 text-pretty text-caption text-content-subtle">
                <CalendarClock className="size-4 shrink-0" aria-hidden />
                <span>
                  Due {relativeTime(assignment.due_at)}
                  <span className="hidden sm:inline">
                    {" "}/ {formatDateTime(assignment.due_at)}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col justify-between gap-6 border-t border-border bg-bg-subtle p-5 sm:p-6 xl:border-l xl:border-t-0">
          <div>
            <p className="font-eyebrow text-content-muted">Progress</p>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <p className="text-h2 tabular-nums text-content-emphasis">
                {assignment.completion_pct}%
              </p>
              <p className="text-caption text-content-subtle">
                {progressLabel}
              </p>
            </div>
            <Progress
              value={assignment.completion_pct}
              aria-label={`${assignment.title} progress`}
              className="mt-3"
            />
          </div>

          <Link
            href={`/student/assignments/${assignment.id}`}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            {actionLabel}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Link>
        </CardContent>
      </div>
    </Card>
  );
}
