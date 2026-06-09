"use client";

import { useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createAssignment } from "@/app/tutor/actions";
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
import { FileDropzone } from "@/components/ui/file-dropzone";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { SectionHeading } from "@/components/ui/section-heading";
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

type FieldErrors = Partial<
  Record<"student" | "title" | "due" | "file", string>
>;

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
  defaultStudentId = "",
  onCancel,
}: {
  students: StudentOption[];
  defaultStudentId?: string;
  /** When provided (e.g. inside a dialog), the Cancel control calls this
   *  instead of navigating back to the dashboard. */
  onCancel?: () => void;
}) {
  const [supabase] = useState(() => createClient());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState(defaultStudentId);
  const [type, setType] = useState<"problem_set" | "reading_notes">(
    "problem_set",
  );
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "");
    const dueLocal = String(data.get("due_at") ?? "");
    const file = selectedFile ?? undefined;

    const next: FieldErrors = {};
    if (!studentId) next.student = "Choose a student.";
    if (!title) next.title = "Give the assignment a title.";
    if (!dueLocal) next.due = "Set a due date.";
    else if (new Date(dueLocal).getTime() <= Date.now())
      next.due = "The due date must be in the future.";
    if (!file) next.file = "Attach the assignment PDF.";
    else if (!accept.includes(file.type)) next.file = "The file must be a PDF.";
    else if (file.size > MAX_FILE_BYTES) next.file = "That file is larger than 20 MB.";

    setErrors(next);
    setGlobalError("");
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    const id = crypto.randomUUID();
    const safeName = file!.name.replace(/[^\w.\-]+/g, "_");
    const path = `${studentId}/${id}/${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET_ASSIGNMENTS)
      .upload(path, file!, { contentType: file!.type });

    if (upErr) {
      setGlobalError(upErr.message);
      setBusy(false);
      return;
    }

    try {
      await createAssignment({
        id,
        studentId,
        type,
        title,
        description: description || null,
        dueAt: new Date(dueLocal).toISOString(),
        filePath: path,
      });
      // createAssignment redirects on success.
    } catch (err) {
      // createAssignment's success path calls redirect(), which throws a
      // NEXT_REDIRECT control-flow error. Re-throw framework errors so Next can
      // navigate — otherwise we'd treat a successful create as a failure, show
      // "NEXT_REDIRECT" as a toast, and delete the PDF we just uploaded.
      unstable_rethrow(err);
      // A genuine failure: the row was never created — remove the orphaned upload.
      await supabase.storage.from(BUCKET_ASSIGNMENTS).remove([path]);
      setGlobalError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <SectionHeading>Recipient</SectionHeading>
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

          <div className="flex flex-col gap-2">
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
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <SectionHeading>Details</SectionHeading>
        <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
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
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Notes for the student — focus areas, page numbers, hints…"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <SectionHeading>Assignment file</SectionHeading>
        <FileDropzone
          accept="application/pdf"
          hint="PDF, up to 20 MB"
          selectedName={selectedFile?.name}
          onFile={(f) => {
            setSelectedFile(f ?? null);
            setErrors((er) => ({ ...er, file: undefined }));
          }}
        />
        <FieldError id="file-error" message={errors.file} />
      </fieldset>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
        {globalError && (
          <div className="sm:mr-auto rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
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
