import Link from "next/link";
import { FileText, CalendarClock, BellRing } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewAssignmentForm } from "./new-assignment-form";
import { Card, CardContent } from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";

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

  const [{ data: students }, { data: categories }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  const defaultStudentId = students?.some((s) => s.id === student)
    ? student
    : "";

  const hasStudents = students && students.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <BackLink href="/tutor">Dashboard</BackLink>
        <div>
          <h1 className="text-3xl">New assignment</h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Attach a PDF, pick a student, and set a due date. They&rsquo;ll be
            notified right away.
          </p>
        </div>
      </header>

      {!hasStudents ? (
        <Card className="max-w-2xl py-8">
          <CardContent className="text-sm text-muted-foreground">
            You need a student first.{" "}
            <Link href="/tutor/students" className="text-primary underline">
              Invite a student
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* How it works — a horizontal strip so the form below gets full width
              for its fields-and-live-preview layout. */}
          <ul className="grid gap-4 sm:grid-cols-3">
            {tips.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-3 rounded-panel border border-border-soft bg-muted/30 p-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary ring-1 ring-foreground/10">
                  <Icon className="size-4" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <Card>
            <CardContent className="py-2">
              <NewAssignmentForm
                students={students}
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
