"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateAssignment, deleteAssignment } from "@/app/tutor/actions";
import { createCategory, type CategoryRow } from "@/lib/actions/library";
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
  categoryId: string | null;
  categories: CategoryRow[];
}

const accept = ASSIGNMENT_MIME as readonly string[];
const NEW_CATEGORY = "__new__";

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
  categoryId,
  categories,
}: Props) {
  const [supabase] = useState(() => createClient());
  const [formType, setFormType] = useState(type);
  const [formCategory, setFormCategory] = useState(categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [deleting, startDelete] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const creatingNewCategory = formCategory === NEW_CATEGORY;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("type", formType);

    const file = fileRef.current?.files?.[0];
    if (file) {
      if (!accept.includes(file.type)) {
        toast.error("Allowed types: PDF, JPG, PNG.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error("That file is larger than 20 MB.");
        return;
      }
    }

    if (creatingNewCategory && !newCategory.trim()) {
      toast.error("Name the new topic.");
      return;
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
          setGlobalError(upErr.message);
          setBusy(false);
          return;
        }
        formData.set("file_path", path);
      }

      // Resolve the topic (create it if a new name was typed). Always send
      // category_id so it can also be cleared back to "No topic".
      const resolvedCategory = creatingNewCategory
        ? (await createCategory(newCategory)).id
        : formCategory;
      formData.set("category_id", resolvedCategory);

      await updateAssignment(formData);
      setFileName("");
      dialogRef.current?.close();
      toast.success("Assignment updated.");
      setGlobalError("");
    } catch (err) {
      toast.error((err as Error).message);
      setGlobalError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dialogRef.current?.showModal()}
        >
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

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border-none bg-card p-6 text-foreground shadow-xl ring-1 ring-foreground/10 backdrop:bg-foreground/30 max-h-[85vh] overflow-y-auto"
      >
        {globalError && (
          <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {globalError}
          </div>
        )}
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            <Label id="edit-type-label">Type</Label>
            <Select
              value={formType}
              onValueChange={(v) =>
                setFormType((v as "problem_set" | "reading_notes") ?? formType)
              }
            >
              <SelectTrigger aria-labelledby="edit-type-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="problem_set">Problem set</SelectItem>
                <SelectItem value="reading_notes">Reading notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label id="edit-category-label">Topic</Label>
            <Select
              value={formCategory}
              onValueChange={(v) => setFormCategory(v ?? "")}
            >
              <SelectTrigger
                aria-labelledby="edit-category-label"
                className="w-full"
              >
                <SelectValue placeholder="No topic">
                  {creatingNewCategory
                    ? "New topic…"
                    : categories.find((c) => c.id === formCategory)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No topic</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_CATEGORY}>
                  <Plus className="size-3.5" /> Create new topic…
                </SelectItem>
              </SelectContent>
            </Select>
            {creatingNewCategory && (
              <Input
                value={newCategory}
                placeholder="New topic name"
                onChange={(e) => setNewCategory(e.target.value)}
              />
            )}
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
            <Label>Replace file (optional)</Label>
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept={accept.join(",")}
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                {fileName ? "Change file" : "Choose new file"}
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
                dialogRef.current?.close();
                setFileName("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
