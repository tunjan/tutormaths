import { notFound } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { requireTutor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signedUrl } from "@/lib/storage";
import { loadComments } from "@/lib/queries";
import { addComment } from "@/lib/actions/comments";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { FilePreview } from "@/components/ui/file-preview";
import { LiveCommentThread, type Participant } from "@/components/live-comment-thread";
import { CommentForm } from "@/components/comment-form";
import { AssignmentActions } from "@/components/assignment-actions";
import { MarkAssignmentRead } from "@/components/mark-assignment-read";
import { ReviewControls } from "@/components/review-controls";
import { SubmissionList } from "@/components/submission-list";
import { BackLink } from "@/components/ui/back-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BUCKET_ASSIGNMENTS, BUCKET_SUBMISSIONS } from "@/lib/constants";
import { formatDateTime, typeLabel } from "@/lib/format";

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

  const pdfUrl = await signedUrl(BUCKET_ASSIGNMENTS, a.file_path);

  /** Infer MIME from the stored file extension so FilePreview picks the right renderer. */
  const ext = a.file_path.split(".").pop()?.toLowerCase();
  const fileMime =
    ext === "png" ? "image/png"
    : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : "application/pdf";
  const isImage = fileMime.startsWith("image/");

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
    <div className="w-full bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground mb-12">
      <MarkAssignmentRead assignmentId={id} />

      <main className="w-full flex flex-col divide-y divide-border">
        {/* HERO SECTION */}
        <header className="flex flex-col gap-6 pt-0 pb-8 lg:pt-0 lg:pb-10 bg-secondary/10 px-4 md:px-8 lg:px-12">
          <BackLink href="/tutor" className="text-[13px] tracking-wide text-muted-foreground hover:text-foreground transition-opacity opacity-80 hover:opacity-100 mt-2">
            Back to dashboard
          </BackLink>
          
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] md:text-[40px] font-semibold text-foreground tracking-tight leading-tight">
              {a.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-[14px] text-muted-foreground">
              <AssignmentStatusBadge reviewStatus={a.review_status} dueAt={a.due_at} />
              <span className="flex items-center gap-1.5 font-medium text-foreground">
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

            <div className="flex flex-wrap items-center gap-6 text-[13px] text-muted-foreground mt-2">
              {a.student_opened_at ? (
                <span className="flex items-center gap-1.5 text-success">
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
                Reported progress: <span className="font-medium text-foreground">{a.completion_pct}%</span>
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
              />
            </div>
          </div>
        </header>

        {/* CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* LEFT COLUMN: ASSIGNMENT DETAILS & FILE PREVIEW */}
          <div className="flex flex-col divide-y divide-border">
            {a.description && (
              <section className="flex flex-col gap-6 py-8 lg:py-10 px-4 md:px-8 lg:px-12">
                <p className="text-[16px] leading-[1.65] text-foreground">
                  {a.description}
                </p>
              </section>
            )}

            <section className="flex flex-col gap-6 py-8 lg:py-10 px-4 md:px-8 lg:px-12">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[14px] font-semibold text-foreground uppercase tracking-wider">Assignment File</h2>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    {isImage ? "View image" : "Open PDF"}
                  </a>
                )}
              </div>
              {pdfUrl ? (
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <FilePreview url={pdfUrl} mimeType={fileMime} title={a.title} />
                </div>
              ) : (
                <div className="py-10 text-center text-[15px] text-muted-foreground bg-secondary/10 rounded-xl">
                  The assignment file could not be loaded.
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: WORK, REVIEW & COMMENTS */}
          <aside className="flex flex-col divide-y divide-border bg-secondary/5">
            {/* SUBMITTED WORK */}
            <section className="flex flex-col gap-6 py-8 lg:py-10 px-4 md:px-8 lg:px-12">
              <h3 className="text-[14px] font-semibold text-foreground uppercase tracking-wider">
                Submitted work
              </h3>
              {submissions.length === 0 ? (
                <div className="py-12 text-center text-[15px] text-muted-foreground bg-secondary/20 rounded-xl">
                  No work submitted yet.
                </div>
              ) : (
                <SubmissionList submissions={submissions} canDelete={false} />
              )}
            </section>

            {/* REVIEW VERDICT */}
            <section className="flex flex-col gap-6 py-8 lg:py-10 px-4 md:px-8 lg:px-12">
              <h3 className="text-[14px] font-semibold text-foreground uppercase tracking-wider">
                Your Review
              </h3>
              <ReviewControls assignmentId={a.id} status={a.review_status} />
            </section>

            {/* COMMENTS */}
            <section className="flex flex-col gap-6 py-8 lg:py-10 px-4 md:px-8 lg:px-12">
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
                <CommentForm assignmentId={id} action={addComment} />
              </div>
            </section>
          </aside>

        </div>
      </main>
    </div>
  );
}
