"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

/**
 * Edits reminder windows as removable chips instead of a raw comma-separated
 * string. Submits the same `windows` field the server action already parses.
 */
export function ReminderWindowsField({
  initial,
  action,
}: {
  initial: number[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [windows, setWindows] = useState<number[]>(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    const n = parseInt(draft.trim(), 10);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a positive number of hours.");
      return;
    }
    if (windows.includes(n)) {
      setError("That window is already in the list.");
      setDraft("");
      return;
    }
    setWindows((w) => [...w, n].sort((a, b) => b - a));
    setDraft("");
    setError(null);
  }

  return (
    <form
      action={async (formData) => {
        formData.set("windows", windows.join(","));
        await action(formData);
        toast.success("Reminder windows saved.");
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex min-h-7 flex-wrap items-center gap-2">
        {windows.length === 0 ? (
          <span className="text-body text-muted-foreground">
            No reminders set.
          </span>
        ) : (
          windows.map((n) => (
            <Badge
              key={n}
              variant="secondary"
              className="gap-1 py-1 pr-1 pl-2"
            >
              {n}h before
              <button
                type="button"
                onClick={() => setWindows((w) => w.filter((x) => x !== n))}
                aria-label={`Remove ${n} hour reminder`}
                className="relative grid size-5 place-items-center rounded-sm text-muted-foreground transition-colors duration-fast after:absolute after:-inset-2 hover:bg-bg-muted hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="flex items-end gap-2">
        <Field className="max-w-64">
          <FieldLabel htmlFor="reminder-draft">Add a window (hours before due)</FieldLabel>
          <Input
            id="reminder-draft"
            inputMode="numeric"
            value={draft}
            placeholder="e.g. 24"
            aria-invalid={!!error}
            className="w-44"
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
        </Field>
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      <FieldError>{error}</FieldError>

      <div>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
