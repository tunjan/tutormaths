import { Link } from "next-view-transitions";
import { ChevronRight, Clock } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
import { PendingInviteActions } from "@/components/pending-invite-actions";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

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

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "student")
    .order("full_name", { ascending: true });

  const { data: invites } = await supabase
    .from("student_invites")
    .select("id, full_name, token, created_at")
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const studentOptions = (students ?? []).map((s) => ({
    id: s.id,
    full_name: s.full_name ?? "",
    email: s.email,
  }));

  const hasAnyone = (students?.length ?? 0) + (invites?.length ?? 0) > 0;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Tutor workspace"
        title="Students"
        description="Everyone you're currently tutoring."
        actions={<AddStudentButton />}
      />

      {!hasAnyone ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <span className="grid size-14 place-items-center rounded-full bg-[#f3f0ff] dark:bg-[#7c3aed]/10 text-[#7c3aed] dark:text-[#a78bfa]">
            <ChevronRight className="size-6" />
          </span>
          <h3 className="text-xl font-semibold text-foreground">No students yet</h3>
          <p className="max-w-sm text-sm text-[#525252] dark:text-[#a3a3a3]">
            Add your first student to start assigning homework and tracking
            progress.
          </p>
          <div className="mt-1">
            <AddStudentButton />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(students ?? []).map((s) => {
            const name = s.full_name || s.email || "Student";
            return (
              <div key={s.id} className="card flex flex-col p-6 shadow-[var(--shadow-sm)]">
                <Link
                  href={`/tutor/students/${s.id}`}
                  className="group flex items-start gap-3"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-foreground bg-[#fafafa] dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] ring-2 ring-card"
                  >
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground group-hover:underline">
                      {s.full_name || "—"}
                    </p>
                    <p className="truncate text-xs text-[#737373] dark:text-[#a3a3a3]">
                      {s.email}
                    </p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </Link>

                <p className="mt-4 text-xs text-[#737373] dark:text-[#a3a3a3] font-mono">
                  Joined {formatDate(s.created_at)}
                </p>

                <div className="mt-4 border-t border-border pt-4">
                  <AssignTaskButton
                    students={studentOptions}
                    categories={categories ?? []}
                    defaultStudentId={s.id}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>
            );
          })}

          {(invites ?? []).map((inv) => {
            const name = inv.full_name || "Student";
            return (
              <div
                key={inv.id}
                className="card flex flex-col p-6 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#fafafa] dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-sm font-semibold text-muted-foreground ring-2 ring-card">
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {inv.full_name || "—"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-[#737373] dark:text-[#a3a3a3] mt-0.5">
                      <Clock className="size-3.5 text-warning-orange" /> Awaiting sign-up
                    </p>
                  </div>
                  <Badge variant="outline">Invited</Badge>
                </div>

                <p className="mt-4 text-xs text-[#737373] dark:text-[#a3a3a3] font-mono">
                  Invited {formatDate(inv.created_at)}
                </p>

                <div className="mt-4 border-t border-border pt-4">
                  <PendingInviteActions inviteId={inv.id} token={inv.token} />
                </div>
              </div>
            );
          })}

          <AddStudentTile />
        </div>
      )}
    </div>
  );
}

function AddStudentTile() {
  return (
    <div className="flex min-h-[13rem] items-center justify-center rounded-[12px] border border-dashed border-[#d4d4d4] dark:border-[#262626] hover:border-black dark:hover:border-white transition-colors duration-200">
      <AddStudentButton variant="ghost" />
    </div>
  );
}
