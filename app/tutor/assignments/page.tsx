import type { Metadata } from "next";
import { requireTutor } from "@/lib/auth";
import { unreadAssignmentIds } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
import {
  TutorAssignmentBrowser,
  type AssignmentFilter,
  type BrowserItem,
} from "@/components/tutor-assignment-browser";
import { TutorAssignmentSummary } from "@/components/tutor-assignment-summary";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Assignments — Maths Tasks",
  description: "Review, search, and manage student assignments.",
};

const assignmentFilters = new Set<AssignmentFilter>([
  "attention",
  "active",
  "completed",
  "all",
]);
const numberFormatter = new Intl.NumberFormat("en-GB");

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function assignmentFilter(value: string | undefined) {
  return value && assignmentFilters.has(value as AssignmentFilter)
    ? (value as AssignmentFilter)
    : undefined;
}

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string | string[];
    q?: string | string[];
  }>;
}) {
  await requireTutor();
  const supabase = await createClient();
  const params = await searchParams;

  const [
    assignmentsResult,
    studentsResult,
    invitesResult,
    categoriesResult,
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
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    supabase
      .from("student_invites")
      .select("id, full_name")
      .is("accepted_at", null),
    supabase.from("categories").select("id, name").order("name"),
    unreadAssignmentIds(),
  ]);

  const queryError = [
    assignmentsResult.error,
    studentsResult.error,
    invitesResult.error,
    categoriesResult.error,
  ].find(Boolean);

  if (queryError) {
    throw new Error("We couldn’t load assignments. Please try again.");
  }

  const students = studentsResult.data ?? [];
  const invites = invitesResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const nameById = new Map(
    students.map((student) => [
      student.id,
      student.full_name || student.email || "Student",
    ]),
  );
  const items: BrowserItem[] = (assignmentsResult.data ?? []).map(
    (assignment) => ({
      id: assignment.id,
      studentId: assignment.student_id,
      title: assignment.title,
      type: assignment.type,
      due_at: assignment.due_at,
      completion_pct: assignment.completion_pct,
      review_status: assignment.review_status,
      student: nameById.get(assignment.student_id) ?? "Student",
      unread: unread.has(assignment.id),
    }),
  );
  const studentOptions = [
    ...students.map((student) => ({
      id: student.id,
      full_name: student.full_name ?? "",
      email: student.email,
    })),
    ...invites.map((invite) => ({
      id: invite.id,
      full_name: invite.full_name,
      email: null,
      pending: true,
    })),
  ];
  const itemCount = numberFormatter.format(items.length);
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();

  return (
    <div className="w-full">
      <PageHeader
        title="Assignments"
        description={
          items.length === 0
            ? "Create the first assignment, then track its progress here."
            : `${itemCount} assignment${items.length === 1 ? "" : "s"} · Search, filter, and manage student work.`
        }
        actions={
          studentOptions.length > 0 ? (
            <AssignTaskButton
              students={studentOptions}
              categories={categories}
              label="New assignment…"
              size="sm"
            />
          ) : (
            <AddStudentButton label="Add student…" size="sm" />
          )
        }
        className="mb-5 gap-4 border-b-0 pb-0"
      />

      {items.length > 0 && (
        <TutorAssignmentSummary items={items} nowMs={nowMs} />
      )}

      <TutorAssignmentBrowser
        items={items}
        nowMs={nowMs}
        initialFilter={assignmentFilter(firstParam(params.view))}
        initialQuery={firstParam(params.q) ?? ""}
      />
    </div>
  );
}
