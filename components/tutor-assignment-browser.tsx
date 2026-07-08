"use client";

import { useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { Clock, Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { AssignmentRow } from "@/components/assignment-row";
import { cn } from "@/lib/utils";

import type { ReviewStatus } from "@/lib/format";

export interface BrowserItem {
  id: string;
  title: string;
  type: "problem_set" | "reading_notes";
  due_at: string;
  completion_pct: number;
  review_status: ReviewStatus;
  student: string;
  unread: boolean;
}

export function TutorAssignmentBrowser({ items, nowMs }: { items: BrowserItem[]; nowMs: number }) {
  const [query, setQuery] = useState("");

  const { awaiting, overdue, active, completed } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.student.toLowerCase().includes(q),
      )
      : items;
    const isLate = (a: BrowserItem) => new Date(a.due_at).getTime() < nowMs;
    const open = matched.filter(
      (a) => a.review_status === "assigned" || a.review_status === "needs_work",
    );
    return {
      awaiting: matched.filter((a) => a.review_status === "submitted"),
      overdue: open.filter(isLate),
      active: open.filter((a) => !isLate(a)),
      completed: matched.filter((a) => a.review_status === "approved"),
    };
  }, [items, query, nowMs]);

  return (
    <div className="flex flex-col gap-10">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-text-subtle" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by assignment or student…"
          aria-label="Search assignments"
          className="h-11 pl-11 pr-4"
        />
      </div>

      {awaiting.length > 0 && (
        <section id="awaiting" className="scroll-mt-24">
          <SectionHead
            icon={<Inbox className="size-4" />}
            title="Awaiting your review"
            count={awaiting.length}
          />
          <List items={awaiting} />
        </section>
      )}

      {overdue.length > 0 && (
        <section id="overdue" className="scroll-mt-24">
          <SectionHead
            icon={<Clock className="size-4" />}
            title="Overdue"
            count={overdue.length}
          />
          <List items={overdue} />
        </section>
      )}

      <div className="flex flex-col gap-3">
        <SectionHead title="Active assignments" count={active.length} />
        {active.length === 0 ? (
          query ? (
            <Empty>No active assignments match your search.</Empty>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center animate-fade-in mt-4">
              <p className="text-base text-content-subtle">No active assignments yet.</p>
              <Link
                href="/tutor/assignments/new"
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                Create an assignment
              </Link>
            </div>
          )
        ) : (
          <List items={active} />
        )}
      </div>

      {(completed.length > 0 || query.trim()) && (
        <section>
          <SectionHead title="Completed" count={completed.length} muted />
          {completed.length > 0 ? (
            <List items={completed} />
          ) : (
            <Empty>No completed assignments match your search.</Empty>
          )}
        </section>
      )}
    </div>
  );
}

function SectionHead({
  title,
  count,
  icon,
  muted,
}: {
  title: string;
  count: number;
  icon?: React.ReactNode;
  muted?: boolean;
  }) {
  return (
    <div className="mb-4 flex items-baseline justify-between border-b border-border-soft pb-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex size-5 items-center justify-center text-text-subtle">
            {icon}
          </span>
        )}
        <h2
          className={cn(
            "text-h4 font-semibold",
            muted ? "text-text-subtle" : "text-text-heading"
          )}
        >
          {title}
        </h2>
      </div>
      <span className="font-mono text-xs text-content-subtle">
        {count} assignment{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function List({ items }: { items: BrowserItem[] }) {
  return (
    <div className="flex flex-col stagger-children overflow-hidden rounded-xl border border-border-subtle bg-card divide-y divide-border-muted">
      {items.map((a) => (
        <div key={a.id} className="animate-fade-in">
          <AssignmentRow
            href={`/tutor/assignments/${a.id}`}
            title={a.title}
            type={a.type}
            dueAt={a.due_at}
            pct={a.completion_pct}
            reviewStatus={a.review_status}
            student={a.student}
            unread={a.unread}
          />
        </div>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-12 text-center text-base text-content-subtle">
      {children}
    </p>
  );
}
