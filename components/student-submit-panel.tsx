"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSubmission } from "@/app/student/actions";
import { SubmissionUploader } from "@/components/submission-uploader";
import { Button } from "@/components/ui/button";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { humanFileSize } from "@/lib/format";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

export interface StudentSubmission {
  id: string;
  name: string;
  size_bytes: number | null;
  url: string | null;
}

export function StudentSubmitPanel({
  assignmentId,
  studentId,
  submissions,
  embedded = false,
}: {
  assignmentId: string;
  studentId: string;
  submissions: StudentSubmission[];
  embedded?: boolean;
}) {
  const hasWork = submissions.length > 0;
  const [adding, setAdding] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col",
        embedded ? "gap-4" : "gap-6",
        !embedded &&
          "rounded-md border border-border bg-card p-6",
      )}
    >
      {(!embedded || hasWork) && (
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-label text-foreground">
            {hasWork ? "Submitted files" : "Upload your completed work"}
          </p>
          <p className="max-w-prose text-caption text-muted-foreground">
            {hasWork
              ? "Your tutor can see these files. Upload a revision if needed."
              : "Submit a PDF or JPG when you are ready for feedback."}
          </p>
        </div>
      )}

      {hasWork && (
        <ul className="flex flex-col gap-1 rounded-md bg-bg-muted p-2">
          {submissions.map((s) => (
            <SubmissionRow key={s.id} submission={s} />
          ))}
        </ul>
      )}

      {(!hasWork || adding) && (
        <SubmissionUploader assignmentId={assignmentId} studentId={studentId} />
      )}

      {hasWork && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-caption tabular-nums text-muted-foreground">
            {submissions.length} {submissions.length === 1 ? "file" : "files"} uploaded
          </p>
          {!adding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdding(true)}
            >
              <Plus data-icon="inline-start" />
              Upload revision
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission: s }: { submission: StudentSubmission }) {
  const router = useRouter();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState("");

  return (
    <li className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between rounded-sm bg-card px-3 py-3 transition-colors duration-fast hover:bg-surface-hover">
        <div className="flex min-w-0 items-center gap-3 pr-4">
          <FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div className="min-w-0 flex flex-col justify-center gap-1">
            <p className="truncate text-label text-foreground">{s.name}</p>
            <p className="text-caption text-muted-foreground">
              {s.size_bytes ? `${humanFileSize(s.size_bytes)} · ` : ""}uploaded
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "text-muted-foreground hover:text-foreground rounded-sm shadow-none",
              )}
              aria-label="Open submission in a new tab"
            >
              <ExternalLink data-icon="inline-start" />
            </a>
          )}
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={deleting}
                  aria-label="Remove submission"
                  className="text-muted-foreground hover:text-destructive rounded-sm shadow-none"
                >
                  <Trash2 />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this submission?</AlertDialogTitle>
                <AlertDialogDescription>
                  The uploaded file will be permanently removed. You can upload a
                  replacement afterwards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() =>
                    startDelete(async () => {
                      try {
                        await deleteSubmission(s.id);
                        toast.success("Submission removed.");
                        setError("");
                        router.refresh();
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    })
                  }
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </li>
  );
}
