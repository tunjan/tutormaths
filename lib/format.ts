export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

const relativeFmt = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

/**
 * Human, scannable relative phrasing for a timestamp: "in 3 hours",
 * "2 days ago", "tomorrow". The absolute time is still available via
 * formatDateTime() for tooltips/detail pages.
 */
export function relativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "minute") {
      return relativeFmt.format(Math.round(diffMs / ms), unit);
    }
  }
  return relativeFmt.format(0, "minute");
}

/**
 * The due line shown on cards/rows. Completed work shows nothing time-sensitive;
 * everything else gets a relative phrase ("due in 3 hours", "due 2 days ago").
 */
export function dueDescription(dueAtIso: string, state: DueState): string {
  if (state === "done") return `completed`;
  return `due ${relativeTime(dueAtIso)}`;
}

export type DueState = "done" | "overdue" | "due-soon" | "upcoming";

export function dueState(dueAtIso: string, completionPct: number): DueState {
  if (completionPct >= 100) return "done";
  const due = new Date(dueAtIso).getTime();
  const now = Date.now();
  if (due < now) return "overdue";
  if (due - now < 24 * 3600 * 1000) return "due-soon";
  return "upcoming";
}

export function dueLabel(state: DueState): string {
  switch (state) {
    case "done":
      return "Completed";
    case "overdue":
      return "Overdue";
    case "due-soon":
      return "Due soon";
    case "upcoming":
      return "Upcoming";
  }
}

export function typeLabel(type: "problem_set" | "reading_notes"): string {
  return type === "problem_set" ? "Problem set" : "Reading notes";
}

export function humanFileSize(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
