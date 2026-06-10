"use client";

import { useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { BookOpen, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { type ReviewStatus, formatDate, typeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

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
        <h2 className="text-h3 font-semibold tracking-tight text-foreground">
          {monthLabel.format(cursor)}
        </h2>
        <div className="flex items-center gap-1.5">
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
      <div className="overflow-hidden rounded-[12px] border border-[#e5e5e5] dark:border-[#262626] bg-card shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-7 border-b border-[#e5e5e5] dark:border-[#262626] bg-secondary/35">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center font-mono text-[11px] uppercase tracking-[0.05em] text-[#737373] dark:text-[#a3a3a3] font-semibold"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-[#e5e5e5] dark:divide-[#262626] border-b border-transparent">
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
                  "group/cell relative flex min-h-[68px] flex-col gap-1 border-b border-[#e5e5e5] dark:border-[#262626] p-2 text-left transition-colors sm:min-h-[104px] outline-none",
                  (i + 1) % 7 === 0 && "border-r-0",
                  i >= 35 && "border-b-0",
                  inMonth ? "bg-card" : "bg-[#fafafa]/50 dark:bg-[#0a0a0a]/50",
                  "hover:bg-[#f5f5f5] dark:hover:bg-[#171717]/60",
                  isSelected && "bg-[#fafafa] dark:bg-[#171717] ring-1 ring-inset ring-black dark:ring-white",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] tabular-nums font-medium",
                    isToday
                      ? "bg-foreground font-semibold text-background"
                      : inMonth
                        ? "text-[#0a0a0a] dark:text-[#fafafa]"
                        : "text-[#737373]/50 dark:text-[#525252]/50",
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
                        <span className="px-1 text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                          +{items.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1 sm:hidden">
                      {items.slice(0, 4).map((a) => (
                        <span
                          key={a.id}
                          className={cn(
                            "size-1.5 rounded-full",
                            a.review_status === "approved"
                              ? "bg-muted-foreground/50"
                              : "bg-foreground",
                          )}
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
          {formatDate(new Date(selectedKey + "T00:00:00").toISOString())}
        </h3>
        {selected.length === 0 ? (
          <p className="card border border-border p-6 text-center text-sm text-[#737373] dark:text-[#a3a3a3] shadow-[var(--shadow-sm)]">
            Nothing due this day.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#262626] overflow-hidden rounded-[12px] border border-[#e5e5e5] dark:border-[#262626] bg-card shadow-[var(--shadow-sm)]">
            {selected.map((a) => {
              const TypeIcon = a.type === "reading_notes" ? BookOpen : FileText;
              return (
                <Link
                  key={a.id}
                  href={`/student/assignments/${a.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#171717]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fafafa] dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-muted-foreground group-hover:text-foreground">
                      <TypeIcon className="size-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0a0a0a] dark:text-[#fafafa]">
                        {a.title}
                      </p>
                      <p className="truncate text-xs text-[#737373] dark:text-[#a3a3a3]">
                        {typeLabel(a.type)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {unreadSet.has(a.id) && (
                      <span
                        className="size-2 shrink-0 rounded-full bg-foreground"
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
        "flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 text-[11px] leading-tight transition-colors w-full border border-transparent",
        done
          ? "bg-[#f5f5f5] text-[#a3a3a3] line-through hover:bg-[#eaeaea] dark:bg-[#171717] dark:hover:bg-[#262626]"
          : "bg-[#000000]/[0.04] text-[#0a0a0a] hover:bg-[#000000]/[0.08] dark:bg-white/[0.06] dark:text-[#fafafa] dark:hover:bg-white/10",
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          done ? "bg-[#a3a3a3]" : "bg-black dark:bg-white",
        )}
      />
      <span className="truncate">{a.title}</span>
      {unread && !done && (
        <span className="ml-auto size-1.5 shrink-0 rounded-full bg-[#ef4444]" />
      )}
    </Link>
  );
}
