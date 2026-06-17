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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { MultiFileDropzone } from "@/components/ui/multi-file-dropzone";
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


export interface AttachmentInfo {
  id: string;
  name: string;
  mimeType: string;
}

interface Props {
  id: string;
  title: string;
  description: string | null;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  studentId: string;
  categoryId: string | null;
  categories: CategoryRow[];
  attachments: AttachmentInfo[];
  latexBody: string | null;
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
  attachments,
  latexBody,
}: Props) {
  const [supabase] = useState(() => createClient());
  const [formType, setFormType] = useState(type);
  const [formCategory, setFormCategory] = useState(categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [source, setSource] = useState<"file" | "latex">(
    latexBody ? "latex" : "file",
  );
  const [latexValue, setLatexValue] = useState(latexBody ?? "");
  const [deleting, startDelete] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const creatingNewCategory = formCategory === NEW_CATEGORY;
  const remainingExisting = attachments.filter((a) => !removedIds.includes(a.id));

  function resetFileState() {
    setNewFiles([]);
    setRemovedIds([]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "");
    const dueLocal = String(formData.get("due_at") ?? "");

    if (source === "file") {
      if (newFiles.some((f) => !accept.includes(f.type))) {
        toast.error("Allowed types: PDF, JPG, PNG.");
        return;
      }
      if (newFiles.some((f) => f.size > MAX_FILE_BYTES)) {
        toast.error("Each file must be 20 MB or smaller.");
        return;
      }
      if (remainingExisting.length === 0 && newFiles.length === 0) {
        toast.error("Keep at least one file, or switch to LaTeX.");
        return;
      }
    } else if (!latexValue.trim()) {
      toast.error("Write the assignment in LaTeX.");
      return;
    }

    if (creatingNewCategory && !newCategory.trim()) {
      toast.error("Name the new topic.");
      return;
    }

    setBusy(true);
    const uploaded: { filePath: string; mimeType: string; sizeBytes: number }[] =
      [];
    try {
      if (source === "file") {
        for (const file of newFiles) {
          const safeName = file.name.replace(/[^\w.\-]+/g, "_");
          const path = `${studentId}/${id}/${crypto.randomUUID()}-${safeName}`;
          const { error: upErr } = await supabase.storage
            .from(BUCKET_ASSIGNMENTS)
            .upload(path, file, { contentType: file.type });
          if (upErr) {
            if (uploaded.length > 0) {
              await supabase.storage
                .from(BUCKET_ASSIGNMENTS)
                .remove(uploaded.map((u) => u.filePath));
            }
            toast.error(upErr.message);
            setGlobalError(upErr.message);
            setBusy(false);
            return;
          }
          uploaded.push({
            filePath: path,
            mimeType: file.type,
            sizeBytes: file.size,
          });
        }
      }

      // Resolve the topic (create it if a new name was typed). Always send
      // category_id so it can also be cleared back to "No topic".
      const resolvedCategory = creatingNewCategory
        ? (await createCategory(newCategory)).id
        : formCategory;

      await updateAssignment({
        id,
        title,
        description: description || null,
        type: formType,
        dueAt: new Date(dueLocal).toISOString(),
        categoryId: resolvedCategory,
        hasCategory: true,
        source,
        ...(source === "latex"
          ? { latexBody: latexValue }
          : { addedFiles: uploaded, removedFileIds: removedIds }),
      });
      resetFileState();
      dialogRef.current?.close();
      toast.success("Assignment updated.");
      setGlobalError("");
    } catch (err) {
      if (uploaded.length > 0) {
        await supabase.storage
          .from(BUCKET_ASSIGNMENTS)
          .remove(uploaded.map((u) => u.filePath));
      }
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
        className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[var(--modal-radius)] border border-[#efebe1] dark:border-[#322f29] bg-card p-7 text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.2),0_12px_40px_rgba(0,0,0,0.4)] backdrop:bg-black/35 backdrop:backdrop-blur-[6px] max-h-[85vh] overflow-y-auto outline-none"
      >
        {globalError && (
          <div className="mb-4 rounded-[8px] border border-destructive/30 bg-[#f6ece9] dark:bg-[#b3463a]/10 dark:text-[#cf8a7e] px-3 py-2 text-sm text-destructive" role="alert">
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
            <Label>Content</Label>
            <div className="inline-flex rounded-[10px] border border-[#e4dfd4] dark:border-[#322f29] bg-[#f4f1ea] dark:bg-[#1d1b16] p-1 self-start">
              <button
                type="button"
                onClick={() => setSource("file")}
                aria-pressed={source === "file"}
                className={cn(
                  "rounded-[7px] px-3 py-1.5 text-sm font-medium transition-colors",
                  source === "file"
                    ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
                    : "text-[#8a8478] dark:text-[#b3ac9f] hover:text-foreground",
                )}
              >
                Files
              </button>
              <button
                type="button"
                onClick={() => setSource("latex")}
                aria-pressed={source === "latex"}
                className={cn(
                  "rounded-[7px] px-3 py-1.5 text-sm font-medium transition-colors",
                  source === "latex"
                    ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
                    : "text-[#8a8478] dark:text-[#b3ac9f] hover:text-foreground",
                )}
              >
                LaTeX
              </button>
            </div>

            {source === "file" ? (
              <MultiFileDropzone
                accept={accept.join(",")}
                hint="PDF, JPG or PNG — up to 20 MB each"
                files={newFiles}
                onAdd={(fs) => setNewFiles((prev) => [...prev, ...fs])}
                onRemove={(i) =>
                  setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
                existing={remainingExisting}
                onRemoveExisting={(rid) =>
                  setRemovedIds((prev) => [...prev, rid])
                }
              />
            ) : (
              <Textarea
                name="latex_body"
                rows={8}
                className="font-mono text-sm"
                placeholder="Markdown with inline $…$ and display $$…$$ maths."
                value={latexValue}
                onChange={(e) => setLatexValue(e.target.value)}
              />
            )}
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
                resetFileState();
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
