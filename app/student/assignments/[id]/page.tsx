import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { AssignmentSteps } from "@/components/assignment-steps";
import { CompletionControl } from "@/components/completion-control";
import { ProblemMaterialCard } from "@/components/problem-material-card";
import { StudentSubmitPanel } from "@/components/student-submit-panel";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentComposer } from "@/components/comment-composer";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { MarkAssignmentOpened } from "@/components/mark-assignment-opened";
import { RequestHomeworkButton } from "@/components/request-homework-button";
import { buttonVariants } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  formatDateTime,
  typeLabel,
  fileLabel,
  mimeFromPath,
} from "@/lib/format";
import { FilePreview } from "@/components/ui/file-preview";

function SectionHeader({
  eyebrow,
  title,
  aside,
}: {
  eyebrow: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </span>
        <h2 className="text-base font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
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

  return (
    <div className="flex flex-col gap-12 animate-rise">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex flex-col gap-6 border-b border-border-soft pb-8">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="flex min-w-0 flex-col gap-3">
            <h1 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
              {a.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>Due {formatDateTime(a.due_at)}</span>
              <span aria-hidden className="text-border-strong">
                /
              </span>
              <span>
                {category?.name ? `${category.name} · ` : ""}
                {typeLabel(a.type)}
              </span>
            </div>
          </div>

          <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
        </div>

        <AssignmentSteps status={a.review_status} />
      </header>

      {/* ── Two-column grid workspace ────────────────────────── */}
      <div className="assignment-guidance-grid overflow-hidden rounded-panel border border-border-soft">
        <div className="grid grid-cols-1 divide-y divide-border-soft lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:divide-x lg:divide-y-0">
          {/* Left: work on the problem and hand it in */}
          <div className="flex flex-col divide-y divide-border-soft bg-background/80">
            {/* ── Problem material ─────────────────────────────────── */}
            <section className="flex flex-col gap-6 p-6 md:p-8">
              <SectionHeader eyebrow="01" title="Problem material" />

              {attachments.length > 0 ? (
                <div className="grid gap-4">
                  {attachments.map((f) => (
                    <div key={f.id} className="flex flex-col gap-2">
                      <div className="overflow-hidden rounded-panel border border-border-soft">
                        {f.url ? (
                          <FilePreview
                            url={f.url}
                            mimeType={f.mimeType}
                            title={f.name}
                          />
                        ) : (
                          <div className="p-8 text-center text-sm text-muted-foreground">
                            Couldn&rsquo;t load this file.
                          </div>
                        )}
                      </div>
                      {f.url && (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "default" }),
                            "self-start",
                          )}
                        >
                          <Download data-icon="inline-start" />
                          {f.mimeType.startsWith("image/")
                            ? "Download image"
                            : "Download PDF"}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : a.latex_body || a.description ? (
                <ProblemMaterialCard
                  title={a.title}
                  description={a.description}
                  latexBody={a.latex_body}
                />
              ) : (
                <div className="rounded-panel border border-dashed border-border-soft bg-background/70 px-6 py-10 text-center text-sm text-muted-foreground">
                  No problem material yet.
                </div>
              )}
            </section>

            {/* ── Hand in your work ────────────────────────────────── */}
            <section className="flex flex-col gap-6 p-6 md:p-8">
              <SectionHeader eyebrow="02" title="Hand in your work" />

              <div className="flex flex-col gap-4 rounded-panel border border-border-soft bg-surface-paper/90 p-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
          </div>

          {/* Right: feedback and next steps */}
          <div className="flex flex-col divide-y divide-border-soft bg-surface-paper/70">
            {/* ── Tutor feedback ───────────────────────────────────── */}
            <section className="flex flex-col gap-6 p-6 md:p-8">
              <SectionHeader
                eyebrow="03"
                title="Tutor feedback"
                aside={
                  <span className="inline-flex min-w-7 items-center justify-center rounded-panel border border-border-soft bg-background/80 px-2 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                    {comments.length}
                  </span>
                }
              />

              <div className="flex flex-col gap-6">
                <LiveCommentThread
                  assignmentId={id}
                  initial={comments}
                  participants={participants}
                />
                <CommentComposer assignmentId={id} action={addComment} />
              </div>
            </section>

            {/* ── Keep the momentum going (quiet promo, not a numbered step) ── */}
            <section className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 md:px-8">
              <p className="text-sm text-muted-foreground">
                Finished early? Ask your tutor for more.
              </p>
              <RequestHomeworkButton label="Request extra practice" />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
