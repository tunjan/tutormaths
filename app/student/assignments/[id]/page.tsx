import { notFound } from "next/navigation";
import { CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { FilePreview } from "@/components/ui/file-preview";
import { CompletionControl } from "@/components/completion-control";
import { AssignmentSteps } from "@/components/assignment-steps";
import { SubmissionUploader } from "@/components/submission-uploader";
import { SubmissionList } from "@/components/submission-list";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentForm } from "@/components/comment-form";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { SectionHeading } from "@/components/ui/section-heading";
import { BackLink } from "@/components/ui/back-link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  type ReviewStatus,
  formatDateTime,
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
      id: s.id,
      created_at: s.created_at,
      mime_type: s.mime_type,
      size_bytes: s.size_bytes,
      url: await signedUrl(BUCKET_SUBMISSIONS, s.file_path),
    })),
  );

  const comments = await loadComments(id);

  // RLS hides the tutor's profile from a student, so we label the two known
  // parties directly.
  const participants: Record<string, Participant> = {
    [ctx.userId]: { name: "You", role: "student" },
    [a.tutor_id]: { name: "Your tutor", role: "tutor" },
  };

  return (
    <div className="flex flex-col gap-10">
      <MarkAssignmentRead assignmentId={id} />
      <header className="flex flex-col gap-3">
        <BackLink href="/student">My practice</BackLink>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{a.title}</h1>
          <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
        </div>
        <p className="text-sm text-muted-foreground">
          {typeLabel(a.type)} · due {formatDateTime(a.due_at)}
        </p>
        {a.description && (
          <p className="whitespace-pre-wrap text-sm">{a.description}</p>
        )}
      </header>

      <div className="rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10">
        <AssignmentSteps status={a.review_status} />
      </div>

      <ReviewBanner status={a.review_status} />

      {/* On laptops the assignment PDF gets its own tall, sticky column on the
          left so it stays in view while you submit work and read comments in
          the right column. On mobile everything stacks: read the assignment,
          submit your work, track progress, then talk to your tutor. */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-8">
        <section className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <SectionHeading>Assignment</SectionHeading>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Open PDF
              </a>
            )}
          </div>
          {pdfUrl ? (
            <FilePreview url={pdfUrl} mimeType="application/pdf" title={a.title} />
          ) : (
            <Card className="py-10">
              <CardContent className="text-center text-sm text-muted-foreground">
                The assignment file could not be loaded.
              </CardContent>
            </Card>
          )}
        </section>

        <div className="flex flex-col gap-10">
          {/* Submitting is the step that actually reaches the tutor, so it leads —
              progress tracking is secondary and lives below it. */}
          <section className="flex flex-col gap-4">
            <SectionHeading>Submit your work</SectionHeading>
            <SubmissionUploader assignmentId={id} studentId={ctx.userId} />
            {submissions.length > 0 && (
              <SubmissionList submissions={submissions} canDelete />
            )}
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <CompletionControl
                assignmentId={id}
                initial={a.completion_pct}
                hasSubmissions={submissions.length > 0}
              />
            </CardContent>
          </Card>

          <section className="flex flex-col gap-4">
            <SectionHeading>Comments</SectionHeading>
            <LiveCommentThread
              assignmentId={id}
              initial={comments}
              participants={participants}
            />
            <CommentForm assignmentId={id} action={addComment} />
          </section>
        </div>
      </div>
    </div>
  );
}

function ReviewBanner({ status }: { status: ReviewStatus }) {
  if (status === "assigned") return null;

  // Approval is the big positive moment in the whole flow — give it a warmer,
  // more celebratory treatment than the other states.
  if (status === "approved") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-4 text-primary ring-1 ring-primary/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-sm font-medium">
            Approved — your tutor has signed off on this work. Great job!
          </span>
        </div>
      </div>
    );
  }

  const config = {
    needs_work: {
      icon: RotateCcw,
      className: "bg-warning-muted text-warning",
      text: "Your tutor asked for changes. Read their comments below, then upload a new version.",
    },
    submitted: {
      icon: Clock,
      className: "bg-info-muted text-info",
      text: "Submitted — your tutor will review your work soon.",
    },
  }[status];

  const Icon = config.icon;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
        config.className,
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span>{config.text}</span>
    </div>
  );
}
