"use client";

import { useMemo, useState, useTransition } from "react";
import { Link } from "next-view-transitions";
import { Clock, Inbox, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteAssignments } from "@/app/tutor/actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export function TutorAssignmentBrowser({ items, nowMs }: { items: BrowserItem[]; nowMs: number }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [deleting, startDelete] = useTransition();

  const { matched, awaiting, overdue, active, completed } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.student.toLowerCase().includes(q),
      )
      : items;
    const isLate = (a: BrowserItem) => new Date(a.due_at).getTime() < nowMs;
    const open = matched.filter(
      (a) => a.review_status === "assigned" || a.review_status === "needs_work",
    );
    return {
      matched,
      awaiting: matched.filter((a) => a.review_status === "submitted"),
      overdue: open.filter(isLate),
      active: open.filter((a) => !isLate(a)),
      completed: matched.filter((a) => a.review_status === "approved"),
    };
  }, [items, query, nowMs]);

  const allMatchedSelected = matched.length > 0 && matched.every((a) => selected.has(a.id));

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
        toast.success(`${ids.length} assignment${ids.length === 1 ? "" : "s"} deleted.`);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setDeleteIds([]);
      }
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-text-subtle" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by assignment or student…"
          aria-label="Search assignments"
          className="h-11 pl-11 pr-4"
        />
      </div>
        {items.length > 0 && (
          <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-border-subtle bg-bg-subtle px-3 py-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-content-emphasis">
              <Checkbox
                checked={allMatchedSelected}
                onCheckedChange={() => {
                  setSelected((current) => {
                    const next = new Set(current);
                    if (allMatchedSelected) matched.forEach((a) => next.delete(a.id));
                    else matched.forEach((a) => next.add(a.id));
                    return next;
                  });
                }}
                aria-label="Select all matching assignments"
              />
              {allMatchedSelected ? "Clear matching" : `Select all${query ? " matching" : ""}`}
            </label>
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-content-subtle">{selected.size} selected</span>
                <Button variant="ghost" size="icon-xs" onClick={() => setSelected(new Set())} aria-label="Clear selection">
                  <X />
                </Button>
                <Button variant="destructive" size="sm" disabled={deleting} onClick={() => confirmDelete(Array.from(selected))}>
                  <Trash2 /> Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {awaiting.length > 0 && (
        <section id="awaiting" className="scroll-mt-24">
          <SectionHead
            icon={<Inbox className="size-4" />}
            title="Awaiting your review"
            count={awaiting.length}
          />
          <List items={awaiting} selected={selected} onToggle={toggle} onDelete={(id) => confirmDelete([id])} />
        </section>
      )}

      {overdue.length > 0 && (
        <section id="overdue" className="scroll-mt-24">
          <SectionHead
            icon={<Clock className="size-4" />}
            title="Overdue"
            count={overdue.length}
          />
          <List items={overdue} selected={selected} onToggle={toggle} onDelete={(id) => confirmDelete([id])} />
        </section>
      )}

      <div className="flex flex-col gap-3">
        <SectionHead title="Active assignments" count={active.length} />
        {active.length === 0 ? (
          query ? (
            <Empty>No active assignments match your search.</Empty>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center animate-fade-in mt-4">
              <p className="text-base text-content-subtle">No active assignments yet.</p>
              <Link
                href="/tutor/assignments/new"
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                Create an assignment
              </Link>
            </div>
          )
        ) : (
          <List items={active} selected={selected} onToggle={toggle} onDelete={(id) => confirmDelete([id])} />
        )}
      </div>

      {(completed.length > 0 || query.trim()) && (
        <section>
          <SectionHead title="Completed" count={completed.length} muted />
          {completed.length > 0 ? (
            <List items={completed} selected={selected} onToggle={toggle} onDelete={(id) => confirmDelete([id])} />
          ) : (
            <Empty>No completed assignments match your search.</Empty>
          )}
        </section>
      )}
      <AlertDialog open={deleteIds.length > 0} onOpenChange={(open) => !open && setDeleteIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteIds.length === 1 ? "this assignment" : `${deleteIds.length} assignments`}?</AlertDialogTitle>
            <AlertDialogDescription>
              Submissions, comments and uploaded files will be permanently removed. This can&rsquo;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="border-destructive bg-destructive text-white hover:ring-bg-error" onClick={runDelete}>
              Delete {deleteIds.length === 1 ? "assignment" : "assignments"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SectionHead({
  title,
  count,
  icon,
  muted,
}: {
  title: string;
  count: number;
  icon?: React.ReactNode;
  muted?: boolean;
  }) {
  return (
    <div className="mb-4 flex items-baseline justify-between border-b border-border-soft pb-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex size-5 items-center justify-center text-text-subtle">
            {icon}
          </span>
        )}
        <h2
          className={cn(
            "text-h4 font-semibold",
            muted ? "text-text-subtle" : "text-text-heading"
          )}
        >
          {title}
        </h2>
      </div>
      <span className="font-mono text-xs text-content-subtle">
        {count} assignment{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function List({ items, selected, onToggle, onDelete }: {
  items: BrowserItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col stagger-children overflow-hidden rounded-xl border border-border-subtle bg-card divide-y divide-border-muted">
      {items.map((a) => (
        <div key={a.id} className={cn("group/row flex items-center animate-fade-in transition-colors", selected.has(a.id) && "bg-bg-info")}>
          <div className="flex items-center gap-1 pl-4">
            <Checkbox checked={selected.has(a.id)} onCheckedChange={() => onToggle(a.id)} aria-label={`Select ${a.title}`} />
          </div>
          <div className="min-w-0 flex-1"><AssignmentRow
            href={`/tutor/assignments/${a.id}`}
            title={a.title}
            type={a.type}
            dueAt={a.due_at}
            pct={a.completion_pct}
            reviewStatus={a.review_status}
            student={a.student}
            unread={a.unread}
          /></div>
          <Button variant="ghost" size="icon-sm" className="mr-3 text-content-subtle opacity-60 hover:text-destructive group-hover/row:opacity-100" onClick={() => onDelete(a.id)} aria-label={`Delete ${a.title}`}>
            <Trash2 />
          </Button>
        </div>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-12 text-center text-base text-content-subtle">
      {children}
    </p>
  );
}
