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
    return <p className="text-sm text-muted-foreground">No comments yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-5">
      {comments.map((c) => {
        const isTutor = c.authorRole === "tutor";
        return (
          <li key={c.id} className="flex gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                isTutor ? "bg-tutor" : "bg-student",
              )}
              aria-hidden
            >
              {initials(c.authorName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-medium">{c.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  · {formatDate(c.created_at)}
                </span>
              </div>
              <div className="mt-1.5 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                {c.body}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
