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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "");
    const dueLocal = String(data.get("due_at") ?? "");
    const file = fileRef.current?.files?.[0];

    if (!studentId || !title || !dueLocal) {
      toast.error("Student, title and due date are required.");
      return;
    }
    if (!file) {
      toast.error("Attach the assignment PDF.");
      return;
    }
    if (!accept.includes(file.type)) {
      toast.error("The assignment file must be a PDF.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("That file is larger than 20 MB.");
      return;
    }

    setBusy(true);
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${studentId}/${id}/${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET_ASSIGNMENTS)
      .upload(path, file, { contentType: file.type });

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
      toast.error((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Student</Label>
        <Select
          value={studentId}
          onValueChange={(v) => setStudentId(v ?? "")}
        >
          <SelectTrigger>
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
          required
          placeholder="Quadratic equations — set 3"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="due_at">Due</Label>
        <Input id="due_at" name="due_at" type="datetime-local" required />
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
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
          >
            Choose PDF
          </Button>
          <span className="truncate text-sm text-muted-foreground">
            {fileName || "No file chosen"}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={busy} className="self-start">
        {busy ? "Creating…" : "Create assignment"}
      </Button>
    </form>
  );
}
