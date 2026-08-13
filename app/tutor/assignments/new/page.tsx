import Link from "next/link";
import { BellRing, CalendarClock, FileText, Info } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewAssignmentForm } from "./new-assignment-form";
import { Card, CardContent } from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/page-header";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

const tips = [
  {
    icon: FileText,
    title: "Attach the work as a PDF",
    body: "Up to 20 MB. The student reads it inline and uploads their solution back.",
  },
  {
    icon: CalendarClock,
    title: "Set a realistic due date",
    body: "It defaults to a week out at 5pm. Students see it counting down on their dashboard.",
  },
  {
    icon: BellRing,
    title: "They're notified instantly",
    body: "Creating the assignment sends a notification, with reminders as the deadline nears.",
  },
];

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  await requireTutor();
  const { student } = await searchParams;
  const supabase = await createClient();

  const [{ data: students }, { data: invites }, { data: categories }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    supabase
      .from("student_invites")
      .select("id, full_name")
      .is("accepted_at", null)
      .order("full_name"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  const recipients = [
    ...(students ?? []),
    ...(invites ?? []).map((invite) => ({
      id: invite.id,
      full_name: invite.full_name,
      email: null,
      pending: true,
    })),
  ];

  const defaultStudentId = recipients.some((s) => s.id === student)
    ? student
    : "";

  const hasStudents = recipients.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <BackLink href="/tutor">Dashboard</BackLink>
        <PageHeader
          className="mt-4 mb-0"
          title="New assignment"
          description="Attach a PDF, pick a student, and set a due date. They’ll be notified right away."
        />
      </header>

      {!hasStudents ? (
        <Alert variant="info" className="max-w-2xl">
          <Info aria-hidden />
          <AlertDescription>
            You need a student first.{" "}
            <Link href="/tutor/students" className="text-content-info underline">
              Invite a student
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          {/* How it works — a horizontal strip so the form below gets full width
              for its fields-and-live-preview layout. */}
          <ul className="grid gap-4 sm:grid-cols-3">
            {tips.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-3 rounded-md border border-border bg-card p-6"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-bg-subtle text-content-default">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-label">{title}</p>
                  <p className="text-caption text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <Card>
            <CardContent>
              <NewAssignmentForm
                students={recipients}
                categories={categories ?? []}
                defaultStudentId={defaultStudentId}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
