import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DueBadge } from "@/components/ui/due-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dueState, formatDate, formatDateTime, typeLabel } from "@/lib/format";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTutor();
  const { id } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at, role")
    .eq("id", id)
    .single();
  if (!student || student.role !== "student") notFound();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, type, due_at, completion_pct")
    .eq("student_id", id)
    .order("due_at", { ascending: false });

  const all = assignments ?? [];
  const active = all.filter((a) => a.completion_pct < 100);
  const completed = all.filter((a) => a.completion_pct >= 100);
  const avg =
    all.length === 0
      ? 0
      : Math.round(
          all.reduce((sum, a) => sum + a.completion_pct, 0) / all.length,
        );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link
          href="/tutor/students"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          All students
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {student.full_name || student.email}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {student.email} · joined {formatDate(student.created_at)}
            </p>
          </div>
          <Link
            href={`/tutor/assignments/new?student=${student.id}`}
            className={cn(buttonVariants(), "shrink-0")}
          >
            New assignment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Active" value={active.length} />
        <Stat label="Completed" value={completed.length} />
        <Stat label="Avg progress" value={`${avg}%`} />
      </div>

      <Section title="Active assignments">
        {active.length === 0 ? (
          <Empty>No active assignments.</Empty>
        ) : (
          <AssignmentList items={active} />
        )}
      </Section>

      <Section title="History">
        {completed.length === 0 ? (
          <Empty>No completed assignments yet.</Empty>
        ) : (
          <AssignmentList items={completed} />
        )}
      </Section>
    </div>
  );
}

type AssignmentItem = {
  id: string;
  title: string;
  type: "problem_set" | "reading_notes";
  due_at: string;
  completion_pct: number;
};

function AssignmentList({ items }: { items: AssignmentItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((a) => (
        <li key={a.id}>
          <Link href={`/tutor/assignments/${a.id}`} className="group block">
            <Card className="gap-4 py-5 transition-all group-hover:ring-primary/40">
              <CardContent className="flex flex-col gap-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {typeLabel(a.type)} · due {formatDateTime(a.due_at)}
                    </div>
                  </div>
                  <DueBadge state={dueState(a.due_at, a.completion_pct)} />
                </div>
                <ProgressBar value={a.completion_pct} />
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="gap-1 py-5">
      <CardContent className="px-5">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
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
