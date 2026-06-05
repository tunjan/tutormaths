import Link from "next/link";
import { Clock, Inbox, Plus, Users } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { unreadAssignmentIds } from "@/lib/queries";
import { buttonVariants } from "@/components/ui/button";
import {
  TutorAssignmentBrowser,
  type BrowserItem,
} from "@/components/tutor-assignment-browser";
import { cn } from "@/lib/utils";

export default async function TutorDashboard() {
  await requireTutor();
  const supabase = await createClient();

  const [{ data: assignments }, { data: students }, unread] = await Promise.all([
    supabase
      .from("assignments")
      .select(
        "id, title, type, due_at, completion_pct, student_id, review_status",
      )
      .order("due_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email").eq("role", "student"),
    unreadAssignmentIds(),
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
    review_status: a.review_status,
    student: nameById.get(a.student_id) ?? "Student",
    unread: unread.has(a.id),
  }));

  const awaiting = all.filter((a) => a.review_status === "submitted").length;
  // Overdue = the student is late and it's on them to act (not yet submitted,
  // not approved). Submitted-but-late work lives under "Awaiting your review".
  // This definition matches the Overdue section in TutorAssignmentBrowser so
  // the headline number and the list always agree.
  const overdue = all.filter(
    (a) =>
      (a.review_status === "assigned" || a.review_status === "needs_work") &&
      new Date(a.due_at).getTime() < Date.now(),
  ).length;

  const hasStudents = (students?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4 bg-card p-6 border-2 border-foreground">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Dashboard</h1>
          <p className="mt-1.5 text-[0.95rem] text-muted-foreground">
            {!hasStudents ? (
              "Let's get you set up."
            ) : awaiting === 0 && overdue === 0 ? (
              "You're all caught up."
            ) : (
              <>
                {awaiting > 0 && (
                  <>
                    {awaiting} to review
                    {overdue > 0 && " · "}
                  </>
                )}
                {overdue > 0 && (
                  <span className="text-destructive">{overdue} overdue</span>
                )}
              </>
            )}
          </p>
        </div>
        {hasStudents && (
          <Link
            href="/tutor/assignments/new"
            className={cn(
              buttonVariants(),
              "shrink-0 gap-2 shadow-[var(--shadow-calm)]",
            )}
          >
            <Plus className="size-4" />
            New assignment
          </Link>
        )}
      </header>

      {hasStudents ? (
        <>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              icon={<Users className="size-[1.05rem]" />}
              label="Students"
              value={students?.length ?? 0}
              href="/tutor/students"
            />
            <Stat
              icon={<Inbox className="size-[1.05rem]" />}
              label="Awaiting review"
              value={awaiting}
              href={awaiting > 0 ? "#awaiting" : undefined}
            />
            <Stat
              icon={<Clock className="size-[1.05rem]" />}
              label="Overdue"
              value={overdue}
              href={overdue > 0 ? "#overdue" : undefined}
              tone="destructive"
            />
          </dl>

          <TutorAssignmentBrowser items={items} />
        </>
      ) : (
        <Onboarding />
      )}
    </div>
  );
}

/** First-run guidance: a tutor with no students yet can't do anything else. */
function Onboarding() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 border-2 border-foreground bg-card px-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome to Maths Tasks
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Get set up in two steps: invite a student, then send them their first
          assignment. You&rsquo;ll review their work and track progress right
          here.
        </p>
      </div>
      <Link href="/tutor/students" className={cn(buttonVariants())}>
        Invite your first student
      </Link>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  href,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
  tone?: "destructive";
}) {
  // A calm stat card: a quiet icon tile beside a figure and label. The figure
  // takes its tone only when it represents something that needs attention.
  const inner = (
    <div className="flex items-center gap-3 border-2 border-foreground bg-card px-5 py-4 hover:bg-foreground hover:text-background transition-colors group-hover/stat:bg-foreground group-hover/stat:text-background">
      <span className="flex size-9 items-center justify-center border-2 border-current bg-background text-current">
        {icon}
      </span>
      <div>
        <div
          className={cn(
            "text-2xl font-semibold tracking-tight tabular-nums",
            tone === "destructive" && value > 0 && "text-destructive",
          )}
        >
          {value}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
  if (!href) return <div>{inner}</div>;
  // In-page anchors (#awaiting / #overdue) scroll within the dashboard; route
  // links (e.g. /tutor/students) navigate.
  return href.startsWith("#") ? (
    <a href={href} className="group/stat block">
      {inner}
    </a>
  ) : (
    <Link href={href} className="group/stat block">
      {inner}
    </Link>
  );
}
