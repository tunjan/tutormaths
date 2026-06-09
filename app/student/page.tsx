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
    <div className="mx-auto max-w-3xl animate-rise">
      <PageHeader
        title="My practice"
        description="Your assignments, with progress you control."
        actions={<RequestHomeworkButton />}
      />

      <div className="mb-4 mt-12 flex items-baseline justify-between border-b border-border/40 pb-2">
        <h2 className="text-sm font-medium tracking-tight text-foreground">Active Tasks</h2>
        <span className="tabular text-xs text-muted-foreground">
          {active.length} task{active.length === 1 ? "" : "s"}
        </span>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center animate-fade-in">
          <div className="space-y-2">
            <h3 className="text-base font-normal text-foreground">Nothing due right now</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {completed.length > 0
                ? "You're all caught up. Want a head start? Ask for more."
                : "Use “Request more practice” above when you’re ready for work."}
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/40 stagger-children mb-12">
          {active.map((a) => (
            <div key={a.id} className="group/row animate-fade-in">
              <AssignmentRow
                href={`/student/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                reviewStatus={a.review_status}
                unread={unread.has(a.id)}
              />
            </div>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="animate-fade-in mt-12" style={{ animationDelay: '200ms' }}>
          <div className="mb-4 flex items-baseline justify-between border-b border-border/40 pb-2">
            <h2 className="text-sm font-medium tracking-tight text-foreground">Completed</h2>
            <span className="tabular text-xs text-muted-foreground">
              {completed.length} task{completed.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="divide-y divide-border/40 stagger-children opacity-80 transition-opacity hover:opacity-100">
            {completed.map((a) => (
              <div key={a.id} className="group/row animate-fade-in">
                <AssignmentRow
                  href={`/student/assignments/${a.id}`}
                  title={a.title}
                  type={a.type}
                  dueAt={a.due_at}
                  pct={a.completion_pct}
                  reviewStatus={a.review_status}
                  unread={unread.has(a.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
