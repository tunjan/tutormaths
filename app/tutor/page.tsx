import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { Link } from "next-view-transitions";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
import { TutorDashboardOverview } from "@/components/tutor-dashboard-overview";
import type { BrowserItem } from "@/components/tutor-assignment-browser";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Teaching overview — Maths Tasks",
  description: "Review priority work and learner progress.",
};

export default async function TutorDashboard() {
  const ctx = await requireTutor();
  const supabase = await createClient();

  const [
    assignmentsResult,
    studentsResult,
    invitesResult,
    categoriesResult,
    tutorProfileResult,
    unread,
  ] = await Promise.all([
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
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", ctx.userId)
      .maybeSingle(),
    unreadAssignmentIds(),
  ]);

  const queryError = [
    assignmentsResult.error,
    studentsResult.error,
    invitesResult.error,
    categoriesResult.error,
    tutorProfileResult.error,
  ].find(Boolean);

  if (queryError) {
    throw new Error("We couldn’t load the teaching overview. Please try again.");
  }

  const assignments = assignmentsResult.data;
  const students = studentsResult.data;
  const invites = invitesResult.data;
  const categories = categoriesResult.data;
  const tutorProfile = tutorProfileResult.data;

  const nameById = new Map(
    (students ?? []).map((s) => [s.id, s.full_name || s.email || "Student"]),
  );
  const all = assignments ?? [];
  const items: BrowserItem[] = all.map((a) => ({
    id: a.id,
    studentId: a.student_id,
    title: a.title,
    type: a.type,
    due_at: a.due_at,
    completion_pct: a.completion_pct,
    review_status: a.review_status,
    student: nameById.get(a.student_id) ?? "Student",
    unread: unread.has(a.id),
  }));

  const awaiting = all.filter((a) => a.review_status === "submitted").length;
  const activeItems = items.filter((a) => a.review_status !== "approved");
  const active = activeItems.length;
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const overdue = all.filter(
    (a) =>
      (a.review_status === "assigned" || a.review_status === "needs_work") &&
      new Date(a.due_at).getTime() < nowMs,
  ).length;
  const focusItems = items
    .filter(
      (item) =>
        item.review_status === "submitted" ||
        ((item.review_status === "assigned" ||
          item.review_status === "needs_work") &&
          new Date(item.due_at).getTime() < nowMs),
    )
    .sort((a, b) => {
      const reviewRankA = a.review_status === "submitted" ? 0 : 1;
      const reviewRankB = b.review_status === "submitted" ? 0 : 1;
      if (reviewRankA !== reviewRankB) return reviewRankA - reviewRankB;
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });

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
  const needsAttention = focusItems.length;
  const affectedStudentCount = new Set(
    focusItems.map((item) => item.studentId),
  ).size;
  const tutorName = tutorProfile?.full_name?.trim();
  const firstName = tutorName?.split(/\s+/)[0];
  const displayName = firstName
    ? `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`
    : null;

  return (
    <div className="w-full">
      <PageHeader
        eyebrow={displayName ? `Welcome back, ${displayName}` : undefined}
        title="Teaching overview"
        className="mb-6 gap-4 border-b-0 pb-0"
        description={
          !hasStudents
            ? "Start by inviting your first student."
            : needsAttention > 0
              ? `${needsAttention} assignment${needsAttention === 1 ? "" : "s"} need your attention across ${affectedStudentCount} student${affectedStudentCount === 1 ? "" : "s"}.`
              : active > 0
                ? `Everything is up to date. ${active} active assignment${active === 1 ? "" : "s"} across ${studentOptions.length} student${studentOptions.length === 1 ? "" : "s"}.`
                : "Everything is up to date. You’re ready to assign the next task."
        }
        actions={
          hasStudents ? (
            <>
              {needsAttention > 0 && (
                <Link
                  href="/tutor/assignments?view=attention"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  <ListChecks data-icon="inline-start" aria-hidden />
                  Review priorities
                </Link>
              )}
              <AssignTaskButton
                students={studentOptions}
                categories={categories ?? []}
                label="New assignment…"
                size="sm"
                variant={needsAttention > 0 ? "outline" : "default"}
              />
            </>
          ) : undefined
        }
      />

      {hasStudents ? (
        <TutorDashboardOverview
          focusItems={focusItems}
          activeItems={activeItems}
          activeCount={active}
          awaitingCount={awaiting}
          overdueCount={overdue}
        />
      ) : (
        <Onboarding />
      )}
    </div>
  );
}

function Onboarding() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Start with one student</EmptyTitle>
        <EmptyDescription>
          Get set up in two steps: invite a student, then send them their first
          assignment. You&rsquo;ll review their work and track progress right
          here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddStudentButton label="Invite your first student" />
      </EmptyContent>
    </Empty>
  );
}
