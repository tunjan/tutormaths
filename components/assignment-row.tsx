import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AssignmentStatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ReviewStatus,
  formatDateTime,
  relativeTime,
  typeLabel,
} from "@/lib/format";

export interface AssignmentRowProps {
  href: string;
  title: string;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  pct: number;
  reviewStatus: ReviewStatus;
  /** Shown only on the tutor's multi-student lists. */
  student?: string;
  /** True when there is unread activity (comment/submission/review) for the viewer. */
  unread?: boolean;
}

export function AssignmentRow({
  href,
  title,
  type,
  dueAt,
  pct,
  reviewStatus,
  student,
  unread,
}: AssignmentRowProps) {
  const dueText =
    reviewStatus === "approved" ? "completed" : `due ${relativeTime(dueAt)}`;
  const meta = [student, typeLabel(type), dueText].filter(Boolean).join(" · ");
  const showBar = pct > 0 && pct < 100 && reviewStatus !== "approved";

  return (
    <li>
      <Link href={href} className="group block">
        <Card className="gap-4 py-5 transition-all group-hover:ring-primary/40">
          <CardContent className="flex flex-col gap-4 px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium">
                  {unread && (
                    <span
                      className="size-2 shrink-0 rounded-full bg-primary"
                      aria-label="Unread activity"
                    />
                  )}
                  <span className="truncate">{title}</span>
                </div>
                <div
                  className="mt-0.5 text-sm text-muted-foreground"
                  title={formatDateTime(dueAt)}
                >
                  {meta}
                </div>
              </div>
              <AssignmentStatusBadge reviewStatus={reviewStatus} dueAt={dueAt} />
            </div>
            {showBar && <ProgressBar value={pct} />}
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
