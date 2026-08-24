import { notFound } from "next/navigation";
import { Eye, EyeOff, FilePlus2 } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import {
  addComment,
  deleteComment,
  editComment,
} from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { LatexContent } from "@/components/ui/latex-content";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentComposer } from "@/components/comment-composer";
import { AssignmentActions } from "@/components/assignment-actions";
import { AssignmentFileViewer } from "@/components/assignment-file-viewer";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { ReviewControls } from "@/components/review-controls";
import { SubmissionList } from "@/components/submission-list";
import { BackLink } from "@/components/ui/back-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  formatDateTime,
  typeLabel,
  mimeFromPath,
  fileLabel,
  type ReviewStatus,
} from "@/lib/format";

type StageDetails = {
  eyebrow: string;
  headline: string;
  description: string;
  activeIndex: number;
  isComplete: boolean;
};

function assignmentStage({
  reviewStatus,
  studentOpenedAt,
  completionPct,
  submissionCount,
  studentName,
  dueAt,
}: {
  reviewStatus: ReviewStatus;
  studentOpenedAt: string | null;
  completionPct: number;
  submissionCount: number;
  studentName: string;
  dueAt: string;
}): StageDetails {
  if (reviewStatus === "approved") {
    return {
      eyebrow: "Completed",
      headline: `${studentName}’s work is approved`,
      description: "The assignment is complete. No further action is needed.",
      activeIndex: 3,
      isComplete: true,
    };
  }

  if (reviewStatus === "needs_work") {
    return {
      eyebrow: "Revision requested",
      headline: `Waiting for ${studentName} to revise`,
      description: "You returned the work with feedback. The next move is theirs.",
      activeIndex: 3,
      isComplete: false,
    };
  }

  if (reviewStatus === "submitted" || submissionCount > 0) {
    return {
      eyebrow: "Ready for review",
      headline: `${studentName} has submitted work`,
      description: "Review the submission alongside the assignment below.",
      activeIndex: 2,
      isComplete: false,
    };
  }

  if (studentOpenedAt) {
    return {
      eyebrow: "In progress",
      headline: `${studentName} is working on this`,
      description: `${completionPct}% reported progress · Due ${formatDateTime(dueAt)}`,
      activeIndex: 1,
      isComplete: false,
    };
  }

  return {
    eyebrow: "Waiting for student",
    headline: `Waiting for ${studentName} to open this`,
    description: `No action needed from you · Due ${formatDateTime(dueAt)}`,
    activeIndex: 0,
    isComplete: false,
  };
}

const lifecycleLabels = ["Assigned", "Opened", "Submitted", "Reviewed"];

export default async function TutorAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireTutor();
  const { id } = await params;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();
  if (!assignment) notFound();

  const [peopleResult, filesResult, categoriesResult, submissionsResult, comments] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .in("id", [assignment.tutor_id, assignment.student_id]),
      supabase
        .from("assignment_files")
        .select("id, file_path, mime_type, created_at")
        .eq("assignment_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("categories").select("id, name").order("name"),
      supabase
        .from("submissions")
        .select("id, file_path, mime_type, size_bytes, created_at")
        .eq("assignment_id", id)
        .order("created_at", { ascending: false }),
      loadComments(id),
    ]);

  if (
    peopleResult.error ||
    filesResult.error ||
    categoriesResult.error ||
    submissionsResult.error
  ) {
    throw new Error("Could not load this assignment. Please try again.");
  }

  const people = peopleResult.data ?? [];
  const files = filesResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const submissionRows = submissionsResult.data ?? [];
  const student = people.find((person) => person.id === assignment.student_id);
  const studentDisplayName =
    student?.full_name?.trim() || student?.email || "Student";
  const studentShortName =
    student?.full_name?.trim().split(/\s+/)[0] || "the student";

  const participants: Record<string, Participant> = {};
  for (const person of people) {
    participants[person.id] = {
      name: person.full_name || person.email || "User",
      role: person.role,
    };
  }

  const [attachments, submissions] = await Promise.all([
    Promise.all(
      files.map(async (file) => ({
        id: file.id,
        name: fileLabel(file.file_path),
        mimeType: file.mime_type || mimeFromPath(file.file_path),
        url: await signedUrl(BUCKET_ASSIGNMENTS, file.file_path),
      })),
    ),
    Promise.all(
      submissionRows.map(async (submission) => ({
        id: submission.id,
        created_at: submission.created_at,
        mime_type: submission.mime_type,
        size_bytes: submission.size_bytes,
        url: await signedUrl(BUCKET_SUBMISSIONS, submission.file_path),
      })),
    ),
  ]);

  const categoryName =
    categories.find((category) => category.id === assignment.category_id)?.name ??
    null;
  const stage = assignmentStage({
    reviewStatus: assignment.review_status,
    studentOpenedAt: assignment.student_opened_at,
    completionPct: assignment.completion_pct,
    submissionCount: submissions.length,
    studentName: studentShortName,
    dueAt: assignment.due_at,
  });

  return (
    <div className="mb-12 flex w-full flex-col gap-4 text-foreground animate-rise">
      <MarkAssignmentRead assignmentId={id} />

      <BackLink href="/tutor" className="-ml-3">
        Back to dashboard
      </BackLink>

      <div className="flex w-full flex-col gap-4">
        <header className="rounded-md border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body text-muted-foreground">
                  <AssignmentStatusBadge
                    reviewStatus={assignment.review_status}
                    dueAt={assignment.due_at}
                  />
                  <span className="min-w-0 break-words font-semibold text-foreground">
                    {studentDisplayName}
                  </span>
                  {categoryName && (
                    <>
                      <span className="opacity-30" aria-hidden>
                        ·
                      </span>
                      <span>{categoryName}</span>
                    </>
                  )}
                  <span className="opacity-30" aria-hidden>
                    ·
                  </span>
                  <span className="capitalize">{typeLabel(assignment.type)}</span>
                  <span className="opacity-30" aria-hidden>
                    ·
                  </span>
                  <span className="tabular-nums">
                    Due {formatDateTime(assignment.due_at)}
                  </span>
                </div>

                <h1 className="max-w-4xl break-words text-h1 text-foreground">
                  {assignment.title}
                </h1>
              </div>

              <div className="shrink-0 lg:pt-1">
                <AssignmentActions
                  id={assignment.id}
                  title={assignment.title}
                  description={assignment.description}
                  type={assignment.type}
                  dueAt={assignment.due_at}
                  studentId={assignment.student_id}
                  categoryId={assignment.category_id}
                  categories={categories}
                  attachments={attachments.map(({ id: fileId, name, mimeType }) => ({
                    id: fileId,
                    name,
                    mimeType,
                  }))}
                  latexBody={assignment.latex_body}
                />
              </div>
            </div>

            <div className="grid gap-4 border-t border-border-subtle pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <p className="font-eyebrow text-content-info">{stage.eyebrow}</p>
                <p className="mt-1 break-words text-heading-md text-foreground">
                  {stage.headline}
                </p>
                <p className="mt-1 max-w-2xl text-body text-muted-foreground">
                  {stage.description}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-md bg-bg-muted px-3 py-2.5">
                {assignment.student_opened_at ? (
                  <Eye className="size-4 shrink-0 text-content-info" aria-hidden />
                ) : (
                  <EyeOff className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <div className="min-w-0">
                  <p className="text-caption text-muted-foreground">Student activity</p>
                  <p className="break-words text-label text-foreground">
                    {assignment.student_opened_at
                      ? `Opened ${formatDateTime(assignment.student_opened_at)}`
                      : "Not opened yet"}
                  </p>
                </div>
              </div>
            </div>

            <ol
              aria-label="Assignment lifecycle"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {lifecycleLabels.map((label, index) => {
                const state =
                  index < stage.activeIndex ||
                  (index === stage.activeIndex && stage.isComplete)
                    ? "complete"
                    : index === stage.activeIndex
                      ? "current"
                      : "upcoming";

                return (
                  <li
                    key={label}
                    aria-current={state === "current" ? "step" : undefined}
                    className={cn(
                      "min-w-0 border-t-2 pt-2",
                      state === "complete" && "border-foreground",
                      state === "current" && "border-content-info",
                      state === "upcoming" && "border-border-subtle",
                    )}
                  >
                    <p
                      className={cn(
                        "truncate text-label",
                        state === "upcoming"
                          ? "text-muted-foreground"
                          : "text-foreground",
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {state === "complete"
                        ? "Complete"
                        : state === "current"
                          ? "Current"
                          : "Next"}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.85fr)]">
          <section aria-labelledby="assignment-material-heading">
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2 id="assignment-material-heading">
                    {assignment.latex_body
                      ? "Assignment"
                      : attachments.length === 1
                        ? "Assignment file"
                        : "Assignment files"}
                  </h2>
                </CardTitle>
                {assignment.description && (
                  <CardDescription className="max-w-3xl text-body-lg text-foreground">
                    {assignment.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                {assignment.latex_body ? (
                  <div className="rounded-md bg-surface-inset p-4 sm:p-6">
                    <LatexContent source={assignment.latex_body} />
                  </div>
                ) : attachments.length > 0 ? (
                  <AssignmentFileViewer files={attachments} />
                ) : (
                  <Empty className="min-h-64 p-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FilePlus2 />
                      </EmptyMedia>
                      <EmptyTitle>No assignment file</EmptyTitle>
                      <EmptyDescription>
                        Edit the assignment to add a PDF, image, or LaTeX content.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </section>

          <aside
            aria-label="Student work and conversation"
            className="flex min-w-0 flex-col gap-4"
          >
            {submissions.length > 0 && (
              <section aria-labelledby="student-work-heading">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h2 id="student-work-heading">Student work</h2>
                    </CardTitle>
                    <CardDescription>
                      {submissions.length === 1
                        ? "One submission is ready to review."
                        : `${submissions.length} submissions are ready to review.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <SubmissionList submissions={submissions} canDelete={false} />
                    <Separator />
                    <div className="flex flex-col gap-3">
                      <h3 className="text-heading-md text-foreground">Your review</h3>
                      <ReviewControls
                        assignmentId={assignment.id}
                        status={assignment.review_status}
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            <section aria-labelledby="conversation-heading">
              <Card className="gap-0 rounded-lg border-border p-0 shadow-none">
                <CardHeader className="border-b border-border p-4">
                  <CardTitle className="text-title-sm">
                    <h2 id="conversation-heading">Conversation</h2>
                  </CardTitle>
                  <CardDescription className="text-caption">
                    With {studentShortName}
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
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
