import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssignmentRow } from "@/components/assignment-row";

export default async function StudentDashboard() {
  await requireStudent();
  const supabase = await createClient();

  // RLS limits this to the student's own assignments.
  const [{ data: assignments }, unread] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, type, due_at, completion_pct, review_status")
      .order("due_at", { ascending: true }),
    unreadAssignmentIds(),
  ]);

  const all = assignments ?? [];
  const active = all.filter((a) => a.review_status !== "approved");
  const completed = all.filter((a) => a.review_status === "approved");

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
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>
                {completed.length > 0
                  ? "All caught up — nothing to work on right now."
                  : "Nothing to work on right now. Use “Request more homework” above when you’re ready."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {active.map((a) => (
              <li key={a.id}>
                <AssignmentRow
                  href={`/student/assignments/${a.id}`}
                  title={a.title}
                  type={a.type}
                  dueAt={a.due_at}
                  pct={a.completion_pct}
                  reviewStatus={a.review_status}
                  unread={unread.has(a.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {completed.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading>Completed</SectionHeading>
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {completed.map((a) => (
              <li key={a.id}>
                <AssignmentRow
                  href={`/student/assignments/${a.id}`}
                  title={a.title}
                  type={a.type}
                  dueAt={a.due_at}
                  pct={a.completion_pct}
                  reviewStatus={a.review_status}
                  unread={unread.has(a.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
