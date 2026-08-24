import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Download,
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
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LatexContent } from "@/components/ui/latex-content";
import { FilePreview } from "@/components/ui/file-preview";
import {
  Empty,
  EmptyContent,
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
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 pb-6">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      <div className="min-w-0">
        <BackLink href="/student" className="-ml-3">
          Back to practice
        </BackLink>

        <header className="mt-3 flex min-w-0 flex-col gap-4 border-b border-border pb-5">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                <BookOpen />
                {typeLabel(assignment.type)}
              </Badge>
              {category?.name && (
                <Badge variant="secondary">{category.name}</Badge>
              )}
            </div>

            <AssignmentStatusBadge
              reviewStatus={assignment.review_status}
              dueAt={assignment.due_at}
            />
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <h1 className="max-w-4xl text-balance text-h1 text-foreground">
              {assignment.title}
            </h1>
            <time
              dateTime={assignment.due_at}
              className="inline-flex items-center gap-2 text-body tabular-nums text-muted-foreground md:justify-self-end"
            >
              <CalendarDays className="size-4" aria-hidden />
              Due {formatDateTime(assignment.due_at)}
            </time>
          </div>
        </header>
      </div>

      <main className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <Card
          className="min-w-0 gap-0 rounded-lg border-border p-0 shadow-none"
          aria-labelledby="assignment-material-title"
        >
          <CardHeader className="border-b border-border p-4 sm:p-5">
            <h2
              id="assignment-material-title"
              className="text-label font-semibold text-foreground"
            >
              Problem material
            </h2>
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
                    <div className="flex min-w-0 items-center justify-between gap-4 bg-bg-subtle px-4 py-2.5 sm:px-5">
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

                    <div className="assignment-guidance-grid min-w-0 p-2 sm:p-3">
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
              <div className="assignment-guidance-grid p-2 sm:p-3">
                <article className="mx-auto min-h-[360px] w-full max-w-5xl rounded-md border border-border bg-surface-paper p-5 sm:p-7">
                  {assignment.description && (
                    <p className="max-w-3xl text-pretty text-body-lg text-foreground">
                      {assignment.description}
                    </p>
                  )}
                  {assignment.description && assignment.latex_body && (
                    <Separator className="my-6" />
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
              <div className="assignment-guidance-grid grid min-h-[360px] place-items-center p-6">
                <Empty className="max-w-md border-0 bg-transparent p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BookOpen aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle>No material yet</EmptyTitle>
                    <EmptyDescription>
                      Your tutor has not added a brief or file to this assignment.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <a
                      href="#tutor-discussion"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Ask your tutor
                    </a>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>

        <aside
          className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-5"
          aria-label="Assignment controls"
        >
          <Card
            id="student-submission"
            tabIndex={-1}
            className="scroll-mt-24 gap-0 rounded-lg border-border p-0 shadow-none"
          >
            <CardHeader className="border-b border-border p-4">
              <h2 className="text-label font-semibold text-foreground">
                Your work
              </h2>
              <CardAction>
                <Badge variant={submissions.length > 0 ? "success" : "outline"}>
                  {submissions.length > 0 ? "Submitted" : "To submit"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4">
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

          <Card
            id="tutor-discussion"
            className="scroll-mt-24 gap-0 rounded-lg border-border p-0 shadow-none"
            aria-labelledby="tutor-discussion-title"
          >
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="text-title-sm">
                <h2 id="tutor-discussion-title">Conversation</h2>
              </CardTitle>
              <CardDescription className="text-caption">
                With your tutor
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
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
