"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssignmentRow } from "@/components/assignment-row";

export interface BrowserItem {
  id: string;
  title: string;
  type: "problem_set" | "reading_notes";
  due_at: string;
  completion_pct: number;
  student: string;
}

/**
 * Client-side search across a tutor's assignments so the dashboard stays usable
 * as the list grows. Matches title or student name; sections stay split by
 * active/completed.
 */
export function TutorAssignmentBrowser({ items }: { items: BrowserItem[] }) {
  const [query, setQuery] = useState("");

  const { active, completed } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? items.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.student.toLowerCase().includes(q),
        )
      : items;
    return {
      active: matched.filter((a) => a.completion_pct < 100),
      completed: matched.filter((a) => a.completion_pct >= 100),
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

      <section className="flex flex-col gap-4">
        <SectionHeading>Active assignments</SectionHeading>
        {active.length === 0 ? (
          <Empty>
            {query ? "No active assignments match your search." : "No active assignments."}
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/tutor/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                student={a.student}
              />
            ))}
          </ul>
        )}
      </section>

      {completed.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading>Completed</SectionHeading>
          <ul className="flex flex-col gap-3">
            {completed.map((a) => (
              <AssignmentRow
                key={a.id}
                href={`/tutor/assignments/${a.id}`}
                title={a.title}
                type={a.type}
                dueAt={a.due_at}
                pct={a.completion_pct}
                student={a.student}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
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
