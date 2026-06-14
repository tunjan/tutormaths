import { notFound } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { FilePreview } from "@/components/ui/file-preview";
import { LatexContent } from "@/components/ui/latex-content";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentComposer } from "@/components/comment-composer";
import { AssignmentActions } from "@/components/assignment-actions";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { ReviewControls } from "@/components/review-controls";
import { SubmissionList } from "@/components/submission-list";
import { BackLink } from "@/components/ui/back-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import { formatDateTime, typeLabel, mimeFromPath, fileLabel } from "@/lib/format";

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

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  const categoryName =
    categories?.find((c) => c.id === a.category_id)?.name ?? null;

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
    <div className="w-full bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground mb-12 border border-[#e5e5e5] dark:border-[#262626] rounded-[12px] overflow-hidden shadow-[var(--shadow-sm)] animate-rise">
      <MarkAssignmentRead assignmentId={id} />

      <main className="w-full flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#262626]">
        {/* HERO SECTION */}
        <header className="flex flex-col gap-6 pt-6 pb-8 bg-[#fafafa] dark:bg-[#0a0a0a] px-6 md:px-8">
          <BackLink href="/tutor" className="text-xs tracking-wider text-[#737373] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] mt-2 font-mono uppercase">
            Back to dashboard
          </BackLink>

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              {a.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#525252] dark:text-[#a3a3a3]">
              <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <span>{student?.full_name || student?.email}</span>
              </span>
              {categoryName && (
                <>
                  <span className="opacity-30">·</span>
                  <span>{categoryName}</span>
                </>
              )}
              <span className="opacity-30">·</span>
              <span className="capitalize">{typeLabel(a.type)}</span>
              <span className="opacity-30">·</span>
              <span>Due {formatDateTime(a.due_at)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#737373] dark:text-[#a3a3a3] mt-2 font-mono">
              {a.student_opened_at ? (
                <span className="flex items-center gap-1.5 text-success-green dark:text-[#86efac]">
                  <Eye className="size-4 shrink-0" />
                  Opened by student · {formatDateTime(a.student_opened_at)}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <EyeOff className="size-4 shrink-0" />
                  Not opened by student yet
                </span>
              )}
              <span className="opacity-30">·</span>
              <span>
                Reported progress: <span className="font-semibold text-foreground">{a.completion_pct}%</span>
              </span>
            </div>

            <div className="pt-2">
              <AssignmentActions
                id={a.id}
                title={a.title}
                description={a.description}
                type={a.type}
                dueAt={a.due_at}
                studentId={a.student_id}
                categoryId={a.category_id}
                categories={categories ?? []}
                attachments={attachments.map(({ id, name, mimeType }) => ({
                  id,
                  name,
                  mimeType,
                }))}
                latexBody={a.latex_body}
              />
            </div>
          </div>
        </header>

        {/* CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[#e5e5e5] dark:divide-[#262626]">

          {/* LEFT COLUMN: ASSIGNMENT DETAILS & FILE PREVIEW */}
          <div className="flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#262626] p-6 md:p-8">
            {a.description && (
              <section className="flex flex-col gap-4 pb-6">
                <p className="text-base leading-relaxed text-foreground">
                  {a.description}
                </p>
              </section>
            )}

            <section className="flex flex-col gap-6 pt-6">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                {a.latex_body
                  ? "Assignment"
                  : attachments.length === 1
                    ? "Assignment File"
                    : "Assignment Files"}
              </h2>
              {a.latex_body ? (
                <div className="rounded-[12px] border border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#0a0a0a] p-6">
                  <LatexContent source={a.latex_body} />
                </div>
              ) : attachments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {attachments.map((f) => (
                    <div key={f.id} className="flex flex-col gap-2">
                      <div className="rounded-[12px] overflow-hidden border border-[#e5e5e5] dark:border-[#262626]">
                        {f.url ? (
                          <FilePreview
                            url={f.url}
                            mimeType={f.mimeType}
                            title={f.name}
                          />
                        ) : (
                          <div className="p-8 text-center text-[#737373] dark:text-[#a3a3a3] text-sm">
                            Couldn&rsquo;t load this file.
                          </div>
                        )}
                      </div>
                      {f.url && (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "self-start",
                          )}
                        >
                          {f.mimeType.startsWith("image/")
                            ? "View image"
                            : "Open PDF"}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center p-8 bg-card border border-border rounded-[12px] text-[#737373] dark:text-[#a3a3a3]">
                  No files attached.
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: WORK, REVIEW & COMMENTS */}
          <aside className="flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#262626] bg-[#fafafa]/50 dark:bg-[#0a0a0a]/50 p-6 md:p-8">
            {/* SUBMITTED WORK */}
            <section className="flex flex-col gap-4 pb-6">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Submitted work
              </h3>
              {submissions.length === 0 ? (
                <div className="card text-center p-8 bg-card border border-border rounded-[12px] text-[#737373] dark:text-[#a3a3a3] shadow-none">
                  No work submitted yet.
                </div>
              ) : (
                <SubmissionList submissions={submissions} canDelete={false} />
              )}
            </section>

            {/* REVIEW VERDICT */}
            <section className="flex flex-col gap-4 py-6">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Your Review
              </h3>
              <ReviewControls assignmentId={a.id} status={a.review_status} />
            </section>

            {/* COMMENTS */}
            <section className="flex flex-col gap-4 pt-6">
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
          </aside>

        </div>
      </main>
    </div>
  );
}
