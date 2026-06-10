import { Link } from "next-view-transitions";
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

  const [{ data: assignments }, { data: students }, { data: categories }, unread] =
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatItem label="Students" value={studentOptions.length} href="/tutor/students" />
            <StatItem label="Active" value={active} />
            <StatItem label="Awaiting review" value={awaiting} href={awaiting > 0 ? "#awaiting" : undefined} />
            <StatItem label="Overdue" value={overdue} href={overdue > 0 ? "#overdue" : undefined} />
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

function StatItem({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <div className="card card-interactive flex flex-col gap-2 p-6 select-none shadow-[var(--shadow-sm)] h-full">
      <span className="text-xs font-semibold text-[#737373] dark:text-[#a3a3a3] uppercase tracking-wider">{label}</span>
      <span className="font-metric text-4xl lg:text-5xl font-bold text-[#0a0a0a] dark:text-[#fafafa] leading-none mt-1">
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
        <h2 className="text-h3 font-semibold text-foreground tracking-tight">Welcome to Maths Tasks</h2>
        <p className="text-body text-[#525252] dark:text-[#a3a3a3] leading-[1.6]">
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
