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
import { Card } from "@/components/ui/card";
import {
  Empty as EmptyState,
  EmptyDescription,
} from "@/components/ui/empty";

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
            <h1 className="text-h1 text-foreground">
              {student.full_name || student.email}
            </h1>
            <p className="mt-1 text-caption text-content-subtle">
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
          <EmptyState className="p-8">
            <EmptyDescription>No active assignments.</EmptyDescription>
          </EmptyState>
        ) : (
          <AssignmentList items={active} />
        )}
      </div>

      <Section title="History">
        {completed.length === 0 ? (
          <EmptyState className="p-8">
            <EmptyDescription>No completed assignments yet.</EmptyDescription>
          </EmptyState>
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
    <div className="flex flex-col stagger-children divide-y divide-border-subtle overflow-hidden rounded-md border border-border bg-card">
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
    <Card>
      <span className="text-caption text-content-subtle">{label}</span>
      <span className="font-metric text-h1 tabular-nums text-content-emphasis">
        {value}
      </span>
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
      <SectionHeading>{title}</SectionHeading>
      {children}
    </section>
  );
}
