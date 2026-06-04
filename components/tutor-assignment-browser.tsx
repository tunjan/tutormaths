"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssignmentRow } from "@/components/assignment-row";

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

  const { awaiting, active, completed } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? items.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.student.toLowerCase().includes(q),
        )
      : items;
    return {
      awaiting: matched.filter((a) => a.review_status === "submitted"),
      active: matched.filter(
        (a) => a.review_status === "assigned" || a.review_status === "needs_work",
      ),
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
        <Group title="Awaiting your review" items={awaiting} />
      )}

      <section className="flex flex-col gap-4">
        <SectionHeading>Active assignments</SectionHeading>
        {active.length === 0 ? (
          <Empty>
            {query
              ? "No active assignments match your search."
              : "No active assignments."}
          </Empty>
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
