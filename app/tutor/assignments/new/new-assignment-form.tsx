"use client";

import { useEffect, useMemo, useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { AlertCircle, FileText, Plus } from "lucide-react";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

interface StudentOption {
  id: string;
  full_name: string;
  email: string | null;
  pending?: boolean;
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
    <p id={id} className="text-caption text-destructive" role="alert">
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
        pendingInvite: students.find((s) => s.id === studentId)?.pending,
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

  const isDialog = Boolean(onCancel);
  const SectionHeading = isDialog ? "h3" : "h2";
  const hasPreview =
    source === "latex" ? latexBody.trim().length > 0 : selectedFiles.length > 0;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("flex flex-col", isDialog && "min-h-0 flex-1")}
    >
      <div
        className={cn(
          "min-h-0",
          isDialog && "flex-1 overflow-y-auto overscroll-contain pr-2",
        )}
      >
        <div className="grid items-start gap-8 pb-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
          <div className="flex min-w-0 flex-col">
            <section
              aria-labelledby="assignment-details-heading"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <SectionHeading
                  id="assignment-details-heading"
                  className="text-title-sm text-content-emphasis"
                >
                  Assignment details
                </SectionHeading>
                <p className="text-caption text-content-subtle">
                  Set the recipient, deadline, and context for the work.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
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
                      aria-describedby={
                        errors.student ? "student-error" : undefined
                      }
                      className="w-full"
                    >
                      <SelectValue placeholder="Choose a student…">
                        {studentId
                          ? students.find((s) => s.id === studentId)?.full_name ||
                            students.find((s) => s.id === studentId)?.email
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name || s.email}
                            {s.pending ? " (invited)" : ""}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError id="student-error" message={errors.student} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label id="type-label">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) =>
                      setType(
                        (v as "problem_set" | "reading_notes") ??
                          "problem_set",
                      )
                    }
                  >
                    <SelectTrigger
                      aria-labelledby="type-label"
                      className="w-full"
                    >
                      <SelectValue>
                        {type === "problem_set"
                          ? "Problem set"
                          : type === "reading_notes"
                            ? "Reading notes"
                            : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="problem_set">Problem set</SelectItem>
                        <SelectItem value="reading_notes">
                          Reading notes
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  placeholder="Quadratic equations — set 3"
                  onChange={() =>
                    setErrors((e) => ({ ...e, title: undefined }))
                  }
                />
                <FieldError id="title-error" message={errors.title} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="due_at">Due</Label>
                  <DateTimePicker
                    id="due_at"
                    name="due_at"
                    defaultValue={defaultDue()}
                    invalid={!!errors.due}
                    aria-describedby={errors.due ? "due-error" : undefined}
                    onChange={() =>
                      setErrors((e) => ({ ...e, due: undefined }))
                    }
                  />
                  <FieldError id="due-error" message={errors.due} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label id="category-label">
                    Topic
                    <span className="ml-1 text-caption font-normal text-content-muted">
                      Optional
                    </span>
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={(v) => {
                      setCategoryId(v ?? "");
                      setErrors((e) => ({ ...e, category: undefined }));
                    }}
                  >
                    <SelectTrigger
                      aria-labelledby="category-label"
                      className="w-full"
                    >
                      <SelectValue placeholder="No topic">
                        {creatingNewCategory
                          ? "New topic…"
                          : categories.find((c) => c.id === categoryId)?.name}
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
                      type="text"
                      value={newCategory}
                      placeholder="New topic name"
                      aria-invalid={!!errors.category}
                      onChange={(e) => {
                        setNewCategory(e.target.value);
                        setErrors((er) => ({
                          ...er,
                          category: undefined,
                        }));
                      }}
                    />
                  )}
                  <FieldError message={errors.category} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">
                  Description
                  <span className="ml-1 text-caption font-normal text-content-muted">
                    Optional
                  </span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  placeholder="Add focus areas, page numbers, or a helpful hint…"
                />
              </div>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-8">
            <section
              aria-labelledby="assignment-content-heading"
              className="flex flex-col gap-4 border-t border-border-subtle pt-6 lg:border-t-0 lg:pt-0"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <SectionHeading
                    id="assignment-content-heading"
                    className="text-title-sm text-content-emphasis"
                  >
                    Assignment content
                  </SectionHeading>
                  <p className="text-caption text-content-subtle">
                    Upload a worksheet or write the task directly.
                  </p>
                </div>
                <SegmentedControl
                  value={source}
                  onValueChange={setSource}
                  className="shrink-0"
                  options={[
                    { value: "file", label: "Upload files" },
                    { value: "latex", label: "Write LaTeX" },
                  ]}
                />
              </div>

              {source === "file" ? (
                <>
                  <MultiFileDropzone
                    accept={accept.join(",")}
                    hint="PDF, JPG or PNG — up to 20 MB each"
                    files={selectedFiles}
                    onAdd={(fs) => {
                      setSelectedFiles((prev) => [...prev, ...fs]);
                      setErrors((er) => ({ ...er, file: undefined }));
                    }}
                    onRemove={(i) =>
                      setSelectedFiles((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  />
                  <FieldError id="file-error" message={errors.file} />
                </>
              ) : (
                <>
                  <Textarea
                    name="latex_body"
                    rows={10}
                    className="font-mono text-code"
                    placeholder={LATEX_PLACEHOLDER}
                    value={latexBody}
                    aria-invalid={!!errors.latex}
                    onChange={(e) => {
                      setLatexBody(e.target.value);
                      setErrors((er) => ({ ...er, latex: undefined }));
                    }}
                  />
                  <p className="text-caption text-muted-foreground">
                    Markdown with inline <code>$…$</code> and display{" "}
                    <code>$$…$$</code> maths.
                  </p>
                  <FieldError message={errors.latex} />
                </>
              )}
            </section>

            {hasPreview && (
              <section
                aria-labelledby="assignment-preview-heading"
                className="flex min-w-0 flex-col gap-3 border-t border-border-subtle pt-6"
              >
                <div className="flex flex-col gap-1">
                  <SectionHeading
                    id="assignment-preview-heading"
                    className="text-title-sm text-content-emphasis"
                  >
                    Preview
                  </SectionHeading>
                  <p className="text-caption text-content-subtle">
                    What the student will see.
                  </p>
                </div>
                <div className="max-h-[48dvh] min-h-72 overflow-auto rounded-lg border border-border-subtle bg-bg-muted p-5">
                  {source === "latex" ? (
                    <LatexContent source={latexBody} />
                  ) : (
                    <div className="flex flex-col gap-4">
                      {previews.map((p) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={p.url}
                          src={p.url}
                          alt={p.name}
                          className="max-h-[40dvh] w-full rounded-md bg-card object-contain"
                        />
                      ))}
                      {selectedFiles
                        .filter((f) => !f.type.startsWith("image/"))
                        .map((f, i) => (
                          <div
                            key={`${f.name}-${i}`}
                            className="flex items-center gap-3 rounded-md border border-border-subtle bg-card p-3 text-body text-foreground"
                          >
                            <FileText className="size-5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{f.name}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border-subtle",
          isDialog ? "pt-4" : "pt-6",
        )}
      >
        {globalError && (
          <Alert
            variant="destructive"
            role="alert"
            className="w-full sm:mr-auto sm:max-w-md"
          >
            <AlertCircle aria-hidden />
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
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
        <Button type="submit" disabled={busy} aria-busy={busy}>
          {busy ? "Creating…" : "Create assignment"}
        </Button>
      </div>
    </form>
  );
}
