"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Search, Trash2, X } from "lucide-react";
import { Link } from "next-view-transitions";
import { toast } from "sonner";
import { deleteAssignments } from "@/app/tutor/actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
} from "@/components/ui/empty";

import { formatDate, formatDateTime, type ReviewStatus } from "@/lib/format";

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

type AssignmentFilter = "focus" | "active" | "completed" | "all";

const filterOptions = [
  { value: "focus", label: "Attention" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
  { value: "all", label: "All" },
] satisfies { value: AssignmentFilter; label: string }[];

const filterDescriptions: Record<AssignmentFilter, string> = {
  focus: "Overdue work and submissions awaiting review.",
  active: "Open assignments that are not overdue.",
  completed: "Approved assignments.",
  all: "All assignments.",
};

function isOpen(item: BrowserItem) {
  return item.review_status === "assigned" || item.review_status === "needs_work";
}

function needsFocus(item: BrowserItem, nowMs: number) {
  return (
    item.review_status === "submitted" ||
    (isOpen(item) && new Date(item.due_at).getTime() < nowMs)
  );
}

function defaultFilter(items: BrowserItem[], nowMs: number): AssignmentFilter {
  if (items.some((item) => needsFocus(item, nowMs))) return "focus";
  if (
    items.some(
      (item) =>
        isOpen(item) && new Date(item.due_at).getTime() >= nowMs,
    )
  ) {
    return "active";
  }
  if (items.some((item) => item.review_status === "approved")) {
    return "completed";
  }
  return "all";
}

export function TutorAssignmentBrowser({
  items,
  nowMs,
}: {
  items: BrowserItem[];
  nowMs: number;
}) {
  const [filter, setFilter] = useState<AssignmentFilter>(() =>
    defaultFilter(items, nowMs),
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [deleting, startDelete] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const selectAllRef = useRef<HTMLElement>(null);

  const visible = useMemo(() => {
    const source = items.filter((item) => {
      if (filter === "focus") return needsFocus(item, nowMs);
      if (filter === "active") {
        return isOpen(item) && new Date(item.due_at).getTime() >= nowMs;
      }
      if (filter === "completed") return item.review_status === "approved";
      return true;
    });

    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.student.toLowerCase().includes(q),
    );
  }, [filter, items, nowMs, query]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((item) => selected.has(item.id));
  const selectedVisibleCount = visible.reduce(
    (count, item) => count + Number(selected.has(item.id)),
    0,
  );
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;
  const isFiltered = filter !== "all" || query.trim().length > 0;
  const resultCountText = isFiltered
    ? `${visible.length} of ${items.length} assignment${items.length === 1 ? "" : "s"}`
    : `${visible.length} assignment${visible.length === 1 ? "" : "s"}`;

  function changeFilter(nextFilter: AssignmentFilter) {
    setFilter(nextFilter);
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDelete(ids: string[]) {
    setDeleteIds(ids);
  }

  function runDelete() {
    const ids = deleteIds;
    startDelete(async () => {
      try {
        await deleteAssignments(ids);
        setSelected((current) => {
          const next = new Set(current);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        toast.success(
          `${ids.length} assignment${ids.length === 1 ? "" : "s"} deleted.`,
        );
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setDeleteIds([]);
      }
    });
  }

  return (
    <section
      aria-labelledby="assignments-heading"
      className="overflow-hidden rounded-md border border-border bg-surface-raised"
    >
      <div className="grid gap-3 border-b border-border px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <h2
            id="assignments-heading"
            className="text-heading-md text-foreground"
          >
            Assignments
          </h2>
          <p className="mt-1 text-pretty text-body text-muted-foreground">
            {filterDescriptions[filter]}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
          <div className="relative grid w-full sm:w-auto">
            <label
              htmlFor="assignment-search"
              className="sr-only"
            >
              Search assignments
            </label>
            <Input
              ref={searchRef}
              id="assignment-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(new Set());
              }}
              placeholder="Search assignments…"
              className="h-9 w-full pl-9 pr-9 text-body-lg sm:w-60 sm:text-body-sm"
            />
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-subtle"
              strokeWidth={1.75}
              aria-hidden
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-0.5 top-1/2 -translate-y-1/2 text-content-subtle hover:text-content-emphasis"
                onClick={() => {
                  setQuery("");
                  setSelected(new Set());
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <X aria-hidden />
              </Button>
            )}
          </div>

          <SegmentedControl
            value={filter}
            onValueChange={changeFilter}
            options={filterOptions}
            ariaLabel="Assignment status filter"
            className="grid w-full grid-cols-4 sm:w-auto"
          />
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-11 items-center justify-between gap-3 border-b border-border px-3 py-1.5 transition-colors sm:px-4",
          selectedVisibleCount > 0 ? "bg-bg-info/55" : "bg-bg-subtle/55",
        )}
      >
        {visible.length > 0 ? (
          <div className="flex items-center gap-2.5 text-caption text-content-subtle">
            <Checkbox
              ref={selectAllRef}
              checked={allVisibleSelected}
              indeterminate={someVisibleSelected}
              onCheckedChange={() => {
                setSelected((current) => {
                  const next = new Set(current);
                  if (allVisibleSelected) {
                    visible.forEach((item) => next.delete(item.id));
                  } else {
                    visible.forEach((item) => next.add(item.id));
                  }
                  return next;
                });
              }}
              aria-label={
                allVisibleSelected
                  ? `Deselect all ${visible.length} visible assignments`
                  : `Select all ${visible.length} visible assignments`
              }
            />
            <span aria-live="polite" aria-atomic="true">
              {selectedVisibleCount > 0 ? (
                <>
                  <span className="sm:hidden">
                    {selectedVisibleCount} selected
                  </span>
                  <span className="hidden sm:inline">
                    {selectedVisibleCount} of {visible.length} selected
                  </span>
                </>
              ) : (
                resultCountText
              )}
            </span>
          </div>
        ) : (
          <span
            className="text-caption text-content-subtle"
            aria-live="polite"
            aria-atomic="true"
          >
            {resultCountText}
          </span>
        )}

        {selectedVisibleCount > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-content-subtle hover:text-content-emphasis"
              onClick={() => {
                setSelected(new Set());
                selectAllRef.current?.focus();
              }}
            >
              Clear selection
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-bg-error hover:text-destructive"
              disabled={deleting}
              onClick={() => confirmDelete(Array.from(selected))}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {visible.length > 0 ? (
        <AssignmentList
          items={visible}
          nowMs={nowMs}
          selected={selected}
          onToggle={toggle}
          onDelete={(id) => confirmDelete([id])}
        />
      ) : (
        <EmptyState
          query={query}
          filter={filter}
          onReset={() => {
            if (query.trim()) setQuery("");
            else setFilter("all");
          }}
        />
      )}

      <AlertDialog
        open={deleteIds.length > 0}
        onOpenChange={(open) => !open && setDeleteIds([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteIds.length === 1 ? "this assignment" : `${deleteIds.length} assignments`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Submissions, comments and uploaded files will be permanently
              removed. This can&rsquo;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={runDelete}
            >
              {deleting
                ? "Deleting…"
                : `Delete ${deleteIds.length === 1 ? "assignment" : "assignments"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function AssignmentList({
  items,
  nowMs,
  selected,
  onToggle,
  onDelete,
}: {
  items: BrowserItem[];
  nowMs: number;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">
          Assignment queue. Use the checkboxes to select assignments for bulk
          actions.
        </caption>
        <thead className="border-b border-border bg-bg-subtle/35">
          <tr className="h-9 text-left font-eyebrow text-content-subtle">
            <th scope="col" className="w-12 px-3">
              <span className="sr-only">Select</span>
            </th>
            <th scope="col" className="pr-4 font-medium">
              Assignment
            </th>
            <th scope="col" className="hidden w-36 pr-4 font-medium md:table-cell">
              Student
            </th>
            <th scope="col" className="hidden w-36 pr-4 font-medium md:table-cell">
              Due
            </th>
            <th scope="col" className="hidden w-28 pr-4 font-medium lg:table-cell">
              Progress
            </th>
            <th scope="col" className="hidden w-36 pr-4 font-medium md:table-cell">
              Status
            </th>
            <th scope="col" className="w-12 pr-2 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            const due = duePresentation(item, nowMs);
            const workflow = workflowStatuses[item.review_status];

            return (
              <tr
                key={item.id}
                aria-selected={isSelected}
                className={cn(
                  "group/row border-b border-border-muted transition-colors last:border-b-0 hover:bg-bg-muted/65 focus-within:bg-bg-muted/65",
                  isSelected && "bg-bg-info/55 hover:bg-bg-info/70",
                )}
              >
                <td className="px-3 py-2 align-middle">
                  <div className="grid size-6 place-items-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggle(item.id)}
                      aria-label={`Select ${item.title} for bulk actions`}
                    />
                  </div>
                </td>
                <th scope="row" className="min-w-0 py-2.5 pr-4 text-left align-middle">
                  <div className="flex min-w-0 items-center gap-2">
                    {item.unread && (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-content-info"
                        aria-hidden
                      />
                    )}
                    <Link
                      href={`/tutor/assignments/${item.id}`}
                      className="min-w-0 truncate rounded-sm text-label text-content-emphasis decoration-border-emphasis underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                    >
                      {item.title}
                      {item.unread && (
                        <span className="sr-only"> — unread activity</span>
                      )}
                    </Link>
                  </div>
                  <span className="mt-0.5 block truncate text-caption font-normal normal-case text-content-subtle md:hidden">
                    {item.student} · {due.mobileLabel} · {workflow.label}
                  </span>
                </th>
                <td className="hidden truncate py-2.5 pr-4 align-middle text-caption text-content-default md:table-cell">
                  {item.student}
                </td>
                <td className="hidden py-2.5 pr-4 align-middle md:table-cell">
                  <time
                    dateTime={item.due_at}
                    title={formatDateTime(item.due_at)}
                    className="block text-caption text-content-default tabular-nums"
                  >
                    {formatDate(item.due_at)}
                  </time>
                  <span
                    className={cn(
                      "mt-0.5 block text-caption tabular-nums",
                      due.overdue
                        ? "font-medium text-content-error"
                        : "text-content-subtle",
                    )}
                  >
                    {due.label}
                  </span>
                </td>
                <td className="hidden py-2.5 pr-4 align-middle lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={item.completion_pct}
                      aria-label={`${item.title} progress: ${item.completion_pct}%`}
                      className="w-14 flex-none gap-0"
                    />
                    <span
                      className="w-8 text-right text-caption text-content-subtle tabular-nums"
                      aria-hidden
                    >
                      {item.completion_pct}%
                    </span>
                  </div>
                </td>
                <td className="hidden py-2.5 pr-4 align-middle md:table-cell">
                  <WorkflowStatusBadge status={item.review_status} />
                </td>
                <td className="py-2 pr-2 text-right align-middle">
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        "relative z-10 text-content-subtle opacity-45 transition-opacity after:absolute after:-inset-1 hover:text-destructive hover:opacity-100 focus-visible:text-destructive focus-visible:opacity-100 group-hover/row:opacity-100 group-focus-within/row:opacity-100",
                      )}
                      onClick={() => onDelete(item.id)}
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 aria-hidden />
                    </TooltipTrigger>
                    <TooltipContent side="left">Delete assignment</TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const workflowStatuses: Record<
  ReviewStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "info";
  }
> = {
  assigned: { label: "Assigned", variant: "default" },
  submitted: { label: "Awaiting review", variant: "info" },
  approved: { label: "Approved", variant: "success" },
  needs_work: { label: "Needs changes", variant: "warning" },
};

function WorkflowStatusBadge({ status }: { status: ReviewStatus }) {
  const content = workflowStatuses[status];
  return <Badge variant={content.variant}>{content.label}</Badge>;
}

const minuteMs = 60_000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;
const compactDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

function compactDuration(ms: number) {
  if (ms >= dayMs) return `${Math.max(1, Math.round(ms / dayMs))}d`;
  if (ms >= hourMs) return `${Math.max(1, Math.round(ms / hourMs))}h`;
  return `${Math.max(1, Math.round(ms / minuteMs))}m`;
}

function duePresentation(item: BrowserItem, nowMs: number) {
  const dueMs = new Date(item.due_at).getTime();
  const diffMs = dueMs - nowMs;
  const compactDate = compactDateFormatter.format(new Date(item.due_at));

  if (item.review_status === "approved") {
    return { label: "Due date", mobileLabel: compactDate, overdue: false };
  }

  if (diffMs < 0) {
    const distance = compactDuration(Math.abs(diffMs));
    const overdue = isOpen(item);
    return {
      label: `${distance} ${overdue ? "overdue" : "ago"}`,
      mobileLabel: `${distance} ${overdue ? "overdue" : "ago"}`,
      overdue,
    };
  }

  if (diffMs < hourMs) {
    return { label: "Due soon", mobileLabel: "Due soon", overdue: false };
  }

  if (diffMs < dayMs) {
    return { label: "Due today", mobileLabel: "Due today", overdue: false };
  }

  const distance = compactDuration(diffMs);
  return {
    label: `${distance} left`,
    mobileLabel: `${distance} left`,
    overdue: false,
  };
}

function EmptyState({
  query,
  filter,
  onReset,
}: {
  query: string;
  filter: AssignmentFilter;
  onReset: () => void;
}) {
  const message = query.trim()
    ? "No assignments match your search."
    : filter === "focus"
      ? "Nothing needs your attention."
      : filter === "active"
        ? "No active assignments yet."
        : filter === "completed"
          ? "No completed assignments yet."
          : "No assignments yet.";

  return (
    <Empty className="min-h-44 gap-4 rounded-none border-0 p-6">
      <EmptyDescription>{message}</EmptyDescription>
      <EmptyContent>
        {query.trim() || filter !== "all" ? (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            {query.trim() ? "Clear search" : "Show all assignments"}
          </Button>
        ) : (
          <Link
            href="/tutor/assignments/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            New assignment
          </Link>
        )}
      </EmptyContent>
    </Empty>
  );
}
