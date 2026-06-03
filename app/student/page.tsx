import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DueBadge } from "@/components/ui/due-badge";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { Card, CardContent } from "@/components/ui/card";
import { dueState, formatDateTime, typeLabel } from "@/lib/format";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My homework</h1>
        <RequestHomeworkButton />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Active</h2>
        {active.length === 0 ? (
          <Card className="py-10">
            <CardContent className="text-center text-sm text-muted-foreground">
              Nothing due right now.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((a) => (
              <Row key={a.id} {...a} />
            ))}
          </ul>
        )}
      </section>

      {completed.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Completed
          </h2>
          <ul className="flex flex-col gap-3">
            {completed.map((a) => (
              <Row key={a.id} {...a} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Row({
  id,
  title,
  type,
  due_at,
  completion_pct,
}: {
  id: string;
  title: string;
  type: "problem_set" | "reading_notes";
  due_at: string;
  completion_pct: number;
}) {
  return (
    <li>
      <Link href={`/student/assignments/${id}`} className="group block">
        <Card className="gap-4 py-5 transition-all group-hover:ring-primary/40">
          <CardContent className="flex flex-col gap-4 px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{title}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {typeLabel(type)} · due {formatDateTime(due_at)}
                </div>
              </div>
              <DueBadge state={dueState(due_at, completion_pct)} />
            </div>
            <ProgressBar value={completion_pct} />
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
