import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { RequestHomeworkButton } from "@/components/request-homework-button";
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My practice</h1>
          <p className="mt-1.5 text-[0.95rem] text-muted-foreground">
            {active.length === 0
              ? completed.length > 0
                ? "All caught up — nice work."
                : "Nothing to do right now."
              : `${active.length} ${active.length === 1 ? "task" : "tasks"} to do`}
          </p>
        </div>
        <RequestHomeworkButton />
      </header>

      <section>
        <h2 className="mb-3 px-1 text-sm font-semibold tracking-tight text-foreground">Active</h2>
        {active.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            {completed.length > 0
              ? "All caught up — nothing to work on right now."
              : "Nothing to work on right now. Use “Request more practice” above when you’re ready."}
          </p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {active.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/student/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                reviewStatus={a.review_status}
                unread={unread.has(a.id)}
              />
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 px-1 text-sm font-semibold tracking-tight text-muted-foreground">
            Completed
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {completed.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/student/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                reviewStatus={a.review_status}
                unread={unread.has(a.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
