"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});
const TRIGGER_LABEL = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const pad = (n: number) => String(n).padStart(2, "0");

/** Local "YYYY-MM-DDTHH:mm" — same shape the native datetime-local emitted. */
function toValue(d: Date, hour: number, minute: number): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    hour,
  )}:${pad(minute)}`;
}

function parseValue(v: string): { date: Date | null; hour: number; minute: number } {
  if (!v) return { date: null, hour: 17, minute: 0 };
  const [datePart, timePart] = v.split("T");
  const [y, mo, da] = datePart.split("-").map(Number);
  const [h, mi] = (timePart ?? "17:00").split(":").map(Number);
  return {
    date: new Date(y, (mo ?? 1) - 1, da ?? 1),
    hour: Number.isFinite(h) ? h : 17,
    minute: Number.isFinite(mi) ? mi : 0,
  };
}

function sameDay(a: Date | null, b: Date) {
  return (
    !!a &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Date + time picker built on the Base UI popover (no native datetime-local,
 * no extra dependency). Renders a hidden input named {name} carrying a local
 * "YYYY-MM-DDTHH:mm" string, so existing server actions keep working unchanged.
 */
export function DateTimePicker({
  name,
  defaultValue = "",
  id,
  invalid,
  onChange,
}: {
  name: string;
  defaultValue?: string;
  id?: string;
  invalid?: boolean;
  onChange?: (value: string) => void;
}) {
  const init = parseValue(defaultValue);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(init.date);
  const [hour, setHour] = useState(init.hour);
  const [minute, setMinute] = useState(init.minute);

  const base = selected ?? new Date();
  const [view, setView] = useState({
    year: base.getFullYear(),
    month: base.getMonth(),
  });

  const value = selected ? toValue(selected, hour, minute) : "";

  useEffect(() => {
    onChange?.(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const monthStart = new Date(view.year, view.month, 1);
  const leading = (monthStart.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const today = new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={value} />
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            id={id}
            aria-invalid={invalid}
            className={cn(
              "h-9 w-full justify-between px-3 font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? TRIGGER_LABEL.format(new Date(value)) : "Pick a date & time"}
            <CalendarDays className="text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto gap-0 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="text-sm font-medium">
            {MONTH_LABEL.format(monthStart)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {w}
            </div>
          ))}
          {Array.from({ length: leading }).map((_, i) => (
            <div key={`pad-${i}`} className="size-8" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const d = new Date(view.year, view.month, day);
            const isSelected = sameDay(selected, d);
            const isToday = sameDay(today, d);
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(d)}
                aria-pressed={isSelected}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                  !isSelected && isToday && "ring-1 ring-primary/40",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor={`${id ?? name}-hour`}>
              Hour
            </label>
            <select
              id={`${id ?? name}-hour`}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className={selectClass}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {pad(h)}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">:</span>
            <label className="sr-only" htmlFor={`${id ?? name}-minute`}>
              Minute
            </label>
            <select
              id={`${id ?? name}-minute`}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className={selectClass}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {pad(m)}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
