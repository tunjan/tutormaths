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
      <div className="rounded-[8px] border border-dashed border-border bg-background px-3 py-4">
        <p className="text-sm font-medium text-foreground">No tutor feedback yet</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Comments from you and your tutor will appear here.
        </p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-5">
      {comments.map((c) => {
        const isTutor = c.authorRole === "tutor";
        return (
          <li
            key={c.id}
            className={cn(
              "flex gap-3 rounded-[8px] p-3",
              isTutor
                ? "border border-status-review-border bg-status-review-bg"
                : "border border-transparent bg-background/60",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-medium",
                isTutor
                  ? "bg-background text-status-review"
                  : "bg-secondary text-foreground",
              )}
              aria-hidden
            >
              {initials(c.authorName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <span className="text-[14px] font-medium text-foreground">{c.authorName}</span>
                {isTutor && (
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-status-review">
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
