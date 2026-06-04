"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createAssignment } from "@/app/tutor/actions";
import {
  ASSIGNMENT_MIME,
  BUCKET_ASSIGNMENTS,
  MAX_FILE_BYTES,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function NewAssignmentForm({
  students,
  defaultStudentId = "",
}: {
  students: StudentOption[];
  defaultStudentId?: string;
}) {
  const [supabase] = useState(() => createClient());
  const fileRef = useRef<HTMLInputElement>(null);
  const [studentId, setStudentId] = useState(defaultStudentId);
  const [type, setType] = useState<"problem_set" | "reading_notes">(
    "problem_set",
  );
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "");
    const dueLocal = String(data.get("due_at") ?? "");
    const file = fileRef.current?.files?.[0];

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
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    const id = crypto.randomUUID();
    const safeName = file!.name.replace(/[^\w.\-]+/g, "_");
    const path = `${studentId}/${id}/${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET_ASSIGNMENTS)
      .upload(path, file!, { contentType: file!.type });

    if (upErr) {
      toast.error(upErr.message);
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
      // The row was never created — remove the now-orphaned upload.
      await supabase.storage.from(BUCKET_ASSIGNMENTS).remove([path]);
      toast.error((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Student</Label>
        <Select
          value={studentId}
          onValueChange={(v) => {
            setStudentId(v ?? "");
            setErrors((e) => ({ ...e, student: undefined }));
          }}
        >
          <SelectTrigger aria-invalid={!!errors.student}>
            <SelectValue placeholder="Choose a student…" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name || s.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.student} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Type</Label>
        <Select
          value={type}
          onValueChange={(v) =>
            setType((v as "problem_set" | "reading_notes") ?? "problem_set")
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="due_at">Due</Label>
        <DateTimePicker
          id="due_at"
          name="due_at"
          defaultValue={defaultDue()}
          invalid={!!errors.due}
          onChange={() => setErrors((e) => ({ ...e, due: undefined }))}
        />
        <FieldError message={errors.due} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Assignment PDF</Label>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            id="file"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              setFileName(e.target.files?.[0]?.name ?? "");
              setErrors((er) => ({ ...er, file: undefined }));
            }}
          />
          <Button
            type="button"
            variant="outline"
            aria-invalid={!!errors.file}
            onClick={() => fileRef.current?.click()}
          >
            {fileName ? "Change PDF" : "Choose PDF"}
          </Button>
          <span className="truncate text-sm text-muted-foreground">
            {fileName || "No file chosen"}
          </span>
        </div>
        <FieldError message={errors.file} />
      </div>

      <Button type="submit" disabled={busy} className="self-start">
        {busy ? "Creating…" : "Create assignment"}
      </Button>
    </form>
  );
}
