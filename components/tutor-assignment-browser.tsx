"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteAssignments } from "@/app/tutor/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

type AssignmentFilter = "focus" | "active" | "completed" | "all";

const filterOptions = [
  { value: "focus", label: "Focus" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
  { value: "all", label: "All" },
] satisfies { value: AssignmentFilter; label: string }[];

const filterDescriptions: Record<AssignmentFilter, string> = {
  focus: "Assignments that need a decision or follow-up.",
  active: "Open assignments currently on track.",
  completed: "Approved assignments.",
  all: "Every assignment in one place.",
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
      className="overflow-hidden rounded-xl border border-border-subtle bg-card"
    >
      <div className="flex flex-col gap-5 border-b border-border-soft p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2
              id="assignments-heading"
              className="text-xl font-semibold text-content-emphasis"
            >
              Assignments
            </h2>
            <p className="mt-1 text-sm text-content-subtle">
              {filterDescriptions[filter]}
            </p>
          </div>
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(new Set());
            }}
            placeholder="Search assignments"
            aria-label="Search assignments"
            className="w-full sm:w-72"
          />
        </div>

        <SegmentedControl
          value={filter}
          onValueChange={changeFilter}
          options={filterOptions}
          className="grid w-full grid-cols-4 sm:w-auto"
        />
      </div>

      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border-soft bg-bg-muted/45 px-4 py-2">
        {visible.length > 0 ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-content-subtle">
            <Checkbox
              checked={allVisibleSelected}
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
              aria-label="Select all visible assignments"
            />
            {visible.length} assignment{visible.length === 1 ? "" : "s"}
          </label>
        ) : (
          <span className="text-xs font-medium text-content-subtle">
            0 assignments
          </span>
        )}

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-xs text-content-subtle sm:inline">
              {selected.size} selected
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setSelected(new Set())}
              aria-label="Clear selection"
            >
              <X data-icon="inline-start" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
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
          selected={selected}
          onToggle={toggle}
          onDelete={(id) => confirmDelete([id])}
        />
      ) : (
        <EmptyState query={query} filter={filter} />
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
              className="border-destructive bg-destructive text-white hover:ring-bg-error"
              onClick={runDelete}
            >
              Delete {deleteIds.length === 1 ? "assignment" : "assignments"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function AssignmentList({
  items,
  selected,
  onToggle,
  onDelete,
}: {
  items: BrowserItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-border-muted">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "group/row flex items-center transition-colors",
            selected.has(item.id) && "bg-bg-info",
          )}
        >
          <div className="flex items-center pl-4">
            <Checkbox
              checked={selected.has(item.id)}
              onCheckedChange={() => onToggle(item.id)}
              aria-label={`Select ${item.title}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <AssignmentRow
              href={`/tutor/assignments/${item.id}`}
              title={item.title}
              type={item.type}
              dueAt={item.due_at}
              pct={item.completion_pct}
              reviewStatus={item.review_status}
              student={item.student}
              unread={item.unread}
            />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="mr-2 text-content-subtle opacity-60 hover:text-destructive group-hover/row:opacity-100 sm:mr-3"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 data-icon="inline-start" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  query,
  filter,
}: {
  query: string;
  filter: AssignmentFilter;
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
    <div className="flex min-h-44 items-center justify-center px-6 py-12 text-center">
      <p className="text-sm text-content-subtle">{message}</p>
    </div>
  );
}
