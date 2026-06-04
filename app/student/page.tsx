import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssignmentRow } from "@/components/assignment-row";

export default async function StudentDashboard() {
  await requireStudent();
  const supabase = await createClient();

  // RLS limits this to the student's own assignments.
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, type, due_at, completion_pct")
    .order("due_at", { ascending: true });

  const all = assignments ?? [];
  const active = all.filter((a) => a.completion_pct < 100);
  const completed = all.filter((a) => a.completion_pct >= 100);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">My homework</h1>
        <RequestHomeworkButton />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeading>Active</SectionHeading>
        {active.length === 0 ? (
          <Card className="py-10">
            <CardContent className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
              <p>
                {completed.length > 0
                  ? "All caught up — nothing due right now."
                  : "Nothing due right now."}
              </p>
              <RequestHomeworkButton />
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/student/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
              />
            ))}
          </ul>
        )}
      </section>

      {completed.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading>Completed</SectionHeading>
          <ul className="flex flex-col gap-3">
            {completed.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/student/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
