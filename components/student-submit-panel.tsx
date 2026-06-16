"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
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
}: {
  assignmentId: string;
  studentId: string;
  submissions: StudentSubmission[];
}) {
  const hasWork = submissions.length > 0;
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-5 rounded-panel border border-border bg-background p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-panel border border-border bg-surface-muted text-foreground">
          {hasWork ? (
            <CheckCircle2 className="size-4" strokeWidth={1.8} />
          ) : (
            <FileText className="size-4" strokeWidth={1.8} />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {hasWork ? "Submitted for tutor review" : "Upload your completed work"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {hasWork
              ? "Your tutor can see these files. Upload a revision if you need to replace or add work."
              : "Submit a PDF or JPG once you are ready for feedback."}
          </p>
        </div>
      </div>

      {hasWork && (
        <ul className="flex flex-col gap-1 rounded-panel border border-border bg-surface-muted p-2">
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
          <p className="text-[13px] text-muted-foreground">
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
        <div
          className="rounded-panel border border-destructive/20 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex items-center justify-between rounded-panel bg-background px-3 py-3 transition-colors hover:bg-surface-hover">
        <div className="flex min-w-0 items-center gap-3 pr-4">
          <FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div className="min-w-0 flex flex-col justify-center gap-0.5">
            <p className="truncate text-[14px] font-medium text-foreground">{s.name}</p>
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide">
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
                "text-muted-foreground hover:text-foreground rounded-md shadow-none",
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
                  className="text-muted-foreground hover:text-destructive rounded-md shadow-none"
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
