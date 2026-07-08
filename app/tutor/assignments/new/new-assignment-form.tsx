"use client";

import { useEffect, useMemo, useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createAssignment } from "@/app/tutor/actions";
import { createCategory, type CategoryRow } from "@/lib/actions/library";
import {
  ASSIGNMENT_MIME,
  BUCKET_ASSIGNMENTS,
  MAX_FILE_BYTES,
} from "@/lib/constants";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiFileDropzone } from "@/components/ui/multi-file-dropzone";
import { LatexContent } from "@/components/ui/latex-content";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface StudentOption {
  id: string;
  full_name: string;
  email: string | null;
}

const accept = ASSIGNMENT_MIME as readonly string[];
const NEW_CATEGORY = "__new__";

type FieldErrors = Partial<
  Record<"student" | "title" | "due" | "file" | "latex" | "category", string>
>;

const LATEX_PLACEHOLDER = `Solve each equation.

1. $x^2 + 3x + 2 = 0$
2. $\\dfrac{1}{x} + \\dfrac{1}{x+1} = 1$

Then evaluate the integral:

$$\\int_0^1 x^2 \\, dx$$`;

/** A sensible default due date: a week out, at 17:00 local, as a datetime-local string. */
function defaultDue(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(17, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function NewAssignmentForm({
  students,
  categories = [],
  defaultStudentId = "",
  onCancel,
}: {
  students: StudentOption[];
  /** Existing topics the tutor can tag the assignment with. */
  categories?: CategoryRow[];
  defaultStudentId?: string;
  /** When provided (e.g. inside a dialog), the Cancel control calls this
   *  instead of navigating back to the dashboard. */
  onCancel?: () => void;
}) {
  const [supabase] = useState(() => createClient());
  const [source, setSource] = useState<"file" | "latex">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [latexBody, setLatexBody] = useState("");
  const [studentId, setStudentId] = useState(defaultStudentId);
  const [type, setType] = useState<"problem_set" | "reading_notes">(
    "problem_set",
  );
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");

  const creatingNewCategory = categoryId === NEW_CATEGORY;

  // Object URLs for previewing selected images (revoked on change/unmount).
  const previews = useMemo(
    () =>
      selectedFiles
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [selectedFiles],
  );
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "");
    const dueLocal = String(data.get("due_at") ?? "");

    const next: FieldErrors = {};
    if (!studentId) next.student = "Choose a student.";
    if (!title) next.title = "Give the assignment a title.";
    if (!dueLocal) next.due = "Set a due date.";
    else if (new Date(dueLocal).getTime() <= Date.now())
      next.due = "The due date must be in the future.";
    if (creatingNewCategory && !newCategory.trim())
      next.category = "Name the new topic.";
    if (source === "file") {
      if (selectedFiles.length === 0) next.file = "Attach at least one file.";
      else if (selectedFiles.some((f) => !accept.includes(f.type)))
        next.file = "Allowed types: PDF, JPG, PNG.";
      else if (selectedFiles.some((f) => f.size > MAX_FILE_BYTES))
        next.file = "Each file must be 20 MB or smaller.";
    } else if (!latexBody.trim()) {
      next.latex = "Write the assignment in LaTeX.";
    }

    setErrors(next);
    setGlobalError("");
    if (Object.keys(next).length > 0) return;

    setBusy(true);

    // Resolve the topic: create it if the tutor typed a new one, else use the
    // chosen existing id (empty = untagged).
    let resolvedCategoryId: string | null = null;
    try {
      if (creatingNewCategory) {
        resolvedCategoryId = (await createCategory(newCategory)).id;
      } else if (categoryId) {
        resolvedCategoryId = categoryId;
      }
    } catch (err) {
      setGlobalError((err as Error).message);
      setBusy(false);
      return;
    }

    const id = crypto.randomUUID();

    // LaTeX-bodied assignments carry no file; file-backed ones upload first.
    const uploaded: { filePath: string; mimeType: string; sizeBytes: number }[] =
      [];
    if (source === "file") {
      for (const file of selectedFiles) {
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

    try {
      await createAssignment({
        id,
        studentId,
        type,
        title,
        description: description || null,
        dueAt: new Date(dueLocal).toISOString(),
        files: uploaded,
        latexBody: source === "latex" ? latexBody : null,
        categoryId: resolvedCategoryId,
      });
      // createAssignment redirects on success.
    } catch (err) {
      // createAssignment's success path calls redirect(), which throws a
      // NEXT_REDIRECT control-flow error. Re-throw framework errors so Next can
      // navigate — otherwise we'd treat a successful create as a failure, show
      // "NEXT_REDIRECT" as a toast, and delete the files we just uploaded.
      unstable_rethrow(err);
      // A genuine failure: the row was never created — remove orphaned uploads.
      if (uploaded.length > 0) {
        await supabase.storage
          .from(BUCKET_ASSIGNMENTS)
          .remove(uploaded.map((u) => u.filePath));
      }
      setGlobalError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT COLUMN — the form fields */}
        <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label id="student-label">Student</Label>
          <Select
            value={studentId}
            onValueChange={(v) => {
              setStudentId(v ?? "");
              setErrors((e) => ({ ...e, student: undefined }));
            }}
          >
            <SelectTrigger
              aria-labelledby="student-label"
              aria-invalid={!!errors.student}
              aria-describedby={errors.student ? "student-error" : undefined}
            >
              <SelectValue placeholder="Choose a student…">
                {studentId
                  ? students.find((s) => s.id === studentId)?.full_name ||
                    students.find((s) => s.id === studentId)?.email
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="student-error" message={errors.student} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label id="type-label">Type</Label>
          <Select
            value={type}
            onValueChange={(v) =>
              setType((v as "problem_set" | "reading_notes") ?? "problem_set")
            }
          >
            <SelectTrigger aria-labelledby="type-label">
              <SelectValue>
                {type === "problem_set" ? "Problem set" : type === "reading_notes" ? "Reading notes" : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="problem_set">Problem set</SelectItem>
              <SelectItem value="reading_notes">Reading notes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          aria-invalid={!!errors.title}
          placeholder="Quadratic equations — set 3"
          onChange={() => setErrors((e) => ({ ...e, title: undefined }))}
        />
        <FieldError message={errors.title} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due_at">Due</Label>
          <DateTimePicker
            id="due_at"
            name="due_at"
            defaultValue={defaultDue()}
            invalid={!!errors.due}
            aria-describedby={errors.due ? "due-error" : undefined}
            onChange={() => setErrors((e) => ({ ...e, due: undefined }))}
          />
          <FieldError id="due-error" message={errors.due} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label id="category-label">Topic (optional)</Label>
          <Select
            value={categoryId}
            onValueChange={(v) => {
              setCategoryId(v ?? "");
              setErrors((e) => ({ ...e, category: undefined }));
            }}
          >
            <SelectTrigger aria-labelledby="category-label" className="w-full">
              <SelectValue placeholder="No topic">
                {creatingNewCategory
                  ? "New topic…"
                  : categories.find((c) => c.id === categoryId)?.name}
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
              type="text"
              value={newCategory}
              placeholder="New topic name"
              aria-invalid={!!errors.category}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setErrors((er) => ({ ...er, category: undefined }));
              }}
            />
          )}
          <FieldError message={errors.category} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Notes for the student — focus areas, page numbers, hints…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Assignment content</Label>
        <SegmentedControl
          value={source}
          onValueChange={setSource}
          options={[
            { value: "file", label: "Upload files" },
            { value: "latex", label: "Write LaTeX" },
          ]}
        />

        {source === "file" ? (
          <>
            <MultiFileDropzone
              accept={accept.join(",")}
              hint="PDF, JPG or PNG — add as many as you like, up to 20 MB each"
              files={selectedFiles}
              onAdd={(fs) => {
                setSelectedFiles((prev) => [...prev, ...fs]);
                setErrors((er) => ({ ...er, file: undefined }));
              }}
              onRemove={(i) =>
                setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
            <FieldError id="file-error" message={errors.file} />
          </>
        ) : (
          <>
            <Textarea
              name="latex_body"
              rows={10}
              className="font-mono text-sm"
              placeholder={LATEX_PLACEHOLDER}
              value={latexBody}
              aria-invalid={!!errors.latex}
              onChange={(e) => {
                setLatexBody(e.target.value);
                setErrors((er) => ({ ...er, latex: undefined }));
              }}
            />
            <p className="text-xs text-muted-foreground">
              Markdown with inline <code>$…$</code> and display{" "}
              <code>$$…$$</code> maths.
            </p>
            <FieldError message={errors.latex} />
          </>
        )}
      </div>
        </div>

        {/* RIGHT COLUMN — live preview */}
        <div className="flex flex-col gap-1.5">
          <Label>Preview</Label>
          <div className="flex-1 min-h-[18rem] rounded-panel border border-border-soft bg-surface-inset p-5 overflow-auto">
            {source === "latex" ? (
              latexBody.trim() ? (
                <LatexContent source={latexBody} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Start typing LaTeX on the left to see it rendered here.
                </p>
              )
            ) : selectedFiles.length > 0 ? (
              <div className="flex flex-col gap-3">
                {previews.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.url}
                    src={p.url}
                    alt={p.name}
                    className="max-h-[40vh] w-full rounded-[8px] object-contain"
                  />
                ))}
                {selectedFiles
                  .filter((f) => !f.type.startsWith("image/"))
                  .map((f, i) => (
                    <div
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-3 text-sm text-foreground"
                    >
                      <FileText className="size-5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Choose files on the left to preview them here.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border-soft pt-5 sm:flex-row sm:items-center sm:justify-end">
        {globalError && (
          <div className="sm:mr-auto rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {globalError}
          </div>
        )}
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Link
            href="/tutor"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Cancel
          </Link>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create assignment"}
        </Button>
      </div>
    </form>
  );
}
