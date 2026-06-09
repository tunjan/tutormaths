"use client";

import { useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { Clock, Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { AssignmentRow } from "@/components/assignment-row";
import { MisoAssignmentGrid, MisoAssignmentCard } from "@/components/miso-assignment-card";
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
      // Late work the student still owes — its own section so the dashboard's
      // "Overdue" number maps to a place you can actually go.
      overdue: open.filter(isLate),
      active: open.filter((a) => !isLate(a)),
      completed: matched.filter((a) => a.review_status === "approved"),
    };
  }, [items, query, nowMs]);

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

      <div className="flex flex-col gap-10 lg:gap-16 my-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-[40px] md:text-[56px] font-semibold tracking-[-0.04em] text-foreground leading-tight">
              Active assignments
            </h2>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-3 text-sm font-semibold tabular-nums text-primary-foreground">
              {active.length}
            </span>
          </div>
        </div>
        {active.length === 0 ? (
          query ? (
            <Empty>No active assignments match your search.</Empty>
          ) : (
            <div className="bg-card border border-border rounded-[24px] flex flex-col items-center gap-6 px-10 py-16 md:py-24 text-center">
              <p className="text-muted-foreground text-lg">No active assignments yet.</p>
              <Link
                href="/tutor/assignments/new"
                className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              >
                Create an assignment
              </Link>
            </div>
          )
        ) : (
          <MisoAssignmentGrid>
            {active.map((a) => (
              <MisoAssignmentCard
                key={a.id}
                href={`/tutor/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                reviewStatus={a.review_status}
                student={a.student}
              />
            ))}
          </MisoAssignmentGrid>
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
          "text-base font-semibold",
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
    <div className="stagger-children divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-calm">
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
    <p className="surface-card px-6 py-12 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
