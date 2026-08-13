import { notFound } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import {
  addComment,
  deleteComment,
  editComment,
} from "@/lib/actions/comments";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import { formatDateTime, typeLabel, mimeFromPath, fileLabel } from "@/lib/format";

export default async function TutorAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireTutor();
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
    <div className="mb-12 flex w-full flex-col gap-4 text-foreground animate-rise">
      <MarkAssignmentRead assignmentId={id} />

      <main className="flex w-full flex-col gap-4">
        {/* HERO SECTION */}
        <header className="flex flex-col gap-6 rounded-md border border-border bg-card p-6">
          <BackLink href="/tutor">
            Back to dashboard
          </BackLink>

          <div className="flex flex-col gap-4">
            <h1 className="text-h1 text-foreground">
              {a.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-body text-muted-foreground">
              <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
              <span className="flex items-center gap-2 font-semibold text-foreground">
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

            {/* At-a-glance student signal — the tutor's key read on this assignment */}
            <div className="mt-1 flex flex-wrap items-stretch gap-3">
              <div className="flex items-center gap-2 rounded-md bg-bg-muted px-4 py-3">
                {a.student_opened_at ? (
                  <Eye className="size-4 shrink-0 text-content-success" />
                ) : (
                  <EyeOff className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Student
                  </span>
                  <span className="text-label text-foreground">
                    {a.student_opened_at
                      ? `Opened ${formatDateTime(a.student_opened_at)}`
                      : "Not opened yet"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-md bg-bg-muted px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Reported progress
                  </span>
                  <span className="text-label tabular-nums text-foreground">
                    {a.completion_pct}%
                  </span>
                </div>
              </div>
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">

          {/* LEFT COLUMN: ASSIGNMENT DETAILS & FILE PREVIEW */}
          <div className="flex flex-col divide-y divide-border-subtle rounded-md border border-border bg-card p-6">
            {a.description && (
              <section className="flex flex-col gap-4 pb-6">
                <p className="text-body-lg text-foreground">
                  {a.description}
                </p>
              </section>
            )}

            <section className="flex flex-col gap-6 pt-6">
              <h2 className="text-h4 text-foreground">
                {a.latex_body
                  ? "Assignment"
                  : attachments.length === 1
                    ? "Assignment File"
                    : "Assignment Files"}
              </h2>
              {a.latex_body ? (
                <div className="rounded-md bg-surface-inset p-6">
                  <LatexContent source={a.latex_body} />
                </div>
              ) : attachments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {attachments.map((f) => (
                    <div key={f.id} className="flex flex-col gap-2">
                      <div className="overflow-hidden rounded-md">
                        {f.url ? (
                          <FilePreview
                            url={f.url}
                            mimeType={f.mimeType}
                            title={f.name}
                          />
                        ) : (
                          <div className="p-8 text-center text-body text-muted-foreground">
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
                            buttonVariants({ variant: "ghost", size: "default" }),
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
                <div className="rounded-md bg-bg-muted p-8 text-center text-body text-muted-foreground">
                  No files attached.
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: WORK, REVIEW & COMMENTS */}
          <aside className="flex flex-col divide-y divide-border-subtle rounded-md border border-border bg-card p-6">
            {/* SUBMITTED WORK */}
            <section className="flex flex-col gap-4 pb-6">
              <h3 className="text-h4 text-foreground">
                Submitted work
              </h3>
              {submissions.length === 0 ? (
                <div className="rounded-md bg-bg-muted p-8 text-center text-body text-muted-foreground">
                  No work submitted yet.
                </div>
              ) : (
                <SubmissionList submissions={submissions} canDelete={false} />
              )}
            </section>

            {/* REVIEW VERDICT */}
            <section className="flex flex-col gap-4 py-6">
              <h3 className="text-h4 text-foreground">
                Your review
              </h3>
              <ReviewControls assignmentId={a.id} status={a.review_status} />
            </section>

            {/* COMMENTS */}
            <section className="flex flex-col gap-4 pt-6">
              <h3 className="flex items-center justify-between text-h4 text-foreground">
                <span>Comments</span>
                <Badge variant="secondary" className="tabular-nums">
                  {comments.length}
                </Badge>
              </h3>

              <div className="flex flex-col gap-6 mt-2">
                <LiveCommentThread
                  assignmentId={id}
                  initial={comments}
                  participants={participants}
                  currentUserId={ctx.userId}
                  editAction={editComment}
                  deleteAction={deleteComment}
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
