"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSubmission } from "@/app/student/actions";
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
import { formatDateTime, humanFileSize } from "@/lib/format";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

export interface SubmissionItemView {
  id: string;
  created_at: string;
  mime_type: string;
  size_bytes: number | null;
  url: string | null;
}

/**
 * Submissions with inline preview (expand in place) and, for the owning
 * student, deletion. The tutor passes canDelete={false}.
 */
export function SubmissionList({
  submissions,
  canDelete,
}: {
  submissions: SubmissionItemView[];
  canDelete: boolean;
}) {
  return (
    <div className="divide-y divide-border-subtle">
        {submissions.map((s) => (
          <SubmissionItem key={s.id} submission={s} canDelete={canDelete} />
        ))}
    </div>
  );
}

function SubmissionItem({
  submission: s,
  canDelete,
}: {
  submission: SubmissionItemView;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [deleting, startDelete] = useTransition();
  const [globalError, setGlobalError] = useState("");

  return (
    <div className="px-6 py-4">
      {globalError && (
        <Alert variant="destructive" role="alert" className="mb-3">
          <AlertCircle aria-hidden />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="text-body">
          <div>{formatDateTime(s.created_at)}</div>
          <div className="text-caption text-muted-foreground">
            {s.mime_type === "application/pdf" ? "PDF" : "Image"}
            {s.size_bytes ? ` · ${humanFileSize(s.size_bytes)}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              aria-label="Open in a new tab"
            >
              <ExternalLink />
            </a>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={deleting}
                    aria-label="Delete submission"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The uploaded file will be permanently removed. You can upload
                    a replacement afterwards.
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
                          toast.success("Submission deleted.");
                          setGlobalError("");
                          router.refresh();
                        } catch (e) {
                          setGlobalError((e as Error).message);
                        }
                      })
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
