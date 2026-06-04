"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
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
    <div className="flex flex-col gap-10">
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
        <section
          id="awaiting"
          className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-info/30 bg-info-muted/40 p-4 sm:p-5"
        >
          <div className="flex items-center gap-2">
            <SectionHeading className="text-info">
              Awaiting your review
            </SectionHeading>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-info px-1.5 text-xs font-semibold text-white tabular-nums dark:text-background">
              {awaiting.length}
            </span>
          </div>
          <List items={awaiting} />
        </section>
      )}

      {overdue.length > 0 && (
        <section id="overdue" className="flex scroll-mt-24 flex-col gap-4">
          <div className="flex items-center gap-2">
            <SectionHeading className="text-destructive">Overdue</SectionHeading>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-xs font-semibold text-destructive tabular-nums">
              {overdue.length}
            </span>
          </div>
          <List items={overdue} />
        </section>
      )}

      <section className="flex flex-col gap-4">
        <SectionHeading>Active assignments</SectionHeading>
        {active.length === 0 ? (
          query ? (
            <Empty>No active assignments match your search.</Empty>
          ) : (
            <Card className="py-10">
              <CardContent className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
                <p>No active assignments yet.</p>
                <Link
                  href="/tutor/assignments/new"
                  className={cn(buttonVariants())}
                >
                  Create an assignment
                </Link>
              </CardContent>
            </Card>
          )
        ) : (
          <List items={active} />
        )}
      </section>

      {completed.length > 0 && <Group title="Completed" items={completed} />}
    </div>
  );
}

function Group({ title, items }: { title: string; items: BrowserItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>{title}</SectionHeading>
      <List items={items} />
    </section>
  );
}

function List({ items }: { items: BrowserItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
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
    </ul>
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
