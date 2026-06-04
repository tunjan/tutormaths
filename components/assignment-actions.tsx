"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateAssignment, deleteAssignment } from "@/app/tutor/actions";
import {
  ASSIGNMENT_MIME,
  BUCKET_ASSIGNMENTS,
  MAX_FILE_BYTES,
} from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: string;
  description: string | null;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  studentId: string;
}

const accept = ASSIGNMENT_MIME as readonly string[];

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function AssignmentActions({
  id,
  title,
  description,
  type,
  dueAt,
  studentId,
}: Props) {
  const [supabase] = useState(() => createClient());
  const [editing, setEditing] = useState(false);
  const [formType, setFormType] = useState(type);
  const [deleting, startDelete] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" size="sm" disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this assignment?</AlertDialogTitle>
              <AlertDialogDescription>
                Its submissions, comments and files will be permanently removed.
                This can&rsquo;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={cn(buttonVariants({ variant: "destructive" }))}
                onClick={() =>
                  startDelete(async () => {
                    await deleteAssignment(id);
                  })
                }
              >
                Delete assignment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("type", formType);

    const file = fileRef.current?.files?.[0];
    if (file) {
      if (!accept.includes(file.type)) {
        toast.error("The replacement file must be a PDF.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error("That file is larger than 20 MB.");
        return;
      }
    }

    setBusy(true);
    try {
      if (file) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${studentId}/${id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET_ASSIGNMENTS)
          .upload(path, file, { contentType: file.type });
        if (upErr) {
          toast.error(upErr.message);
          setBusy(false);
          return;
        }
        formData.set("file_path", path);
      }

      await updateAssignment(formData);
      setEditing(false);
      setFileName("");
      toast.success("Assignment updated.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
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
        <DateTimePicker
          id="edit-due"
          name="due_at"
          defaultValue={toLocalInput(dueAt)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Replace PDF (optional)</Label>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            {fileName ? "Change PDF" : "Choose new PDF"}
          </Button>
          <span className="truncate text-sm text-muted-foreground">
            {fileName || "Keep current file"}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            setEditing(false);
            setFileName("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
