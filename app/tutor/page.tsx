import { Link } from "next-view-transitions";
import { AlertCircle, Inbox, Plus, Users } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
import { buttonVariants } from "@/components/ui/button";
import {
  TutorAssignmentBrowser,
  type BrowserItem,
} from "@/components/tutor-assignment-browser";
import { cn } from "@/lib/utils";

export default async function TutorDashboard() {
  await requireTutor();
  const supabase = await createClient();

  const [{ data: assignments }, { data: students }, { data: invites }, { data: categories }, unread] =
    await Promise.all([
      supabase
        .from("assignments")
        .select(
          "id, title, type, due_at, completion_pct, student_id, review_status",
        )
        .order("due_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "student"),
      supabase
        .from("student_invites")
        .select("id, full_name")
        .is("accepted_at", null),
      supabase.from("categories").select("id, name").order("name"),
      unreadAssignmentIds(),
    ]);

  const nameById = new Map(
    (students ?? []).map((s) => [s.id, s.full_name || s.email || "Student"]),
  );
  const all = assignments ?? [];
  const items: BrowserItem[] = all.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    due_at: a.due_at,
    completion_pct: a.completion_pct,
    review_status: a.review_status,
    student: nameById.get(a.student_id) ?? "Student",
    unread: unread.has(a.id),
  }));

  const awaiting = all.filter((a) => a.review_status === "submitted").length;
  const active = all.filter((a) => a.review_status !== "approved").length;
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const overdue = all.filter(
    (a) =>
      (a.review_status === "assigned" || a.review_status === "needs_work") &&
      new Date(a.due_at).getTime() < nowMs,
  ).length;

  const studentOptions = [
    ...(students ?? []),
    ...(invites ?? []).map((invite) => ({
      id: invite.id,
      full_name: invite.full_name,
      email: null,
      pending: true,
    })),
  ];
  const hasStudents = studentOptions.length > 0;
  const needsAttention = awaiting + overdue;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Tutor workspace"
        title="Dashboard"
        description={
          !hasStudents
            ? "Let's get you set up."
            : awaiting === 0 && overdue === 0
              ? "No reviews or overdue work need your attention."
              : `${needsAttention} item${needsAttention === 1 ? "" : "s"} need a decision.`
        }
        actions={
          hasStudents ? (
            <div className="flex gap-3">
              <AddStudentButton variant="outline" />
              <AssignTaskButton
                students={studentOptions}
                categories={categories ?? []}
              />
            </div>
          ) : undefined
        }
      />

      {hasStudents ? (
        <>
          <AttentionPanel awaiting={awaiting} overdue={overdue} />

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatItem
              label="Students"
              value={studentOptions.length}
              href="/tutor/students"
              icon={<Users className="size-4" />}
            />
            <StatItem label="Active" value={active} />
            <StatItem
              label="Awaiting review"
              value={awaiting}
              href={awaiting > 0 ? "#awaiting" : undefined}
              tone={awaiting > 0 ? "review" : "neutral"}
            />
            <StatItem
              label="Overdue"
              value={overdue}
              href={overdue > 0 ? "#overdue" : undefined}
              tone={overdue > 0 ? "overdue" : "neutral"}
            />
          </div>

          <div className="mt-10">
            <TutorAssignmentBrowser items={items} nowMs={nowMs} />
          </div>
        </>
      ) : (
        <Onboarding />
      )}
    </div>
  );
}

function AttentionPanel({
  awaiting,
  overdue,
}: {
  awaiting: number;
  overdue: number;
}) {
  const clean = awaiting === 0 && overdue === 0;

  if (clean) {
    return (
      <section className="rounded-xl border border-border-subtle bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-content-subtle">
              Attention queue
            </p>
            <h2 className="mt-1 text-xl font-semibold text-content-emphasis">
              Nothing needs review right now
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Create the next assignment or check student progress below.
            </p>
          </div>
          <Link
            href="/tutor/assignments/new"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0")}
          >
            <Plus />
            New assignment
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <AttentionCard
        href="#awaiting"
        disabled={awaiting === 0}
        icon={<Inbox className="size-5" />}
        label="Needs review"
        value={awaiting}
        description={
          awaiting > 0
            ? "Submitted work is waiting for your feedback."
            : "No submitted work is waiting."
        }
        tone="review"
      />
      <AttentionCard
        href="#overdue"
        disabled={overdue === 0}
        icon={<AlertCircle className="size-5" />}
        label="Overdue"
        value={overdue}
        description={
          overdue > 0
            ? "Follow up while the assignment is still fresh."
            : "No active assignments are overdue."
        }
        tone="overdue"
      />
    </section>
  );
}

function AttentionCard({
  href,
  disabled,
  icon,
  label,
  value,
  description,
  tone,
}: {
  href: string;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  tone: "review" | "overdue";
}) {
  const toneClass =
    tone === "review"
      ? "border-status-review-border bg-status-review-bg text-status-review"
      : "border-status-overdue-border bg-status-overdue-bg text-status-overdue";

  const inner = (
    <div
      className={cn(
        "flex h-full items-start gap-4 rounded-xl border p-5 transition-all duration-150",
        disabled
          ? "border-border-soft bg-surface-muted text-text-muted"
          : `${toneClass} hover:border-border-emphasis`,
      )}
    >
      <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-lg border border-current/20 bg-card/70">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium opacity-80">
          {label}
        </p>
        <div className="mt-2 flex items-end gap-3">
          <span className="font-metric text-5xl font-semibold leading-none">
            {value}
          </span>
          {!disabled && (
            <span className="pb-1 text-sm font-medium">Open queue</span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      </div>
    </div>
  );

  return disabled ? (
    inner
  ) : (
    <a href={href} className="block">
      {inner}
    </a>
  );
}

function StatItem({
  label,
  value,
  href,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  href?: string;
  icon?: React.ReactNode;
  tone?: "neutral" | "review" | "overdue";
}) {
  const toneClass =
    tone === "review"
      ? "border-status-review-border bg-status-review-bg"
      : tone === "overdue"
        ? "border-status-overdue-border bg-status-overdue-bg"
        : "border-border-strong bg-surface-raised";

  const inner = (
    <div
      className={cn(
        "flex h-full select-none flex-col gap-3 rounded-xl border p-5 transition-all duration-150",
        href && "hover:border-border-emphasis",
        toneClass,
      )}
    >
      <span className="flex items-center justify-between gap-3 text-xs font-medium text-content-subtle">
        {label}
        {icon && <span className="text-text-muted">{icon}</span>}
      </span>
      <span className="font-metric text-4xl font-semibold leading-none text-content-emphasis lg:text-5xl">
        {value}
      </span>
    </div>
  );
  if (!href) return inner;
  return href.startsWith("#") ? (
    <a href={href} className="block group">
      {inner}
    </a>
  ) : (
    <Link href={href} className="block group">
      {inner}
    </Link>
  );
}

function Onboarding() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center animate-fade-in">
      <div className="space-y-4 max-w-md mx-auto">
        <h2 className="text-h3 font-semibold text-foreground">Welcome to Maths Tasks</h2>
        <p className="text-body text-text-muted leading-[1.6]">
          Get set up in two steps: invite a student, then send them their first
          assignment. You&rsquo;ll review their work and track progress right
          here.
        </p>
      </div>
      <div className="mt-2">
        <AddStudentButton label="Invite your first student" />
      </div>
    </div>
  );
}
