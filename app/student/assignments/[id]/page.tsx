import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Download,
  MessageSquareText,
  Paperclip,
} from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import {
  addComment,
  deleteComment,
  editComment,
} from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { CompletionControl } from "@/components/completion-control";
import { StudentSubmitPanel } from "@/components/student-submit-panel";
import {
  LiveCommentThread,
  type Participant,
} from "@/components/live-comment-thread";
import { CommentComposer } from "@/components/comment-composer";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { MarkAssignmentOpened } from "@/components/mark-assignment-opened";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LatexContent } from "@/components/ui/latex-content";
import { FilePreview } from "@/components/ui/file-preview";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  fileLabel,
  formatDateTime,
  mimeFromPath,
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

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (!assignment) notFound();

  const [{ data: files }, { data: category }, { data: submissionRows }, comments] =
    await Promise.all([
      supabase
        .from("assignment_files")
        .select("id, file_path, mime_type, created_at")
        .eq("assignment_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      assignment.category_id
        ? supabase
            .from("categories")
            .select("name")
            .eq("id", assignment.category_id)
            .single()
        : Promise.resolve({ data: null }),
      supabase
        .from("submissions")
        .select("id, file_path, mime_type, size_bytes, created_at")
        .eq("assignment_id", id)
        .order("created_at", { ascending: false }),
      loadComments(id),
    ]);

  const [attachments, submissions] = await Promise.all([
    Promise.all(
      (files ?? []).map(async (file) => ({
        id: file.id,
        name: fileLabel(file.file_path),
        mimeType: file.mime_type || mimeFromPath(file.file_path),
        url: await signedUrl(BUCKET_ASSIGNMENTS, file.file_path),
      })),
    ),
    Promise.all(
      (submissionRows ?? []).map(async (submission) => ({
        id: submission.id,
        name: fileLabel(submission.file_path),
        size_bytes: submission.size_bytes,
        url: await signedUrl(BUCKET_SUBMISSIONS, submission.file_path),
      })),
    ),
  ]);

  const participants: Record<string, Participant> = {
    [ctx.userId]: { name: "You", role: "student" },
    [assignment.tutor_id]: { name: "Your tutor", role: "tutor" },
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 pb-6 animate-rise">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      <Card className="gap-0 p-0">
        <header className="flex min-w-0 flex-col justify-between gap-4 p-6 sm:p-6">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                <BookOpen />
                {typeLabel(assignment.type)}
              </Badge>
              {category?.name && <Badge variant="secondary">{category.name}</Badge>}
            </div>

            <h1 className="max-w-4xl text-h1 text-foreground">
              {assignment.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden />
              Due {formatDateTime(assignment.due_at)}
            </span>
            <AssignmentStatusBadge
              reviewStatus={assignment.review_status}
              dueAt={assignment.due_at}
            />
          </div>
        </header>
      </Card>

      <main className="grid min-w-0 items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 gap-0 p-0" aria-labelledby="assignment-material-title">
          <CardHeader className="border-b border-border-soft p-6">
            <CardTitle id="assignment-material-title" className="flex items-center gap-2">
              <BookOpen className="size-4 text-content-default" aria-hidden />
              Problem material
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {attachments.length > 0
                  ? `${attachments.length} ${attachments.length === 1 ? "file" : "files"}`
                  : "Written brief"}
              </Badge>
            </CardAction>
          </CardHeader>

          <CardContent className="min-w-0 p-0">
            {attachments.length > 0 ? (
              <div className="flex min-w-0 flex-col divide-y divide-border-soft">
                {attachments.map((file) => (
                  <section key={file.id} className="min-w-0">
                    <div className="flex min-w-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
                      <div className="flex min-w-0 items-center gap-2">
                        <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="truncate text-label text-foreground">
                          {file.name}
                        </span>
                      </div>
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          <Download data-icon="inline-start" />
                          Download
                        </a>
                      )}
                    </div>

                    <div className="assignment-guidance-grid min-w-0 bg-bg-muted/55 p-2 sm:p-3">
                      {file.url ? (
                        <FilePreview
                          url={file.url}
                          mimeType={file.mimeType}
                          title={file.name}
                          className="rounded-md border-border bg-surface-paper"
                        />
                      ) : (
                        <div className="grid min-h-[360px] place-items-center rounded-md border border-dashed border-border-strong bg-surface-paper p-8 text-center text-body text-muted-foreground">
                          This file could not be loaded.
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : assignment.latex_body || assignment.description ? (
              <div className="assignment-guidance-grid bg-bg-muted/55 p-3 sm:p-6">
                <article className="mx-auto min-h-[420px] w-full max-w-5xl bg-surface-paper p-6 sm:p-8">
                  {assignment.description && (
                    <p className="max-w-3xl text-body-lg text-foreground">
                      {assignment.description}
                    </p>
                  )}
                  {assignment.description && assignment.latex_body && (
                    <Separator className="my-8" />
                  )}
                  {assignment.latex_body && (
                    <LatexContent
                      source={assignment.latex_body}
                      className="max-w-none"
                    />
                  )}
                </article>
              </div>
            ) : (
              <div className="assignment-guidance-grid grid min-h-[420px] place-items-center bg-bg-muted/55 p-8">
                <Empty className="max-w-md border-0 bg-transparent p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BookOpen aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle>No material yet</EmptyTitle>
                    <EmptyDescription>
                    Your tutor has not added a brief or file to this assignment.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>

        <aside
          className="flex min-w-0 flex-col gap-4 2xl:sticky 2xl:top-6"
          aria-label="Assignment controls"
        >
          <Card id="student-submission" tabIndex={-1} className="gap-0 p-0 scroll-mt-24">
            <CardHeader className="border-b border-border-soft p-6">
              <CardTitle>Your work</CardTitle>
              <CardAction>
                <Badge variant={submissions.length > 0 ? "success" : "info"}>
                  {submissions.length > 0 ? "Submitted" : "To submit"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-6">
              <CompletionControl
                assignmentId={id}
                initial={assignment.completion_pct}
                hasSubmissions={submissions.length > 0}
                uploadTargetId="student-submission"
              />
              <Separator />
              <StudentSubmitPanel
                assignmentId={id}
                studentId={ctx.userId}
                submissions={submissions}
                embedded
              />
            </CardContent>
          </Card>

          <Card className="gap-0 p-0">
            <CardHeader className="border-b border-border-soft p-6">
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-muted-foreground" aria-hidden />
                Tutor discussion
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  {comments.length} {comments.length === 1 ? "message" : "messages"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-6">
              <LiveCommentThread
                assignmentId={id}
                initial={comments}
                participants={participants}
                currentUserId={ctx.userId}
                editAction={editComment}
                deleteAction={deleteComment}
              />
              <CommentComposer assignmentId={id} action={addComment} />
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
