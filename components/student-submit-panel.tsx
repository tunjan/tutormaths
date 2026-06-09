"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, FileText, Plus, X } from "lucide-react";
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

/**
 * The student's "Submit your work" surface. With nothing handed in it shows the
 * dropzone; once work exists each file shows as a calm green "uploaded" row with
 * a quick open + a remove control, and a reassuring status line. Uploading a new
 * version is one tap away without cluttering the submitted state.
 */
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
    <div className="flex flex-col gap-3">
      {hasWork && (
        <ul className="flex flex-col gap-2">
          {submissions.map((s) => (
            <SubmissionRow key={s.id} submission={s} />
          ))}
        </ul>
      )}

      {(!hasWork || adding) && (
        <SubmissionUploader assignmentId={assignmentId} studentId={studentId} />
      )}

      {hasWork && (
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-foreground" />
            Submitted — your tutor will review it.
          </p>
          {!adding && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
            >
              <Plus />
              New version
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
          className="rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="group flex items-center gap-3 py-2 transition-colors">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {s.size_bytes ? `${humanFileSize(s.size_bytes)} · ` : ""}uploaded
          </p>
        </div>
        {s.url && (
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Open submission in a new tab"
          >
            <ExternalLink />
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
                className="text-muted-foreground hover:text-destructive"
              >
                <X />
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
                className={cn(buttonVariants({ variant: "destructive" }))}
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
    </li>
  );
}
