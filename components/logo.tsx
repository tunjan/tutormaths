import { cn } from "@/lib/utils";

/**
 * Brand mark: a small warm-gradient dot — the single confident accent flourish.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "size-2.5 rounded-full select-none shrink-0 block",
        className,
      )}
      style={{ backgroundImage: "var(--gradient-brand)" }}
      aria-hidden="true"
    />
  );
}
