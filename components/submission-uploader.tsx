"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { recordSubmission } from "@/app/student/actions";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  BUCKET_SUBMISSIONS,
  MAX_FILE_BYTES,
  SUBMISSION_MIME,
} from "@/lib/constants";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

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
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [, startTransition] = useTransition();

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setGlobalError("");

    if (!accept.includes(file.type)) {
      setGlobalError("Only PDF or JPG files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setGlobalError("That file is larger than 20 MB.");
      return;
    }

    setBusy(true);
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${studentId}/${assignmentId}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET_SUBMISSIONS)
      .upload(path, file, { contentType: file.type });

    if (upErr) {
      setGlobalError(upErr.message);
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
      setGlobalError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {globalError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle aria-hidden />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}
      <FileDropzone
        accept="application/pdf,image/jpeg"
        title="Drop your solution here"
        actionLabel="Browse files"
        hint="PDF or JPG · 20 MB max"
        busy={busy}
        busyLabel="Uploading…"
        className="py-6"
        onFile={(f) => void handleFile(f)}
      />
    </div>
  );
}
