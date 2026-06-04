import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

export interface CommentView {
  id: string;
  body: string;
  created_at: string;
  authorId: string;
  authorName: string;
  authorRole: string;
}

export function CommentThread({ comments }: { comments: CommentView[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No comments yet.</p>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {comments.map((c) => (
        <li
          key={c.id}
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              {c.authorName}
              {c.authorRole === "tutor" && (
                <Badge variant="secondary" className="font-normal">
                  Tutor
                </Badge>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(c.created_at)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}
