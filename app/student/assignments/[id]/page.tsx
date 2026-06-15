import { notFound } from "next/navigation";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
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

  return (
    <div className="mb-12 flex w-full flex-col overflow-hidden rounded-[12px] border border-border bg-background text-foreground shadow-[var(--shadow-sm)] selection:bg-primary selection:text-primary-foreground animate-rise">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      <main className="flex w-full flex-col divide-y divide-border">
        <header className="flex flex-col gap-6 bg-surface-muted px-6 pb-8 pt-6 md:px-8">
          <BackLink href="/student" className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Back to dashboard
          </BackLink>

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              {a.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
              <span>{formatDateTime(a.due_at)}</span>
              {category?.name && (
                <>
                  <span className="text-border-strong">·</span>
                  <span>{category.name}</span>
                </>
              )}
              <span className="text-border-strong">·</span>
              <span>{typeLabel(a.type)}</span>
            </div>

            <div className="max-w-2xl rounded-[10px] border border-border bg-background px-4 py-3">
              <AssignmentSteps status={a.review_status} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-[1fr_320px] lg:divide-x lg:divide-y-0">

          <div className="flex flex-col divide-y divide-border p-6 md:p-8">
            <section className="flex flex-col gap-6 pb-6">
              {a.description && (
                <p className="text-base leading-relaxed text-foreground">
                  {a.description}
                </p>
              )}

              {a.latex_body && (
                <div className="rounded-[12px] border border-border bg-surface-muted p-6">
                  <LatexContent source={a.latex_body} />
                </div>
              )}

              {attachments.length > 0 && (
                <div className="pt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {attachments.map((f) => {
                    const isImage = f.mimeType.startsWith("image/");
                    return (
                      <div key={f.id} className="flex flex-col gap-3">
                        {f.url && isImage && (
                          <div className="overflow-hidden rounded-[12px] border border-border">
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
                            className="group flex items-center justify-between transition-opacity duration-200 hover:opacity-70"
                          >
                            <div className="flex items-center gap-4">
                              {isImage ? (
                                <ImageIcon
                                  className="size-5 text-foreground"
                                  strokeWidth={2}
                                />
                              ) : (
                                <FileText
                                  className="size-5 text-foreground"
                                  strokeWidth={2}
                                />
                              )}
                              <div className="flex flex-col">
                                <span className="mb-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                                  {isImage ? "Attached Image" : "Attached Document"}
                                </span>
                                <span className="text-sm font-semibold text-foreground tracking-tight">
                                  {f.name}
                                </span>
                              </div>
                            </div>
                            <Download
                              className="size-5 text-muted-foreground transition-colors"
                              strokeWidth={2}
                            />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4 py-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Progress</h2>
                <p className="text-sm text-muted-foreground">
                  Track how far you are, then upload your finished work when you are ready.
                </p>
              </div>
              <CompletionControl
                assignmentId={id}
                initial={a.completion_pct}
                hasSubmissions={submissions.length > 0}
                uploadTargetId="student-submission"
              />
            </section>

            <section
              id="student-submission"
              tabIndex={-1}
              className="scroll-mt-6 flex flex-col gap-4 pt-6 focus:outline-none"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Turn in your work</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your completed file so your tutor can review it.
                </p>
              </div>
              <StudentSubmitPanel
                assignmentId={id}
                studentId={ctx.userId}
                submissions={submissions}
              />
            </section>
          </div>

          <aside className="flex flex-col divide-y divide-border bg-surface-muted/50 p-6 md:p-8">
            <section className="flex flex-col gap-4 pb-6">
              <h3 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-foreground">
                <span>Tutor feedback</span>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{comments.length}</span>
              </h3>

              <div className="flex flex-col gap-6 mt-2">
                <LiveCommentThread
                  assignmentId={id}
                  initial={comments}
                  participants={participants}
                />
                <CommentComposer assignmentId={id} action={addComment} />
              </div>
            </section>

            <section className="flex flex-col gap-3 pt-6">
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                Keep the momentum going
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ready to push your skills further? Request extra practice to keep improving.
              </p>
              <RequestHomeworkButton
                variant="outline"
                className="mt-2 w-full"
                label="Request extra practice"
              />
            </section>
          </aside>

        </div>
      </main>
    </div>
  );
}
