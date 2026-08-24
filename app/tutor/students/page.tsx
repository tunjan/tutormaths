import { Link } from "next-view-transitions";
import { Clock, UsersRound } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
import { PendingInviteActions } from "@/components/pending-invite-actions";
import { formatDate } from "@/lib/format";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function StudentsPage() {
  await requireTutor();
  const supabase = await createClient();

  const [studentsResult, invitesResult, categoriesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    supabase
      .from("student_invites")
      .select("id, full_name, token, created_at")
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name").order("name"),
  ]);
  const { data: students } = studentsResult;
  const { data: invites } = invitesResult;
  const { data: categories } = categoriesResult;

  const studentOptions = (students ?? []).map((s) => ({
    id: s.id,
    full_name: s.full_name ?? "",
    email: s.email,
  }));
  const recipientOptions = [
    ...studentOptions,
    ...(invites ?? []).map((invite) => ({
      id: invite.id,
      full_name: invite.full_name,
      email: null,
      pending: true,
    })),
  ];

  const hasAnyone = (students?.length ?? 0) + (invites?.length ?? 0) > 0;
  const studentCount = students?.length ?? 0;
  const inviteCount = invites?.length ?? 0;
  const summary = hasAnyone
    ? [
        `${studentCount} active ${studentCount === 1 ? "student" : "students"}`,
        inviteCount > 0
          ? `${inviteCount} pending ${inviteCount === 1 ? "invitation" : "invitations"}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Add students and manage their assigned work.";

  return (
    <div className="animate-rise">
      <PageHeader
        title="Students"
        description={summary}
        actions={<AddStudentButton />}
        className="mb-5"
      />

      {!hasAnyone ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersRound aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No students yet</EmptyTitle>
            <EmptyDescription>
              Add your first student to start assigning homework and tracking
              progress.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <AddStudentButton />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-5">
          {studentCount > 0 && (
            <section
              aria-labelledby="active-students-heading"
              className="overflow-hidden rounded-lg border border-border-subtle bg-[var(--color-canvas-elevated)]"
            >
              <div className="border-b border-border-subtle px-4 py-3 sm:px-5">
                <div className="flex items-baseline gap-2">
                  <h2
                    id="active-students-heading"
                    className="text-label text-content-emphasis"
                  >
                    Active students
                  </h2>
                  <span className="font-metric text-caption text-content-subtle">
                    {studentCount}
                  </span>
                </div>
                <p className="mt-0.5 text-caption text-content-subtle">
                  Open a student to review their work, or assign a new task.
                </p>
              </div>

              <div
                aria-hidden="true"
                className="hidden grid-cols-[minmax(0,1fr)_9rem_auto] gap-4 border-b border-border-subtle bg-bg-subtle/60 px-5 py-2 text-micro font-medium text-content-subtle sm:grid"
              >
                <span>Student</span>
                <span>Joined</span>
                <span className="w-20">Action</span>
              </div>

              <ul className="divide-y divide-border-subtle">
                {(students ?? []).map((s) => {
                  const name = s.full_name || s.email || "Student";
                  return (
                    <li
                      key={s.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors duration-fast hover:bg-bg-muted/70 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:gap-4 sm:px-5"
                    >
                      <Link
                        href={`/tutor/students/${s.id}`}
                        className="group -m-1 flex min-w-0 items-center gap-3 rounded-md p-1"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-9 shrink-0 place-items-center rounded-md border border-border-subtle bg-bg-subtle text-caption text-content-emphasis"
                        >
                          {initials(name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-label text-content-emphasis group-hover:underline">
                            {s.full_name || "—"}
                          </span>
                          <span
                            className="block break-words text-caption text-content-subtle"
                          >
                            {s.email}
                          </span>
                          <span className="mt-0.5 block text-micro text-content-subtle sm:hidden">
                            Joined {formatDate(s.created_at)}
                          </span>
                        </span>
                      </Link>

                      <time
                        dateTime={s.created_at}
                        className="font-metric hidden text-caption text-content-subtle sm:block"
                      >
                        {formatDate(s.created_at)}
                      </time>

                      <AssignTaskButton
                        students={recipientOptions}
                        categories={categories ?? []}
                        defaultStudentId={s.id}
                        variant="outline"
                        size="sm"
                        label="Assign"
                        ariaLabel={`Assign task to ${name}`}
                        className="justify-self-end"
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {inviteCount > 0 && (
            <section
              aria-labelledby="pending-invitations-heading"
              className="overflow-hidden rounded-lg border border-border-subtle bg-[var(--color-canvas-elevated)]"
            >
              <div className="border-b border-border-subtle px-4 py-3 sm:px-5">
                <div className="flex items-baseline gap-2">
                  <h2
                    id="pending-invitations-heading"
                    className="text-label text-content-emphasis"
                  >
                    Pending invitations
                  </h2>
                  <span className="font-metric text-caption text-content-subtle">
                    {inviteCount}
                  </span>
                </div>
                <p className="mt-0.5 text-caption text-content-subtle">
                  Students who have not completed sign-up yet.
                </p>
              </div>

              <div
                aria-hidden="true"
                className="hidden grid-cols-[minmax(0,1fr)_9rem_auto] gap-4 border-b border-border-subtle bg-bg-subtle/60 px-5 py-2 text-micro font-medium text-content-subtle sm:grid"
              >
                <span>Student</span>
                <span>Invited</span>
                <span className="w-[18.5rem]">Actions</span>
              </div>

              <ul className="divide-y divide-border-subtle">
                {(invites ?? []).map((inv) => {
                  const name = inv.full_name || "Student";
                  return (
                    <li
                      key={inv.id}
                      className="grid gap-3 px-4 py-3 transition-colors duration-fast hover:bg-bg-muted/70 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-center sm:gap-4 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="grid size-9 shrink-0 place-items-center rounded-md border border-border-subtle bg-bg-subtle text-caption text-content-subtle"
                        >
                          {initials(name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-label text-content-emphasis">
                            {inv.full_name || "—"}
                          </p>
                          <p className="flex items-center gap-1.5 text-caption text-content-attention">
                            <Clock className="size-3.5" aria-hidden="true" />
                            Awaiting sign-up
                          </p>
                          <p className="mt-0.5 text-micro text-content-subtle sm:hidden">
                            Invited {formatDate(inv.created_at)}
                          </p>
                        </div>
                      </div>

                      <time
                        dateTime={inv.created_at}
                        className="font-metric hidden text-caption text-content-subtle sm:block"
                      >
                        {formatDate(inv.created_at)}
                      </time>

                      <div className="flex flex-wrap items-center gap-2 sm:w-[18.5rem]">
                        <AssignTaskButton
                          students={recipientOptions}
                          categories={categories ?? []}
                          defaultStudentId={inv.id}
                          variant="outline"
                          size="sm"
                          label="Assign"
                          ariaLabel={`Assign task to ${name}`}
                        />
                        <div className="min-w-44 flex-1">
                          <PendingInviteActions
                            inviteId={inv.id}
                            token={inv.token}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
