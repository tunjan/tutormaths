import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { FilePreview } from "@/components/ui/file-preview";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentForm } from "@/components/comment-form";
import { AssignmentActions } from "@/components/assignment-actions";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { ReviewControls } from "@/components/review-controls";
import { SubmissionList } from "@/components/submission-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import { formatDateTime, typeLabel } from "@/lib/format";

export default async function TutorAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTutor();
  const { id } = await params;
  const supabase = await createClient();

  const { data: a } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();
  if (!a) notFound();

  const { data: people } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", [a.tutor_id, a.student_id]);

  const student = people?.find((p) => p.id === a.student_id);
  const participants: Record<string, Participant> = {};
  for (const p of people ?? []) {
    participants[p.id] = {
      name: p.full_name || p.email || "User",
      role: p.role,
    };
  }

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

  return (
    <div className="flex flex-col gap-10">
      <MarkAssignmentRead assignmentId={id} />
      <header className="flex flex-col gap-3">
        <Link
          href="/tutor"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Dashboard
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{a.title}</h1>
          <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
        </div>
        <p className="text-sm text-muted-foreground">
          {student?.full_name || student?.email} · {typeLabel(a.type)} · due{" "}
          {formatDateTime(a.due_at)}
        </p>
        {a.description && (
          <p className="whitespace-pre-wrap text-sm">{a.description}</p>
        )}
        <div className="max-w-sm">
          <ProgressBar value={a.completion_pct} />
          <p className="mt-1 text-xs text-muted-foreground">
            Student-reported progress: {a.completion_pct}%
          </p>
        </div>
        <div className="pt-2">
          <AssignmentActions
            id={a.id}
            title={a.title}
            description={a.description}
            type={a.type}
            dueAt={a.due_at}
            studentId={a.student_id}
          />
        </div>
      </header>

      {/* On laptops the assignment PDF gets its own tall, sticky column on the
          left while the review workflow (submission, verdict, comments) sits
          beside it on the right. On mobile everything stacks in reading order:
          the work first, then the verdict, then the conversation. */}
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
          <section className="flex flex-col gap-4">
            <SectionHeading>Submitted work</SectionHeading>
            {submissions.length === 0 ? (
              <Card className="py-10">
                <CardContent className="text-center text-sm text-muted-foreground">
                  No work submitted yet.
                </CardContent>
              </Card>
            ) : (
              <SubmissionList submissions={submissions} canDelete={false} />
            )}
          </section>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <SectionHeading>Your review</SectionHeading>
              <ReviewControls assignmentId={a.id} status={a.review_status} />
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
