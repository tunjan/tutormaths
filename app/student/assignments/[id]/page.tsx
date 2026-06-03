import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DueBadge } from "@/components/ui/due-badge";
import { CompletionControl } from "@/components/completion-control";
import { SubmissionUploader } from "@/components/submission-uploader";
import { CommentThread } from "@/components/comment-thread";
import { CommentForm } from "@/components/comment-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  dueState,
  formatDateTime,
  humanFileSize,
  typeLabel,
} from "@/lib/format";

export default async function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireStudent();
  const { id } = await params;
  const supabase = await createClient();

  const { data: a } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();
  if (!a) notFound();

  const pdfUrl = await signedUrl(BUCKET_ASSIGNMENTS, a.file_path);

  const { data: subs } = await supabase
    .from("submissions")
    .select("id, file_path, mime_type, size_bytes, created_at")
    .eq("assignment_id", id)
    .order("created_at", { ascending: false });

  const submissions = await Promise.all(
    (subs ?? []).map(async (s) => ({
      ...s,
      url: await signedUrl(BUCKET_SUBMISSIONS, s.file_path),
    })),
  );

  const comments = await loadComments(id);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{a.title}</h1>
          <DueBadge state={dueState(a.due_at, a.completion_pct)} />
        </div>
        <p className="text-sm text-muted-foreground">
          {typeLabel(a.type)} · due {formatDateTime(a.due_at)}
        </p>
        {a.description && (
          <p className="whitespace-pre-wrap text-sm">{a.description}</p>
        )}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "mt-1 self-start")}
          >
            Open assignment PDF
          </a>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ProgressBar value={a.completion_pct} />
          <CompletionControl assignmentId={id} initial={a.completion_pct} />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Submit your work
        </h2>
        <SubmissionUploader assignmentId={id} studentId={ctx.userId} />
        {submissions.length > 0 && (
          <Card className="py-0">
            <CardContent className="divide-y divide-border px-0">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="text-sm">
                    <div>{formatDateTime(s.created_at)}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.mime_type === "application/pdf" ? "PDF" : "Image"}
                      {s.size_bytes ? ` · ${humanFileSize(s.size_bytes)}` : ""}
                    </div>
                  </div>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Open
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Comments</h2>
        <CommentThread comments={comments} />
        <CommentForm assignmentId={id} action={addComment} />
      </section>
    </div>
  );
}
