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
        title="Dashboard"
        description={
          !hasStudents
            ? "Start by inviting your first student."
            : needsAttention > 0
              ? `${needsAttention} assignment${needsAttention === 1 ? "" : "s"} need your attention across ${studentOptions.length} student${studentOptions.length === 1 ? "" : "s"}.`
              : active > 0
                ? `Everything is up to date. ${active} active assignment${active === 1 ? "" : "s"} across ${studentOptions.length} student${studentOptions.length === 1 ? "" : "s"}.`
                : "Everything is up to date. You’re ready to assign the next task."
        }
        actions={
          hasStudents ? (
            <div className="flex flex-wrap gap-2">
              <AddStudentButton variant="outline" />
              <AssignTaskButton
                students={studentOptions}
                categories={categories ?? []}
                label="New assignment"
              />
            </div>
          ) : undefined
        }
      />

      {hasStudents ? (
        <TutorAssignmentBrowser items={items} nowMs={nowMs} />
      ) : (
        <Onboarding />
      )}
    </div>
  );
}

function Onboarding() {
  return (
    <div className="mx-auto flex max-w-md animate-fade-in flex-col items-center gap-5 py-20 text-center">
      <div className="flex flex-col gap-3">
        <h2 className="text-h3 font-semibold text-foreground">Start with one student</h2>
        <p className="text-sm leading-relaxed text-text-muted">
          Get set up in two steps: invite a student, then send them their first
          assignment. You&rsquo;ll review their work and track progress right
          here.
        </p>
      </div>
      <AddStudentButton label="Invite your first student" />
    </div>
  );
}
