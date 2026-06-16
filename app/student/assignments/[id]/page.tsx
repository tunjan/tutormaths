import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { AssignmentSteps } from "@/components/assignment-steps";
import { CompletionControl } from "@/components/completion-control";
import { FilePreview } from "@/components/ui/file-preview";
import { LatexContent } from "@/components/ui/latex-content";
import { StudentSubmitPanel } from "@/components/student-submit-panel";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentComposer } from "@/components/comment-composer";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { MarkAssignmentOpened } from "@/components/mark-assignment-opened";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { BackLink } from "@/components/ui/back-link";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  formatDateTime,
  typeLabel,
  mimeFromPath,
  fileLabel,
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

  const { data: files } = await supabase
    .from("assignment_files")
    .select("id, file_path, mime_type, created_at")
    .eq("assignment_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const attachments = await Promise.all(
    (files ?? []).map(async (f) => ({
      id: f.id,
      name: fileLabel(f.file_path),
      mimeType: f.mime_type || mimeFromPath(f.file_path),
      url: await signedUrl(BUCKET_ASSIGNMENTS, f.file_path),
    })),
  );

  const { data: category } = a.category_id
    ? await supabase
        .from("categories")
        .select("name")
        .eq("id", a.category_id)
        .single()
    : { data: null };

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

  const participants: Record<string, Participant> = {
    [ctx.userId]: { name: "You", role: "student" },
    [a.tutor_id]: { name: "Your tutor", role: "tutor" },
  };

  const isImageOnly = (mimeType: string) => mimeType.startsWith("image/");
  const hasPrompt = Boolean(a.description || a.latex_body || attachments.length);

  return (
    <div className="flex flex-col gap-12 animate-rise">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex flex-col gap-6">
        <BackLink href="/student">Back to dashboard</BackLink>

        <div className="flex flex-col gap-4">
          <div>
            <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
          </div>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
            {a.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
            <span>Due {formatDateTime(a.due_at)}</span>
            <span aria-hidden className="text-border-strong">·</span>
            <span>
              {category?.name ? `${category.name} · ` : ""}
              {typeLabel(a.type)}
            </span>
          </div>
        </div>

        <div className="rounded-panel border border-border bg-surface-muted px-5 py-4">
          <AssignmentSteps status={a.review_status} />
        </div>
      </header>

      {/* ── Problem material ─────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Problem material
          </h2>
          <p className="text-sm text-muted-foreground">
            Open the prompt, solve it on paper or digitally, then upload your finished work.
          </p>
        </div>

        {hasPrompt ? (
          <div className="flex flex-col gap-4 rounded-panel border border-border bg-surface-paper p-6">
            {a.description && (
              <p className="text-base leading-relaxed text-foreground">
                {a.description}
              </p>
            )}

            {a.latex_body && (
              <div className="text-foreground">
                <LatexContent source={a.latex_body} />
              </div>
            )}

            {attachments.length > 0 && (
              <div className="flex flex-col gap-4">
                {attachments.map((f) => {
                  const isImage = isImageOnly(f.mimeType);
                  return (
                    <div key={f.id} className="flex flex-col gap-2">
                      {f.url && isImage && (
                        <div className="overflow-hidden rounded-panel border border-border bg-background">
                          <FilePreview
                            url={f.url}
                            mimeType={f.mimeType}
                            title={f.name}
                          />
                        </div>
                      )}
                      {f.url && (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                        >
                          {isImage ? "Attached image" : "Attached document"}: {f.name}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-panel border border-dashed border-border bg-surface-muted px-6 py-8 text-center text-sm text-muted-foreground">
            No prompt has been attached yet. Check back soon or ask your tutor.
          </div>
        )}
      </section>

      {/* ── Hand in your work ────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Hand in your work
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your progress, then upload your finished file so your tutor can review it.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-panel border border-border bg-background p-5 shadow-[var(--shadow-sm)]">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your progress
          </span>
          <CompletionControl
            assignmentId={id}
            initial={a.completion_pct}
            hasSubmissions={submissions.length > 0}
            uploadTargetId="student-submission"
          />
        </div>

        <StudentSubmitPanel
          assignmentId={id}
          studentId={ctx.userId}
          submissions={submissions}
        />
      </section>

      {/* ── Tutor feedback ───────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          Tutor feedback
          <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-border bg-surface-muted px-2 text-xs font-medium tabular-nums text-muted-foreground">
            {comments.length}
          </span>
        </h2>

        <div className="flex flex-col gap-6">
          <LiveCommentThread
            assignmentId={id}
            initial={comments}
            participants={participants}
          />
          <CommentComposer assignmentId={id} action={addComment} />
        </div>
      </section>

      {/* ── Keep the momentum going (promo) ──────────────────── */}
      <section className="flex flex-col items-start gap-3 rounded-panel border border-border bg-surface-paper p-6">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Keep the momentum going
        </h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Ready to push your skills further? Request extra practice to keep improving.
        </p>
        <RequestHomeworkButton label="Request extra practice" />
      </section>
    </div>
  );
}

