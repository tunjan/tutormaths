"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSubmission } from "@/app/student/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilePreview } from "@/components/ui/file-preview";
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
    <Card className="py-0">
      <CardContent className="divide-y divide-border px-0">
        {submissions.map((s) => (
          <SubmissionItem key={s.id} submission={s} canDelete={canDelete} />
        ))}
      </CardContent>
    </Card>
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
  const [open, setOpen] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [globalError, setGlobalError] = useState("");

  return (
    <div className="px-6 py-4">
      {globalError && (
        <div className="mb-3 rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive" role="alert">
          {globalError}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <div>{formatDateTime(s.created_at)}</div>
          <div className="text-xs text-muted-foreground">
            {s.mime_type === "application/pdf" ? "PDF" : "Image"}
            {s.size_bytes ? ` · ${humanFileSize(s.size_bytes)}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {s.url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              <ChevronDown
                className={cn("transition-transform", open && "rotate-180")}
              />
              {open ? "Hide" : "View"}
            </Button>
          )}
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
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
                    size="sm"
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
                    className={cn(buttonVariants({ variant: "destructive" }))}
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
      {open && s.url && (
        <FilePreview
          url={s.url}
          mimeType={s.mime_type}
          title="Submitted work"
          className="mt-4"
        />
      )}
    </div>
  );
}
