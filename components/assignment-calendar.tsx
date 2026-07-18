"use client";

import { useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { BookOpen, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { type ReviewStatus, formatDate, typeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyDescription,
} from "@/components/ui/empty";

export interface CalendarAssignment {
  id: string;
  title: string;
  type: "problem_set" | "reading_notes";
  due_at: string;
  completion_pct: number;
  review_status: ReviewStatus;
}

function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthLabel = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

export function AssignmentCalendar({
  assignments,
  unread,
}: {
  assignments: CalendarAssignment[];
  unread: string[];
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [selectedKey, setSelectedKey] = useState<string>(() => dayKey(today));
  const unreadSet = useMemo(() => new Set(unread), [unread]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarAssignment[]>();
    for (const a of assignments) {
      const key = dayKey(new Date(a.due_at));
      const list = map.get(key);
      if (list) list.push(a);
      else map.set(key, [a]);
    }
    for (const list of map.values()) {
      list.sort((x, y) => x.due_at.localeCompare(y.due_at));
    }
    return map;
  }, [assignments]);

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - mondayIndex(first));
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      return date;
    });
  }, [cursor]);

  const todayKey = dayKey(today);
  const selected = byDay.get(selectedKey) ?? [];

  function shiftMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  function goToday() {
    setCursor(startOfMonth(today));
    setSelectedKey(todayKey);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3 text-foreground">
          {monthLabel.format(cursor)}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border-subtle bg-bg-muted">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-micro text-content-subtle"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-border-muted border-b border-transparent">
          {cells.map((date, i) => {
            const key = dayKey(date);
            const inMonth = date.getMonth() === cursor.getMonth();
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            const items = byDay.get(key) ?? [];
            return (
              <button
                type="button"
                key={key}
                onClick={() => setSelectedKey(key)}
                aria-pressed={isSelected}
                aria-label={`${formatDate(date.toISOString())}, ${items.length} due`}
                className={cn(
                  "group/cell relative flex min-h-[68px] flex-col gap-1 border-b border-border-muted p-2 text-left outline-none transition-colors duration-fast sm:min-h-[104px]",
                  (i + 1) % 7 === 0 && "border-r-0",
                  i >= 35 && "border-b-0",
                  inMonth ? "bg-surface-raised" : "bg-surface-muted/55",
                  "hover:bg-surface-hover",
                  isSelected && "bg-surface-selected ring-1 ring-inset ring-primary",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-micro tabular-nums",
                    isToday
                      ? "bg-foreground font-semibold text-background"
                      : inMonth
                        ? "text-text-heading"
                        : "text-text-subtle/55",
                  )}
                >
                  {date.getDate()}
                </span>

                {items.length > 0 && (
                  <>
                    <div className="hidden flex-col gap-1 sm:flex w-full">
                      {items.slice(0, 3).map((a) => (
                        <CalendarChip key={a.id} a={a} unread={unreadSet.has(a.id)} />
                      ))}
                      {items.length > 3 && (
                        <span className="px-1 text-micro text-text-subtle">
                          +{items.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1 sm:hidden">
                      {items.slice(0, 4).map((a) => (
                        <span
                          key={a.id}
                          className="size-1.5 rounded-full bg-content-default"
                          aria-hidden
                        />
                      ))}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected-day agenda */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label text-content-emphasis">
          {formatDate(new Date(selectedKey + "T00:00:00").toISOString())}
        </h3>
        {selected.length === 0 ? (
          <Empty className="p-8">
            <EmptyDescription>Nothing due this day.</EmptyDescription>
          </Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-md border border-border bg-card">
            {selected.map((a) => {
              const TypeIcon = a.type === "reading_notes" ? BookOpen : FileText;
              return (
                <Link
                  key={a.id}
                  href={`/student/assignments/${a.id}`}
                  className="group flex items-center justify-between gap-4 px-6 py-3 transition-colors duration-fast hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-surface-muted text-muted-foreground group-hover:text-foreground">
                      <TypeIcon className="size-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-label text-text-heading">
                        {a.title}
                      </p>
                      <p className="truncate text-caption text-text-subtle">
                        {typeLabel(a.type)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {unreadSet.has(a.id) && (
                      <span
                        className="size-2 shrink-0 rounded-full bg-content-info"
                        aria-label="Unread activity"
                      />
                    )}
                    <AssignmentStatusBadge
                      reviewStatus={a.review_status}
                      dueAt={a.due_at}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarChip({
  a,
  unread,
}: {
  a: CalendarAssignment;
  unread: boolean;
}) {
  const done = a.review_status === "approved";
  return (
    <Link
      href={`/student/assignments/${a.id}`}
      onClick={(e) => e.stopPropagation()}
      title={a.title}
      className={cn(
        "flex w-full items-center gap-1 rounded-sm border border-transparent px-2 py-1 text-micro transition-colors duration-fast",
        done
          ? "bg-surface-hover text-text-subtle line-through hover:bg-surface-selected"
          : "bg-bg-muted text-text-heading hover:bg-bg-subtle",
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full bg-content-default"
        aria-hidden
      />
      <span className="truncate">{a.title}</span>
      {unread && !done && (
        <span className="ml-auto size-1.5 shrink-0 rounded-full bg-content-info" />
      )}
    </Link>
  );
}
