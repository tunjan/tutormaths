import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CommentView {
  id: string;
  body: string;
  created_at: string;
  authorId: string;
  authorName: string;
  authorRole: string;
}

/** Two-letter monogram for the avatar, e.g. "Eleanor Vance" → "EV". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CommentThread({ comments }: { comments: CommentView[] }) {
  if (comments.length === 0) {
    return (
      <div className="rounded-panel border border-dashed border-border-soft bg-background/70 px-4 py-5">
        <p className="text-sm text-muted-foreground">No tutor feedback yet.</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {comments.map((c) => {
        const isTutor = c.authorRole === "tutor";
        return (
          <li
            key={c.id}
            className={cn(
              "flex gap-3 rounded-panel border p-4",
              isTutor
                ? "border-status-review-border bg-status-review-bg/70"
                : "border-border-soft bg-background/70",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-panel border text-[12px] font-medium",
                isTutor
                  ? "border-status-review-border bg-background text-status-review"
                  : "border-border-soft bg-surface-paper text-foreground",
              )}
              aria-hidden
            >
              {initials(c.authorName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[14px] font-medium text-foreground">{c.authorName}</span>
                {isTutor && (
                  <span className="rounded-panel bg-background px-2 py-0.5 text-[11px] font-medium text-status-review">
                    Tutor
                  </span>
                )}
                <span className="text-[12px] text-muted-foreground">
                  {formatDate(c.created_at)}
                </span>
              </div>
              <div className="mt-1 text-[14px] leading-[1.6] whitespace-pre-wrap text-foreground">
                {c.body}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
