import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
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
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import {
  formatDateTime,
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

  const participants: Record<string, Participant> = {
    [ctx.userId]: { name: "You", role: "student" },
    [a.tutor_id]: { name: "Your tutor", role: "tutor" },
  };

  return (
    <div className="w-full bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground mb-12">
      <MarkAssignmentRead assignmentId={id} />
      <MarkAssignmentOpened assignmentId={id} />

      <main className="w-full flex flex-col divide-y divide-border">
        {/* HERO SECTION */}
        <header className="flex flex-col gap-6 pt-0 pb-8 lg:pt-0 lg:pb-10 bg-secondary/10">
          <BackLink href="/student" className="text-[13px] tracking-wide text-muted-foreground hover:text-foreground transition-opacity opacity-80 hover:opacity-100 mt-2">
            Back to dashboard
          </BackLink>
          
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] md:text-[40px] font-semibold text-foreground tracking-tight leading-tight">
              {a.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-[14px] text-muted-foreground">
              <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
              <span>{formatDateTime(a.due_at)}</span>
              <span className="opacity-30">·</span>
              <span>Algebra · Quadratics</span>
              <span className="opacity-30">·</span>
              <span>{typeLabel(a.type)}</span>
            </div>
          </div>
        </header>

        {/* CONTENT & SUBMISSION SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          <div className="flex flex-col divide-y divide-border">
            {/* THE BRIEF */}
            <section className="flex flex-col gap-6 py-8 lg:py-10 lg:pr-10">
              {a.description && (
                <p className="text-[16px] leading-[1.65] text-foreground">
                  {a.description}
                </p>
              )}
              
              {pdfUrl && (
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
                        <span className="text-[13px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                          Attached Document
                        </span>
                        <span className="text-[16px] font-medium text-foreground tracking-tight">
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
            <section className="flex flex-col gap-6 py-8 lg:py-10 lg:pr-10">
              <h2 className="text-[14px] font-semibold text-foreground uppercase tracking-wider">Completion Status</h2>
              <CompletionControl
                assignmentId={id}
                initial={a.completion_pct}
                hasSubmissions={submissions.length > 0}
              />
            </section>

            {/* SUBMISSION */}
            <section className="flex flex-col gap-6 py-8 lg:py-10 lg:pr-10">
              <h2 className="text-[14px] font-semibold text-foreground uppercase tracking-wider">Submission</h2>
              <StudentSubmitPanel
                assignmentId={id}
                studentId={ctx.userId}
                submissions={submissions}
              />
            </section>
          </div>

          {/* EDITORIAL COLUMN: COMMENTS & ACTIONS */}
          <aside className="flex flex-col divide-y divide-border bg-secondary/10">
            <section className="flex flex-col gap-6 py-8 lg:py-10 lg:pl-10">
              <h3 className="text-[14px] font-semibold text-foreground flex items-center justify-between uppercase tracking-wider">
                <span>Comments</span>
                <span className="text-muted-foreground bg-background border border-border/40 px-2 py-0.5 rounded-full text-xs">{comments.length}</span>
              </h3>
              
              <div className="flex flex-col gap-6">
                <LiveCommentThread
                  assignmentId={id}
                  initial={comments}
                  participants={participants}
                />
                <CommentComposer assignmentId={id} action={addComment} />
              </div>
            </section>

            <section className="flex flex-col gap-4 py-8 lg:py-10 lg:pl-10">
              <h3 className="text-[18px] font-medium text-foreground tracking-tight">
                Keep the momentum going
              </h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Ready to push your skills further? Request extra practice to keep improving.
              </p>
              <RequestHomeworkButton
                variant="outline"
                className="w-full mt-2 h-12 rounded-xl text-[15px] font-medium transition-colors"
                label="Request extra practice"
              />
            </section>
          </aside>

        </div>
      </main>
    </div>
  );
}
