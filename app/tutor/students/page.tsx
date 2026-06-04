import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InviteStudentForm } from "@/components/invite-student-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDate } from "@/lib/format";

export default async function StudentsPage() {
  await requireTutor();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "student")
    .order("full_name", { ascending: true });

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold tracking-tight">Students</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite a student</CardTitle>
          <CardDescription>
            We email a secure sign-in link — you never set or hold their
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteStudentForm />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <SectionHeading>
          {students?.length ?? 0} student{students?.length === 1 ? "" : "s"}
        </SectionHeading>
        {!students || students.length === 0 ? (
          <Card className="py-10">
            <CardContent className="text-center text-sm text-muted-foreground">
              No students yet — invite one above.
            </CardContent>
          </Card>
        ) : (
          <Card className="py-0">
            <CardContent className="divide-y divide-border px-0">
              {students.map((s) => (
                <Link
                  key={s.id}
                  href={`/tutor/students/${s.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{s.full_name || "—"}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    Joined {formatDate(s.created_at)}
                    <ChevronRight className="size-4 text-muted-foreground/60" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
