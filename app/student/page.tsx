import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { AssignmentRow } from "@/components/assignment-row";

export default async function StudentDashboard() {
  await requireStudent();
  const supabase = await createClient();

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
    <div className="w-full py-2 animate-rise">
      <PageHeader
        title="My practice"
        description="Your assignments, with progress you control."
        actions={<RequestHomeworkButton />}
      />

      <div className="mb-4 mt-10 flex items-baseline justify-between border-b border-[#e5e5e5] dark:border-[#262626] pb-3">
        <h2 className="text-h4 font-semibold tracking-tight text-foreground">Active Tasks</h2>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {active.length} task{active.length === 1 ? "" : "s"}
        </span>
      </div>

      {active.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in bg-card border border-border shadow-[var(--shadow-sm)]">
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-semibold text-foreground">Nothing due right now</h3>
            <p className="text-sm text-[#525252] dark:text-[#a3a3a3]">
              {completed.length > 0
                ? "You're all caught up. Want a head start? Ask for more."
                : "Use “Request more practice” above when you’re ready for work."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col stagger-children mb-10 border border-[#e5e5e5] dark:border-[#262626] rounded-[12px] divide-y divide-[#e5e5e5] dark:divide-[#262626] bg-card overflow-hidden shadow-[var(--shadow-sm)]">
          {active.map((a) => (
            <div key={a.id} className="animate-fade-in">
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
        <div className="animate-fade-in mt-10" style={{ animationDelay: '100ms' }}>
          <div className="mb-4 flex items-baseline justify-between border-b border-[#e5e5e5] dark:border-[#262626] pb-3">
            <h2 className="text-h4 font-semibold tracking-tight text-foreground">Completed</h2>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {completed.length} task{completed.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-col stagger-children border border-[#e5e5e5] dark:border-[#262626] rounded-[12px] divide-y divide-[#e5e5e5] dark:divide-[#262626] bg-card overflow-hidden shadow-[var(--shadow-sm)]">
            {completed.map((a) => (
              <div key={a.id} className="animate-fade-in">
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
