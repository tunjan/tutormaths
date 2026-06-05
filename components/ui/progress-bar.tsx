import { Progress } from "@/components/ui/progress";

/** Inline progress bar + percentage label, built on the shadcn Progress. */
export function ProgressBar({ value, label = "Progress" }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <Progress value={v} className="flex-1" aria-label={label} />
      <span className="w-10 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
        {v}%
      </span>
    </div>
  );
}
