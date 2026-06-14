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
  return timeDueState(dueAtIso);
}

/** Due state from the clock alone, ignoring progress/review. */
export function timeDueState(
  dueAtIso: string,
): Exclude<DueState, "done"> {
  const due = new Date(dueAtIso).getTime();
  const now = Date.now();
  if (due < now) return "overdue";
  if (due - now < 24 * 3600 * 1000) return "due-soon";
  return "upcoming";
}

export type ReviewStatus = "assigned" | "submitted" | "approved" | "needs_work";

export function reviewLabel(status: ReviewStatus): string {
  switch (status) {
    case "submitted":
      return "Awaiting review";
    case "approved":
      return "Approved";
    case "needs_work":
      return "Changes requested";
    case "assigned":
      return "Assigned";
  }
}

/**
 * The single dominant badge for an assignment. Review state wins when it is
 * meaningful (submitted/approved/needs_work); otherwise we fall back to the
 * time-based due state. This keeps lists scannable with one chip per row.
 */
export type AssignmentStatus =
  | { kind: "review"; review: Exclude<ReviewStatus, "assigned"> }
  | { kind: "due"; due: Exclude<DueState, "done"> };

export function assignmentStatus(
  reviewStatus: ReviewStatus,
  dueAtIso: string,
): AssignmentStatus {
  if (reviewStatus !== "assigned") {
    return { kind: "review", review: reviewStatus };
  }
  return { kind: "due", due: timeDueState(dueAtIso) };
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

/** Best-effort MIME type for an assignment object key, inferred from its extension. */
export function mimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/pdf";
}

/** Display name for a storage object key: last path segment, minus any timestamp/uuid prefix. */
export function fileLabel(path: string): string {
  const name = path.split("/").pop() ?? "file";
  // Strip a leading UUID- (new uploads) or timestamp- (legacy edit uploads) prefix.
  return name.replace(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+)-/i,
    "",
  );
}

export function humanFileSize(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
