import { Link } from "next-view-transitions";
import {
  ClipboardCheck,
  FileClock,
  TriangleAlert,
  Users,
} from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
import {
  TutorAssignmentBrowser,
  type BrowserItem,
} from "@/components/tutor-assignment-browser";

export default async function TutorDashboard() {
  await requireTutor();
  const supabase = await createClient();

  const [{ data: assignments }, { data: students }, unread] = await Promise.all([
    supabase
      .from("assignments")
      .select(
        "id, title, type, due_at, completion_pct, student_id, review_status",
      )
      .order("due_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email").eq("role", "student"),
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
  // Overdue = the student is late and it's on them to act (not yet submitted,
  // not approved). This definition matches the Overdue section in
  // TutorAssignmentBrowser so the headline number and the list always agree.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const overdue = all.filter(
    (a) =>
      (a.review_status === "assigned" || a.review_status === "needs_work") &&
      new Date(a.due_at).getTime() < nowMs,
  ).length;

  const studentOptions = students ?? [];
  const hasStudents = studentOptions.length > 0;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Tutor workspace"
        title="Dashboard"
        description={
          !hasStudents
            ? "Let's get you set up."
            : awaiting === 0 && overdue === 0
              ? "You're all caught up — nice work."
              : "Here's how your students are tracking against their homework."
        }
        actions={
          hasStudents ? (
            <>
              <AddStudentButton variant="outline" />
              <AssignTaskButton students={studentOptions} />
            </>
          ) : undefined
        }
      />

      {hasStudents ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Students"
              value={studentOptions.length}
              tint="var(--tutor)"
              href="/tutor/students"
            />
            <StatCard
              icon={FileClock}
              label="Active"
              value={active}
              tint="var(--primary)"
            />
            <StatCard
              icon={ClipboardCheck}
              label="Awaiting review"
              value={awaiting}
              tint="oklch(0.66 0.14 70)"
              href={awaiting > 0 ? "#awaiting" : undefined}
            />
            <StatCard
              icon={TriangleAlert}
              label="Overdue"
              value={overdue}
              tint="var(--destructive)"
              href={overdue > 0 ? "#overdue" : undefined}
              alert
            />
          </div>

          <div className="mt-9">
            <TutorAssignmentBrowser items={items} nowMs={nowMs} />
          </div>
        </>
      ) : (
        <Onboarding />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
  href,
  alert,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tint: string;
  href?: string;
  alert?: boolean;
}) {
  const inner = (
    <div className="surface-card flex items-center gap-3.5 p-4 transition-[border-color,box-shadow] hover:border-line-strong">
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in oklch, ${tint} 14%, var(--card))`,
          color: tint,
        }}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p
          className="tabular text-2xl leading-none"
          style={alert && value > 0 ? { color: "var(--destructive)" } : undefined}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
  if (!href) return inner;
  return href.startsWith("#") ? (
    <a href={href} className="block">
      {inner}
    </a>
  ) : (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}

/** First-run guidance: a tutor with no students yet can't do anything else. */
function Onboarding() {
  return (
    <div className="surface-card mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-[var(--accent-cobalt-soft)] text-primary">
        <Users className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Welcome to Maths Tasks</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Get set up in two steps: invite a student, then send them their first
          assignment. You&rsquo;ll review their work and track progress right
          here.
        </p>
      </div>
      <AddStudentButton label="Invite your first student" />
    </div>
  );
}
