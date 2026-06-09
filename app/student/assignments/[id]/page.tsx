import { notFound } from "next/navigation";
import { CalendarClock, Download, FileText, MessageSquare, Sparkles } from "lucide-react";
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

      <header className="flex flex-col gap-4">
        <BackLink href="/student">Back to dashboard</BackLink>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {typeLabel(a.type)}
          </Badge>
          <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
        </div>
        <h1 className="text-display">{a.title}</h1>
        <p className={cn("flex items-center gap-1.5 text-sm", dueColor)}>
          <CalendarClock className="size-4 shrink-0" />
          <span>
            {relativeTime(a.due_at)} · {formatDateTime(a.due_at)}
          </span>
        </p>
      </header>

      {/* Left: the work itself — read the brief, track progress, hand it in.
          Right: the conversation with the tutor and the "more work" escape
          hatch. On mobile everything stacks in that same reading order. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">The brief</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {a.description && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {a.description}
                </p>
              )}
              {pdfUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive-muted text-destructive">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {fileLabel(a.file_path)}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF</p>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <Download />
                    Open
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  The assignment file could not be loaded.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CompletionControl
                assignmentId={id}
                initial={a.completion_pct}
                hasSubmissions={submissions.length > 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit your work</CardTitle>
              <CardDescription>
                Upload your completed work as a PDF or photo (JPG/PNG).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentSubmitPanel
                assignmentId={id}
                studentId={ctx.userId}
                submissions={submissions}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="size-5 text-muted-foreground" />
                Comments
                <span className="text-sm font-normal text-muted-foreground">
                  {comments.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <LiveCommentThread
                assignmentId={id}
                initial={comments}
                participants={participants}
              />
              <CommentComposer assignmentId={id} action={addComment} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex size-10 items-center justify-center rounded-full bg-cobalt-soft text-cobalt-ink">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-medium">Finished early?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask your tutor for an extra challenge.
                </p>
              </div>
              <RequestHomeworkButton
                variant="default"
                className="w-full"
                label="Request more homework"
                icon={<Sparkles />}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
