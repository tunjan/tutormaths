import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  ListChecks,
  Plus,
} from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  formatDate,
  typeLabel,
  type ReviewStatus,
} from "@/lib/format";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTutor();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: assignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at, role")
      .eq("id", id)
      .single(),
    supabase
      .from("assignments")
      .select("id, title, type, due_at, completion_pct, review_status")
      .eq("student_id", id)
      .order("due_at", { ascending: false }),
  ]);
  if (!student || student.role !== "student") notFound();

  const all = assignments ?? [];
  const active = all.filter((a) => a.review_status !== "approved");
  const completed = all.filter((a) => a.review_status === "approved");
  const avg =
    all.length === 0
      ? 0
      : Math.round(
          all.reduce((sum, a) => sum + a.completion_pct, 0) / all.length,
        );
  const displayName = student.full_name?.trim() || student.email;

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 animate-rise">
      <header>
        <BackLink href="/tutor/students" className="-ml-3 mb-4 text-caption">
          All students
        </BackLink>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-balance text-heading-lg text-content-emphasis">
              {displayName}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-content-subtle">
              {student.full_name && <span>{student.email}</span>}
              {student.full_name && <span aria-hidden>·</span>}
              <span>
                Joined{" "}
                <time dateTime={student.created_at}>
                  {formatDate(student.created_at)}
                </time>
              </span>
            </p>
          </div>

          <Link
            href={`/tutor/assignments/new?student=${student.id}`}
            className={cn(buttonVariants({ size: "sm" }), "w-fit shrink-0")}
          >
            <Plus aria-hidden />
            New assignment
          </Link>
        </div>
      </header>

      <section aria-labelledby="student-summary-heading">
        <h2 id="student-summary-heading" className="sr-only">
          Student summary
        </h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <SummaryMetric label="Active assignments" value={active.length} />
          <SummaryMetric label="Completed assignments" value={completed.length} />
          <SummaryMetric
            label="Average progress"
            value={`${avg}%`}
            detail="across all work"
          />
        </dl>
      </section>

      <AssignmentSection title="Active assignments" items={active} empty="active" />
      <AssignmentSection title="History" items={completed} empty="history" />
    </div>
  );
}

type AssignmentItem = {
  id: string;
  title: string;
  type: "problem_set" | "reading_notes";
  due_at: string;
  completion_pct: number;
  review_status: ReviewStatus;
};

function SummaryMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-card px-4 py-3.5 shadow-xs sm:block sm:px-5 sm:py-4">
      <dt className="text-caption text-content-subtle">{label}</dt>
      <dd className="mt-0.5 flex items-baseline gap-1.5 font-metric text-title-lg tabular-nums text-content-emphasis">
        {value}
        {detail && (
          <span className="text-micro font-normal text-content-subtle">
            {detail}
          </span>
        )}
      </dd>
    </div>
  );
}

function AssignmentSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: AssignmentItem[];
  empty: "active" | "history";
}) {
  const headingId = `${empty}-assignments-heading`;

  return (
    <section className="flex flex-col gap-3" aria-labelledby={headingId}>
      <div className="flex items-baseline gap-2">
        <h2 id={headingId} className="text-title-md text-content-emphasis">
          {title}
        </h2>
        <span
          className="text-caption tabular-nums text-content-subtle"
          aria-label={`${items.length} ${title.toLowerCase()}`}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <CompactEmpty kind={empty} />
      ) : (
        <AssignmentList items={items} />
      )}
    </section>
  );
}

function AssignmentList({ items }: { items: AssignmentItem[] }) {
  return (
    <div>
      <div
        className="hidden grid-cols-[minmax(0,1fr)_8rem_10rem_8rem_1.5rem] gap-x-6 px-5 pb-2 text-micro font-medium text-content-subtle lg:grid"
        aria-hidden
      >
        <span>Assignment</span>
        <span>Due date</span>
        <span>Progress</span>
        <span>Status</span>
        <span />
      </div>

      <ul className="divide-y divide-border-subtle overflow-hidden rounded-md bg-card shadow-xs">
        {items.map((assignment) => (
          <li key={assignment.id}>
            <StudentAssignmentRow assignment={assignment} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function StudentAssignmentRow({
  assignment,
}: {
  assignment: AssignmentItem;
}) {
  const AssignmentTypeIcon =
    assignment.type === "reading_notes" ? BookOpenText : ListChecks;
  const progress = Math.max(0, Math.min(100, assignment.completion_pct));

  return (
    <Link
      href={`/tutor/assignments/${assignment.id}`}
      className="group grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors duration-fast hover:bg-bg-muted focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5 lg:grid-cols-[minmax(0,1fr)_8rem_10rem_8rem_1.5rem] lg:gap-x-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-sm bg-bg-subtle text-content-default"
          aria-hidden
        >
          <AssignmentTypeIcon className="size-4" strokeWidth={1.75} />
        </span>

        <div className="min-w-0">
          <h3 className="truncate text-label text-content-emphasis">
            {assignment.title}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-caption text-content-subtle">
            <span>{typeLabel(assignment.type)}</span>
            <span className="lg:hidden" aria-hidden>
              ·
            </span>
            <span className="lg:hidden">
              Due{" "}
              <time dateTime={assignment.due_at}>
                {formatDate(assignment.due_at)}
              </time>
            </span>
            <span className="lg:hidden" aria-hidden>
              ·
            </span>
            <span className="lg:hidden tabular-nums">{progress}% complete</span>
          </p>
        </div>
      </div>

      <div className="hidden text-caption text-content-default lg:block">
        <span className="sr-only">Due </span>
        <time dateTime={assignment.due_at}>
          {formatDate(assignment.due_at)}
        </time>
      </div>

      <div className="hidden min-w-0 lg:block">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-micro text-content-subtle">
          <span>Complete</span>
          <span className="tabular-nums text-content-default">{progress}%</span>
        </div>
        <Progress
          value={progress}
          aria-label={`${progress}% complete`}
          className="gap-0"
        />
      </div>

      <div className="pl-11 sm:pl-0">
        <AssignmentStatusBadge
          reviewStatus={assignment.review_status}
          dueAt={assignment.due_at}
        />
      </div>

      <span className="hidden size-6 place-items-center text-content-subtle transition-[color,transform] duration-fast group-hover:translate-x-0.5 group-hover:text-content-emphasis lg:grid">
        <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
    </Link>
  );
}

function CompactEmpty({ kind }: { kind: "active" | "history" }) {
  const isHistory = kind === "history";
  const EmptyIcon = isHistory ? CheckCircle2 : ListChecks;

  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md bg-bg-subtle/60 px-4 py-3.5 text-caption sm:px-5">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-sm bg-card text-content-subtle shadow-xs"
        aria-hidden
      >
        <EmptyIcon className="size-4" strokeWidth={1.75} />
      </span>
      <p>
        <span className="font-medium text-content-default">
          {isHistory ? "No completed assignments" : "No active assignments"}
        </span>
        <span className="hidden text-content-subtle sm:inline">
          {isHistory
            ? " · Completed work will appear here."
            : " · New work will appear here once assigned."}
        </span>
      </p>
    </div>
  );
}
