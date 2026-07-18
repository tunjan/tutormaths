import { Link } from "next-view-transitions";
import { Clock, UsersRound } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { AddStudentButton } from "@/components/add-student-button";
import { AssignTaskButton } from "@/components/assign-task-button";
import { PendingInviteActions } from "@/components/pending-invite-actions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
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

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Tutor workspace"
        title="Students"
        description="Everyone you're currently tutoring."
        actions={<AddStudentButton />}
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
        <div className="card-gallery">
          {(students ?? []).map((s) => {
            const name = s.full_name || s.email || "Student";
            return (
              <Card key={s.id}>
                <Link
                  href={`/tutor/students/${s.id}`}
                  className="group flex items-start gap-3"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-bg-subtle text-label text-content-emphasis"
                  >
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label text-foreground group-hover:underline">
                      {s.full_name || "—"}
                    </p>
                    <p className="truncate text-caption text-content-subtle">
                      {s.email}
                    </p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </Link>

                <p className="mt-4 text-caption text-content-subtle">
                  Joined {formatDate(s.created_at)}
                </p>

                <Separator className="my-4" />
                <div>
                  <AssignTaskButton
                    students={recipientOptions}
                    categories={categories ?? []}
                    defaultStudentId={s.id}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                </div>
              </Card>
            );
          })}

          {(invites ?? []).map((inv) => {
            const name = inv.full_name || "Student";
            return (
              <Card key={inv.id}>
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-bg-subtle text-label text-content-subtle">
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label text-foreground">
                      {inv.full_name || "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-caption text-content-attention">
                      <Clock className="size-4" /> Awaiting sign-up
                    </p>
                  </div>
                  <Badge variant="outline">Invited</Badge>
                </div>

                <p className="mt-4 text-caption text-content-subtle">
                  Invited {formatDate(inv.created_at)}
                </p>

                <Separator className="my-4" />
                <div>
                  <AssignTaskButton
                    students={recipientOptions}
                    categories={categories ?? []}
                    defaultStudentId={inv.id}
                    variant="outline"
                    size="sm"
                    className="mb-2 w-full"
                  />
                  <PendingInviteActions inviteId={inv.id} token={inv.token} />
                </div>
              </Card>
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
    <div className="flex min-h-52 items-center justify-center rounded-md border border-dashed border-border transition-colors duration-base hover:border-border-emphasis">
      <AddStudentButton variant="ghost" />
    </div>
  );
}
