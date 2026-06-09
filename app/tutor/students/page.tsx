import { Link } from "next-view-transitions";
import { ChevronRight } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
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

function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `oklch(0.62 0.13 ${Math.abs(hash) % 360})`;
}

export default async function StudentsPage() {
  await requireTutor();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "student")
    .order("full_name", { ascending: true });

  // Acceptance status: a student who hasn't signed in yet still has a pending
  // invite. last_sign_in_at lives in auth.users, so we read it with the admin
  // client (tutor-only page, server-side).
  const accepted = new Set<string>();
  if (students && students.length > 0) {
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authData?.users ?? []) {
      if (u.last_sign_in_at) accepted.add(u.id);
    }
  }

  const studentOptions = (students ?? []).map((s) => ({
    id: s.id,
    full_name: s.full_name ?? "",
    email: s.email,
  }));

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Tutor workspace"
        title="Students"
        description="Everyone you're currently tutoring."
        actions={<AddStudentButton />}
      />

      {!students || students.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[var(--accent-cobalt-soft)] text-primary">
            <ChevronRight className="size-6" />
          </span>
          <h3 className="text-xl">No students yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add your first student to start assigning homework and tracking
            progress.
          </p>
          <div className="mt-1">
            <AddStudentButton />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => {
            const name = s.full_name || s.email || "Student";
            return (
              <div key={s.id} className="surface-card flex flex-col p-5">
                <Link
                  href={`/tutor/students/${s.id}`}
                  className="group flex items-start gap-3"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ring-2 ring-card"
                    style={{ backgroundColor: tintFor(name) }}
                  >
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground group-hover:underline">
                      {s.full_name || "—"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.email}
                    </p>
                  </div>
                  {accepted.has(s.id) ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="outline">Invited</Badge>
                  )}
                </Link>

                <p className="mt-4 text-xs text-ink-faint">
                  {accepted.has(s.id) ? "Joined" : "Invited"}{" "}
                  {formatDate(s.created_at)}
                </p>

                <div className="mt-3 border-t border-border pt-3">
                  <AssignTaskButton
                    students={studentOptions}
                    defaultStudentId={s.id}
                    variant="soft"
                    size="sm"
                    className="w-full"
                  />
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

/** A dashed "add" affordance that mirrors the student cards' footprint. */
function AddStudentTile() {
  return (
    <div className="flex min-h-[13rem] items-center justify-center rounded-2xl border-2 border-dashed border-line-strong">
      <AddStudentButton variant="soft" />
    </div>
  );
}
