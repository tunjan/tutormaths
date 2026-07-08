import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { BackLink } from "@/components/ui/back-link";
import { AssignmentRow } from "@/components/assignment-row";
import { cn } from "@/lib/utils";
import { formatDate, type ReviewStatus } from "@/lib/format";

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
    .select("id, title, type, due_at, completion_pct, review_status")
    .eq("student_id", id)
    .order("due_at", { ascending: false });

  const all = assignments ?? [];
  const active = all.filter((a) => a.review_status !== "approved");
  const completed = all.filter((a) => a.review_status === "approved");
  const avg =
    all.length === 0
      ? 0
      : Math.round(
          all.reduce((sum, a) => sum + a.completion_pct, 0) / all.length,
        );

  return (
    <div className="flex flex-col gap-10 animate-rise">
      <div>
        <BackLink href="/tutor/students" className="mb-4">
          All students
        </BackLink>

        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-h1 font-semibold text-foreground">
              {student.full_name || student.email}
            </h1>
            <p className="mt-1 text-sm text-content-subtle">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Stat label="Active" value={active.length} />
        <Stat label="Completed" value={completed.length} />
        <Stat label="Avg progress" value={`${avg}%`} />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <SectionHeading>Active assignments</SectionHeading>
        </div>
        {active.length === 0 ? (
          <Empty>No active assignments.</Empty>
        ) : (
          <AssignmentList items={active} />
        )}
      </div>

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
  review_status: ReviewStatus;
};

function AssignmentList({ items }: { items: AssignmentItem[] }) {
  return (
    <div className="flex flex-col stagger-children overflow-hidden rounded-xl border border-border-subtle bg-card divide-y divide-border-muted">
      {items.map((a) => (
        <AssignmentRow
          key={a.id}
          href={`/tutor/assignments/${a.id}`}
          title={a.title}
          type={a.type}
          dueAt={a.due_at}
          pct={a.completion_pct}
          reviewStatus={a.review_status}
        />
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card card-interactive flex select-none flex-col gap-1 p-6">
      <span className="text-xs font-medium text-content-subtle">{label}</span>
      <span className="font-metric mt-1 text-3xl font-semibold leading-none text-content-emphasis">
        {value}
      </span>
    </div>
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
      <SectionHeading>{title}</SectionHeading>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="card p-6 text-center text-sm text-content-subtle">
      {children}
    </p>
  );
}
