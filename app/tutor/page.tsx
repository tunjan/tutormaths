import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TutorAssignmentBrowser,
  type BrowserItem,
} from "@/components/tutor-assignment-browser";
import { cn } from "@/lib/utils";

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
  const items: BrowserItem[] = all.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    due_at: a.due_at,
    completion_pct: a.completion_pct,
    student: nameById.get(a.student_id) ?? "Student",
  }));
  const active = all.filter((a) => a.completion_pct < 100);
  const completed = all.filter((a) => a.completion_pct >= 100);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/tutor/assignments/new"
          className={cn(buttonVariants(), "shrink-0")}
        >
          New assignment
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Students" value={students?.length ?? 0} href="/tutor/students" />
        <Stat label="Active" value={active.length} />
        <Stat label="Completed" value={completed.length} />
      </div>

      <TutorAssignmentBrowser items={items} />
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
    <Card className="h-full gap-1 py-5 transition-all group-hover/stat:ring-primary/40">
      <CardContent className="px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {href && (
            <ArrowRight className="size-4 text-muted-foreground/60 transition-transform group-hover/stat:translate-x-0.5" />
          )}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="group/stat block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
