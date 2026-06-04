import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DueBadge } from "@/components/ui/due-badge";
import { Card, CardContent } from "@/components/ui/card";
import { dueDescription, dueState, formatDateTime, typeLabel } from "@/lib/format";

export interface AssignmentRowProps {
  href: string;
  title: string;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  pct: number;
  /** Shown only on the tutor's multi-student lists. */
  student?: string;
}

export function AssignmentRow({
  href,
  title,
  type,
  dueAt,
  pct,
  student,
}: AssignmentRowProps) {
  const state = dueState(dueAt, pct);
  const meta = [student, typeLabel(type), dueDescription(dueAt, state)]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link href={href} className="group block">
        <Card className="gap-4 py-5 transition-all group-hover:ring-primary/40">
          <CardContent className="flex flex-col gap-4 px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium">{title}</div>
                <div
                  className="mt-0.5 text-sm text-muted-foreground"
                  title={formatDateTime(dueAt)}
                >
                  {meta}
                </div>
              </div>
              <DueBadge state={state} />
            </div>
            {/* A bar adds signal only mid-progress; 0% and 100% are noise. */}
            {pct > 0 && pct < 100 && <ProgressBar value={pct} />}
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
