import { cn } from "@/lib/utils";

/**
 * Brand mark: a simple, minimal monochromatic dot that adapts to light/dark themes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "size-2.5 rounded-full bg-foreground select-none shrink-0 block",
        className,
      )}
      aria-hidden="true"
    />
  );
}
