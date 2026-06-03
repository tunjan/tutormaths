"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAssignment, deleteAssignment } from "@/app/tutor/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  id: string;
  title: string;
  description: string | null;
  type: "problem_set" | "reading_notes";
  dueAt: string;
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function AssignmentActions({ id, title, description, type, dueAt }: Props) {
  const [editing, setEditing] = useState(false);
  const [formType, setFormType] = useState(type);
  const [deleting, startDelete] = useTransition();

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleting}
          onClick={() => {
            if (
              !confirm(
                "Delete this assignment? Its submissions, comments and files will be permanently removed.",
              )
            )
              return;
            startDelete(async () => {
              await deleteAssignment(id);
            });
          }}
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        formData.set("type", formType);
        await updateAssignment(formData);
        setEditing(false);
        toast.success("Assignment updated.");
      }}
      className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5"
    >
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input id="edit-title" name="title" defaultValue={title} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          name="description"
          defaultValue={description ?? ""}
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Type</Label>
        <Select
          value={formType}
          onValueChange={(v) =>
            setFormType((v as "problem_set" | "reading_notes") ?? formType)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="problem_set">Problem set</SelectItem>
            <SelectItem value="reading_notes">Reading notes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-due">Due</Label>
        <Input
          id="edit-due"
          name="due_at"
          type="datetime-local"
          defaultValue={toLocalInput(dueAt)}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save changes</Button>
        <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
