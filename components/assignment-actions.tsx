"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Plus } from "lucide-react";
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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MultiFileDropzone } from "@/components/ui/multi-file-dropzone";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

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
  const [editOpen, setEditOpen] = useState(false);
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
      setEditOpen(false);
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
          onClick={() => setEditOpen(true)}
        >
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-bg-error hover:text-destructive"
                disabled={deleting}
              >
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
                variant="destructive"
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

      <Modal
        open={editOpen}
        onClose={() => {
          if (!busy) {
            setEditOpen(false);
            resetFileState();
            setGlobalError("");
          }
        }}
        title="Edit assignment"
        className="max-w-2xl"
      >
        {globalError && (
          <Alert variant="destructive" role="alert" className="mb-4">
            <AlertCircle aria-hidden />
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
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
              <SelectTrigger aria-labelledby="edit-type-label" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="problem_set">Problem set</SelectItem>
                  <SelectItem value="reading_notes">Reading notes</SelectItem>
                </SelectGroup>
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
                <SelectGroup>
                  <SelectItem value="">No topic</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={NEW_CATEGORY}>
                    <Plus /> Create new topic…
                  </SelectItem>
                </SelectGroup>
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
            <SegmentedControl
              value={source}
              onValueChange={setSource}
              options={[
                { value: "file", label: "Files" },
                { value: "latex", label: "LaTeX" },
              ]}
            />

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
                className="font-mono text-code"
                placeholder="Markdown with inline $…$ and display $$…$$ maths."
                value={latexValue}
                onChange={(e) => setLatexValue(e.target.value)}
              />
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setEditOpen(false);
                resetFileState();
                setGlobalError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
