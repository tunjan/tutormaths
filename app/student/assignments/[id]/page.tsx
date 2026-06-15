import { notFound } from "next/navigation";
import {
  CalendarClock,
  ClipboardCheck,
  Download,
  FileText,
  Image as ImageIcon,
  MessageSquareText,
  Paperclip,
} from "lucide-react";
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
    <div className="relative left-1/2 mb-12 flex w-[calc(100vw-2rem)] max-w-6xl -translate-x-1/2 flex-col overflow-hidden rounded-[8px] border border-border bg-surface-base text-foreground shadow-[var(--shadow-md)] selection:bg-primary selection:text-primary-foreground sm:w-[calc(100vw-3rem)] animate-rise">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      <main className="flex w-full flex-col">
        <header className="relative overflow-hidden border-b border-border bg-surface-paper">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border-soft)_1px,transparent_0)] [background-size:18px_18px]"
          />
          <div className="relative px-5 pb-6 pt-5 md:px-8 md:pb-8 md:pt-7">
            <BackLink href="/student" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
              Back to dashboard
            </BackLink>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div className="flex min-w-0 flex-col gap-4">
                <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
                <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
                  {a.title}
                </h1>
              </div>

              <dl className="grid gap-3 rounded-[8px] border border-border bg-background/85 p-4 text-sm shadow-[var(--shadow-sm)] backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Due
                    </dt>
                    <dd className="font-medium text-foreground">{formatDateTime(a.due_at)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Format
                    </dt>
                    <dd className="font-medium text-foreground">
                      {category?.name ? `${category.name} · ` : ""}
                      {typeLabel(a.type)}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="mt-6 rounded-[8px] border border-border bg-background/90 px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-sm">
              <AssignmentSteps status={a.review_status} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">

          <div className="flex flex-col gap-8 p-5 md:p-8">
            <section className="flex flex-col gap-5">
              <SectionHeader
                icon={Paperclip}
                title="Problem material"
                description="Open the prompt, solve it on paper or digitally, then upload your finished work."
              />

              <div className="flex flex-col gap-5">
                {a.description && (
                  <div className="rounded-[8px] border border-border bg-background p-5 text-base leading-relaxed text-foreground">
                    {a.description}
                  </div>
                )}

                {a.latex_body && (
                  <div className="rounded-[8px] border border-border bg-surface-muted p-5 md:p-6">
                    <LatexContent source={a.latex_body} />
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {attachments.map((f) => {
                      const isImage = f.mimeType.startsWith("image/");
                      return (
                        <article
                          key={f.id}
                          className="group overflow-hidden rounded-[8px] border border-border bg-background shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong"
                        >
                          {f.url && isImage && (
                            <FilePreview
                              url={f.url}
                              mimeType={f.mimeType}
                              title={f.name}
                              className="rounded-none border-0 bg-surface-muted"
                            />
                          )}
                          {f.url && (
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-4 border-t border-border px-4 py-4 transition-colors hover:bg-surface-muted"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] border border-border bg-surface-muted text-foreground">
                                  {isImage ? (
                                    <ImageIcon className="size-4" strokeWidth={1.8} />
                                  ) : (
                                    <FileText className="size-4" strokeWidth={1.8} />
                                  )}
                                </span>
                                <div className="flex min-w-0 flex-col">
                                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                    {isImage ? "Attached image" : "Attached document"}
                                  </span>
                                  <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                                    {f.name}
                                  </span>
                                </div>
                              </div>
                              <Download
                                className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                                strokeWidth={1.8}
                              />
                            </a>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[8px] border border-border bg-surface-muted/45 p-5">
              <div className="flex flex-col gap-5">
                <SectionHeader
                  icon={ClipboardCheck}
                  title="Work status"
                  description="Set your progress as you work. When it is finished, hand in the file below."
                />
                <CompletionControl
                  assignmentId={id}
                  initial={a.completion_pct}
                  hasSubmissions={submissions.length > 0}
                  uploadTargetId="student-submission"
                />
              </div>
            </section>

            <section
              id="student-submission"
              tabIndex={-1}
              className="scroll-mt-24 flex flex-col gap-4 focus:outline-none"
            >
              <SectionHeader
                icon={FileText}
                title="Turn in your work"
                description="Upload your completed file so your tutor can review it."
              />
              <StudentSubmitPanel
                assignmentId={id}
                studentId={ctx.userId}
                submissions={submissions}
              />
            </section>
          </div>

          <aside className="border-t border-border bg-surface-muted/55 p-5 md:p-8 lg:border-l lg:border-t-0">
            <div className="sticky top-24 flex flex-col gap-6">
              <section className="flex flex-col gap-4">
                <h3 className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                  <span className="flex items-center gap-2">
                    <MessageSquareText className="size-4 text-muted-foreground" strokeWidth={1.8} />
                    Tutor feedback
                  </span>
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{comments.length}</span>
                </h3>

                <div className="flex flex-col gap-5">
                  <LiveCommentThread
                    assignmentId={id}
                    initial={comments}
                    participants={participants}
                  />
                  <CommentComposer assignmentId={id} action={addComment} />
                </div>
              </section>

              <section className="rounded-[8px] border border-border bg-background p-4 shadow-[var(--shadow-sm)]">
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Keep the momentum going
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ready to push your skills further? Request extra practice to keep improving.
                  </p>
                  <RequestHomeworkButton
                    variant="outline"
                    className="w-full"
                    label="Request extra practice"
                  />
                </div>
              </section>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Paperclip;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-border bg-background text-foreground">
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
