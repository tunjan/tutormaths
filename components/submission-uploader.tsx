"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { recordSubmission } from "@/app/student/actions";
import {
  BUCKET_SUBMISSIONS,
  MAX_FILE_BYTES,
  SUBMISSION_MIME,
} from "@/lib/constants";

const accept = SUBMISSION_MIME as readonly string[];

/**
 * Drag-and-drop uploader for completed work (PDF or JPG, ≤20 MB). Uploads
 * directly to the private submissions bucket under the student's own folder
 * ({studentId}/{assignmentId}/...), then records the row via a server action.
 */
export function SubmissionUploader({
  assignmentId,
  studentId,
}: {
  assignmentId: string;
  studentId: string;
}) {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!accept.includes(file.type)) {
      toast.error("Only PDF or JPG files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("That file is larger than 20 MB.");
      return;
    }

    setBusy(true);
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${studentId}/${assignmentId}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET_SUBMISSIONS)
      .upload(path, file, { contentType: file.type });

    if (upErr) {
      toast.error(upErr.message);
      setBusy(false);
      return;
    }

    try {
      await recordSubmission({
        assignmentId,
        filePath: path,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      toast.success("Work submitted.");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-6 py-10 text-center text-sm transition ${
        dragging
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/60"
      }`}
    >
      {busy ? (
        <span>Uploading…</span>
      ) : (
        <>
          <span className="font-medium text-foreground">
            Drag a file here, or click to choose
          </span>
          <span className="text-xs">PDF or JPG, up to 20 MB</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
