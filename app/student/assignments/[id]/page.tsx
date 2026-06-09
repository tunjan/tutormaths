import { notFound } from "next/navigation";
import { CalendarClock, Download, FileText, MessageSquare } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { CompletionControl } from "@/components/completion-control";
import { StudentSubmitPanel } from "@/components/student-submit-panel";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentComposer } from "@/components/comment-composer";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { MarkAssignmentOpened } from "@/components/mark-assignment-opened";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  formatDateTime,
  relativeTime,
  timeDueState,
  typeLabel,
} from "@/lib/format";

/** Basename of a storage key, with the upload timestamp prefix stripped. */
function fileLabel(path: string): string {
  return (path.split("/").pop() ?? "file").replace(/^\d+-/, "");
}

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
      name: fileLabel(s.file_path),
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

  const due = timeDueState(a.due_at);
  const dueColor =
    a.review_status === "assigned"
      ? due === "overdue"
        ? "text-destructive"
        : due === "due-soon"
          ? "text-warning"
          : "text-muted-foreground"
      : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-8">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      <header className="flex flex-col gap-6">
        <BackLink href="/student">Back to dashboard</BackLink>
        <div className="flex flex-col gap-4">
          <h1 className="text-display tracking-tight text-foreground mb-1">{a.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4 shrink-0" />
              <span>
                {relativeTime(a.due_at)} &middot; {formatDateTime(a.due_at)}
              </span>
            </span>
            <span className="hidden sm:inline">&middot;</span>
            <span className="hidden sm:inline">Algebra &middot; Quadratics</span>
            <span>&middot;</span>
            <span className="capitalize">{typeLabel(a.type)}</span>
          </div>
        </div>
      </header>

      {/* Left: the work itself — read the brief, track progress, hand it in.
          Right: the conversation with the tutor and the "more work" escape
          hatch. On mobile everything stacks in that same reading order. */}
      <div className="grid grid-cols-1 gap-20 lg:grid-cols-[1.6fr_1fr] lg:items-start pt-10 mt-6 max-w-5xl">
        <div className="flex flex-col gap-12">
          <section className="flex flex-col gap-6">
              {a.description && (
                <p className="text-[16px] leading-relaxed whitespace-pre-wrap text-foreground">
                  {a.description}
                </p>
              )}
              {pdfUrl ? (
                <div className="pt-2">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-3 -ml-3 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-center size-12 rounded-lg bg-muted text-foreground">
                      <FileText className="size-6" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-base font-medium text-foreground group-hover:underline decoration-muted-foreground underline-offset-4">
                        {fileLabel(a.file_path)}
                      </span>
                      <span className="text-sm text-muted-foreground">PDF Document</span>
                    </div>
                    <Download className="size-5 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  The assignment file could not be loaded.
                </p>
              )}
          </section>

          <section className="flex flex-col gap-4">
            <CompletionControl
              assignmentId={id}
              initial={a.completion_pct}
              hasSubmissions={submissions.length > 0}
            />
          </section>

          <section className="flex flex-col gap-5 mt-4">
            <div className="mb-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Submit your work</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your completed work as a PDF or photo (JPG/PNG).
              </p>
            </div>
            <div>
              <StudentSubmitPanel
                assignmentId={id}
                studentId={ctx.userId}
                submissions={submissions}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-12 lg:pl-4 lg:min-h-[500px]">
          <section className="flex flex-col gap-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground border-b border-border/50 pb-3 mb-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              Comments
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground ml-auto">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </h2>
            <div className="flex flex-col gap-8">
              <LiveCommentThread
                assignmentId={id}
                initial={comments}
                participants={participants}
              />
              <CommentComposer assignmentId={id} action={addComment} />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-border/50 pt-8">
            <div>
              <h3 className="text-base font-medium text-foreground">Keep the momentum going</h3>
              <p className="mt-1 text-[14px] text-muted-foreground leading-relaxed">
                Ready to push your skills further? Request extra practice to keep improving.
              </p>
            </div>
            <RequestHomeworkButton
              variant="outline"
              className="w-full bg-transparent shadow-none"
              label="Request extra practice"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
