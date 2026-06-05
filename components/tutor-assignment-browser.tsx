"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

/**
 * Client-side search across a tutor's assignments so the dashboard stays usable
 * as the list grows. Matches title or student name; sections are split by the
 * review workflow — work awaiting review surfaces first.
 */
export function TutorAssignmentBrowser({ items }: { items: BrowserItem[] }) {
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
    const now = Date.now();
    const isLate = (a: BrowserItem) => new Date(a.due_at).getTime() < now;
    const open = matched.filter(
      (a) => a.review_status === "assigned" || a.review_status === "needs_work",
    );
    return {
      awaiting: matched.filter((a) => a.review_status === "submitted"),
      // Late work the student still owes — its own section so the dashboard's
      // "Overdue" number maps to a place you can actually go.
      overdue: open.filter(isLate),
      active: open.filter((a) => !isLate(a)),
      completed: matched.filter((a) => a.review_status === "approved"),
    };
  }, [items, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by assignment or student…"
          aria-label="Search assignments"
          className="h-10 pl-9"
        />
      </div>

      {awaiting.length > 0 && (
        <section id="awaiting" className="scroll-mt-24">
          <SectionHead
            tone="info"
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
            tone="destructive"
            icon={<Clock className="size-4" />}
            title="Overdue"
            count={overdue.length}
          />
          <List items={overdue} />
        </section>
      )}

      <section>
        <SectionHead title="Active assignments" count={active.length} />
        {active.length === 0 ? (
          query ? (
            <Empty>No active assignments match your search.</Empty>
          ) : (
            <div className="flex flex-col items-center gap-4 border-2 border-foreground bg-card px-6 py-12 text-center font-medium">
              <p>No active assignments yet.</p>
              <Link
                href="/tutor/assignments/new"
                className={cn(buttonVariants())}
              >
                Create an assignment
              </Link>
            </div>
          )
        ) : (
          <List items={active} />
        )}
      </section>

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
  tone,
  muted,
}: {
  title: string;
  count: number;
  icon?: React.ReactNode;
  tone?: "info" | "destructive";
  muted?: boolean;
}) {
  const tileCls =
    tone === "info"
      ? "bg-info/10 text-info"
      : tone === "destructive"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-muted-foreground";
  const countCls =
    tone === "info"
      ? "bg-info text-white dark:text-background"
      : tone === "destructive"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-muted-foreground";
  return (
    <div className="mb-3 flex items-center gap-2.5 px-1">
      {icon && (
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            tileCls,
          )}
        >
          {icon}
        </span>
      )}
      <h2
        className={cn(
          "text-[0.95rem] font-bold uppercase tracking-wider bg-card ",
          muted && "text-muted-foreground",
        )}
      >
        {title}
      </h2>
      {count > 0 && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
            countCls,
          )}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function List({ items }: { items: BrowserItem[] }) {
  return (
    <div className="stagger-children divide-y-2 divide-foreground overflow-hidden border-2 border-foreground bg-card">
      {items.map((a) => (
        <AssignmentRow
          key={a.id}
          href={`/tutor/assignments/${a.id}`}
          title={a.title}
          type={a.type}
          dueAt={a.due_at}
          pct={a.completion_pct}
          reviewStatus={a.review_status}
          student={a.student}
          unread={a.unread}
        />
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-2 border-foreground bg-card px-6 py-12 text-center text-sm font-medium">
      {children}
    </p>
  );
}
