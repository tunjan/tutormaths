import Link from "next/link";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DueBadge } from "@/components/ui/due-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dueState, formatDateTime, typeLabel } from "@/lib/format";

export default async function TutorDashboard() {
  await requireTutor();
  const supabase = await createClient();

  const [{ data: assignments }, { data: students }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, type, due_at, completion_pct, student_id")
      .order("due_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email").eq("role", "student"),
  ]);

  const nameById = new Map(
    (students ?? []).map((s) => [s.id, s.full_name || s.email || "Student"]),
  );
  const all = assignments ?? [];
  const active = all.filter((a) => a.completion_pct < 100);
  const completed = all.filter((a) => a.completion_pct >= 100);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link href="/tutor/assignments/new" className={cn(buttonVariants())}>
          New assignment
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Students" value={students?.length ?? 0} href="/tutor/students" />
        <Stat label="Active" value={active.length} />
        <Stat label="Completed" value={completed.length} />
      </div>

      <Section title="Active assignments">
        {active.length === 0 ? (
          <Empty>No active assignments.</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((a) => (
              <AssignmentRow
                key={a.id}
                id={a.id}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                student={nameById.get(a.student_id) ?? "Student"}
              />
            ))}
          </ul>
        )}
      </Section>

      {completed.length > 0 && (
        <Section title="Completed">
          <ul className="flex flex-col gap-3">
            {completed.map((a) => (
              <AssignmentRow
                key={a.id}
                id={a.id}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                student={nameById.get(a.student_id) ?? "Student"}
              />
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <Card className="gap-1 py-5">
      <CardContent className="px-5">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="transition-opacity hover:opacity-80">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <Card className="py-10">
      <CardContent className="text-center text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

function AssignmentRow({
  id,
  title,
  type,
  dueAt,
  pct,
  student,
}: {
  id: string;
  title: string;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  pct: number;
  student: string;
}) {
  return (
    <li>
      <Link href={`/tutor/assignments/${id}`} className="group block">
        <Card className="gap-4 py-5 transition-all group-hover:ring-primary/40">
          <CardContent className="flex flex-col gap-4 px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{title}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {student} · {typeLabel(type)} · due {formatDateTime(dueAt)}
                </div>
              </div>
              <DueBadge state={dueState(dueAt, pct)} />
            </div>
            <ProgressBar value={pct} />
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
