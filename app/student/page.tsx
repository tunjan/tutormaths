import { CheckCircle2 } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="animate-rise">
      <PageHeader
        eyebrow="My homework"
        title="My practice"
        description="Your assignments, with progress you control."
        actions={<RequestHomeworkButton />}
      />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl">Active</h2>
        <span className="tabular text-sm text-ink-faint">
          {active.length} task{active.length === 1 ? "" : "s"}
        </span>
      </div>

      {active.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success-muted text-success">
            <CheckCircle2 className="size-6" />
          </span>
          <h3 className="text-xl">Nothing due right now</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {completed.length > 0
              ? "You're all caught up. Want a head start? Ask for more."
              : "Use “Request more practice” above when you’re ready for work."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-calm">
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

      {completed.length > 0 && (
        <>
          <h2 className="mb-4 mt-9 text-xl">Completed</h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-calm">
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
        </>
      )}
    </div>
  );
}
