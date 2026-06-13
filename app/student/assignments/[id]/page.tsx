import { notFound } from "next/navigation";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
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
} from "@/lib/format";

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

  const pdfUrl = a.file_path
    ? await signedUrl(BUCKET_ASSIGNMENTS, a.file_path)
    : null;

  const ext = a.file_path?.split(".").pop()?.toLowerCase();
  const fileMime =
    ext === "png" ? "image/png"
    : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : "application/pdf";
  const isImage = fileMime.startsWith("image/");

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
    <div className="w-full bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground mb-12 border border-[#e5e5e5] dark:border-[#262626] rounded-[12px] overflow-hidden shadow-[var(--shadow-sm)] animate-rise">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      <main className="w-full flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#262626]">
        {/* HERO SECTION */}
        <header className="flex flex-col gap-6 pt-6 pb-8 bg-[#fafafa] dark:bg-[#0a0a0a] px-6 md:px-8">
          <BackLink href="/student" className="text-xs tracking-wider text-[#737373] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] mt-2 font-mono uppercase">
            Back to dashboard
          </BackLink>
          
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              {a.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#525252] dark:text-[#a3a3a3]">
              <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
              <span>{formatDateTime(a.due_at)}</span>
              {category?.name && (
                <>
                  <span className="opacity-30">·</span>
                  <span>{category.name}</span>
                </>
              )}
              <span className="opacity-30">·</span>
              <span>{typeLabel(a.type)}</span>
            </div>
          </div>
        </header>

        {/* CONTENT & SUBMISSION SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] divide-y lg:divide-y-0 lg:divide-x divide-[#e5e5e5] dark:divide-[#262626]">
          
          <div className="flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#262626] p-6 md:p-8">
            {/* THE BRIEF */}
            <section className="flex flex-col gap-6 pb-6">
              {a.description && (
                <p className="text-base leading-relaxed text-foreground">
                  {a.description}
                </p>
              )}

              {a.latex_body && (
                <div className="rounded-[12px] border border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#0a0a0a] p-6">
                  <LatexContent source={a.latex_body} />
                </div>
              )}

              {pdfUrl && isImage ? (
                <div className="pt-2 flex flex-col gap-3">
                  <div className="rounded-[12px] overflow-hidden border border-[#e5e5e5] dark:border-[#262626]">
                    <FilePreview url={pdfUrl} mimeType={fileMime} title={a.title} />
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between transition-opacity duration-200 hover:opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <ImageIcon className="size-5 text-foreground" strokeWidth={2} />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] dark:text-[#a3a3a3] mb-1">
                          Attached Image
                        </span>
                        <span className="text-sm font-semibold text-foreground tracking-tight">
                          {fileLabel(a.file_path)}
                        </span>
                      </div>
                    </div>
                    <Download className="size-5 text-muted-foreground transition-colors" strokeWidth={2} />
                  </a>
                </div>
              ) : pdfUrl && (
                <div className="pt-2">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between transition-opacity duration-200 hover:opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="size-5 text-foreground" strokeWidth={2} />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] dark:text-[#a3a3a3] mb-1">
                          Attached Document
                        </span>
                        <span className="text-sm font-semibold text-foreground tracking-tight">
                          {fileLabel(a.file_path)}
                        </span>
                      </div>
                    </div>
                    <Download className="size-5 text-muted-foreground transition-colors" strokeWidth={2} />
                  </a>
                </div>
              )}
            </section>

            {/* PROGRESS */}
            <section className="flex flex-col gap-4 py-6">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Completion Status</h2>
              <CompletionControl
                assignmentId={id}
                initial={a.completion_pct}
                hasSubmissions={submissions.length > 0}
              />
            </section>

            {/* SUBMISSION */}
            <section className="flex flex-col gap-4 pt-6">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Submission</h2>
              <StudentSubmitPanel
                assignmentId={id}
                studentId={ctx.userId}
                submissions={submissions}
              />
            </section>
          </div>

          {/* EDITORIAL COLUMN: COMMENTS & ACTIONS */}
          <aside className="flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#262626] bg-[#fafafa]/50 dark:bg-[#0a0a0a]/50 p-6 md:p-8">
            <section className="flex flex-col gap-4 pb-6">
              <h3 className="text-xs font-semibold text-foreground flex items-center justify-between uppercase tracking-wider">
                <span>Comments</span>
                <span className="text-[#737373] dark:text-[#a3a3a3] bg-card border border-[#e5e5e5] dark:border-[#262626] px-2 py-0.5 rounded-full text-[11px] font-mono">{comments.length}</span>
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
              <p className="text-sm leading-relaxed text-[#525252] dark:text-[#a3a3a3]">
                Ready to push your skills further? Request extra practice to keep improving.
              </p>
              <RequestHomeworkButton
                variant="outline"
                className="w-full mt-2 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
                label="Request extra practice"
              />
            </section>
          </aside>

        </div>
      </main>
    </div>
  );
}
