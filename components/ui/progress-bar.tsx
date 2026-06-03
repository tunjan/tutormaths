import { Progress } from "@/components/ui/progress";

/** Inline progress bar + percentage label, built on the shadcn Progress. */
export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <Progress value={v} className="flex-1" />
      <span className="w-10 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
        {v}%
      </span>
    </div>
  );
}
