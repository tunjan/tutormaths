import { cn } from "@/lib/utils";

/** Compact probability-style brand mark for the app shell. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 select-none place-items-center font-heading text-heading-md leading-none text-content-emphasis",
        className,
      )}
      aria-hidden="true"
    >∑</span>
  );
}
