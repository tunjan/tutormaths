import { CheckCircle2 } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { AssignmentRow } from "@/components/assignment-row";
import { Mascot } from "@/components/mascot";

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
    <div className="w-full py-8 animate-rise">
      <PageHeader
        title="My practice"
        description="Your assignments, with progress you control."
        actions={<RequestHomeworkButton />}
      />

      <div className="mb-6 mt-24 flex items-baseline justify-between border-b border-border/40 pb-4">
        <h2 className="text-[24px] font-medium tracking-tight text-foreground">Active Tasks</h2>
        <span className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted-foreground">
          {active.length} task{active.length === 1 ? "" : "s"}
        </span>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center animate-fade-in rounded-2xl bg-secondary/20">
          <Mascot
            pose={completed.length > 0 ? "cheer" : "sleep"}
            className="size-28"
          />
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-foreground">Nothing due right now</h3>
            <p className="max-w-md text-[16px] leading-[1.6] text-muted-foreground">
              {completed.length > 0
                ? "You're all caught up. Want a head start? Ask for more."
                : "Use “Request more practice” above when you’re ready for work."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col stagger-children mb-24 border border-border rounded-xl divide-y divide-border bg-background overflow-hidden">
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
        <div className="animate-fade-in mt-24" style={{ animationDelay: '200ms' }}>
          <div className="mb-6 flex items-baseline justify-between border-b border-border/40 pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-foreground">Completed</h2>
            <span className="font-mono text-[12px] uppercase tracking-[0.05em] text-muted-foreground">
              {completed.length} task{completed.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-col stagger-children opacity-80 transition-opacity hover:opacity-100 border border-border rounded-xl divide-y divide-border bg-background overflow-hidden">
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
