"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Plus, X } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      {hasWork && (
        <ul className="flex flex-col gap-1 border-y border-border/40 py-2">
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
          <p className="flex items-center gap-2 text-[14px] text-muted-foreground">
            Submitted for review
          </p>
          {!adding && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[13px] font-medium rounded-lg text-muted-foreground hover:text-foreground -mr-3 shadow-none"
              onClick={() => setAdding(true)}
            >
              <Plus className="size-4 mr-1.5" />
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
          className="rounded-md bg-destructive/10 px-3 py-2 text-[13px] text-destructive border border-destructive/20"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="group flex items-center justify-between py-3 px-3 -mx-3 rounded-md transition-colors hover:bg-accent/30">
        <div className="flex items-center gap-4 min-w-0 pr-4">
          <FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div className="min-w-0 flex flex-col justify-center gap-0.5">
            <p className="truncate text-[14px] font-medium text-foreground">{s.name}</p>
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide">
              {s.size_bytes ? `${humanFileSize(s.size_bytes)} · ` : ""}uploaded
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <ExternalLink className="size-4" />
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
                  <X className="size-4" />
                </Button>
              }
            />
            <AlertDialogContent className="rounded-xl border-border/60 shadow-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="tracking-tight text-[18px]">Remove this submission?</AlertDialogTitle>
                <AlertDialogDescription className="text-[15px] text-muted-foreground leading-relaxed">
                  The uploaded file will be permanently removed. You can upload a
                  replacement afterwards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="rounded-lg font-medium text-[14px] shadow-none">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-lg font-medium text-[14px] bg-foreground text-background hover:bg-foreground/90 shadow-none"
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
