import { cn } from "@/lib/utils";

/** Compact math symbol brand mark for the app shell. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 select-none place-items-center font-heading text-title-lg leading-none text-content-emphasis",
        className,
      )}
      translate="no"
      aria-hidden="true"
    >
      ∑
    </span>
  );
}
