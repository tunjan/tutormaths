import { cn } from "@/lib/utils";

/** Compact monochrome brand mark for the app shell. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block size-2.5 shrink-0 select-none rounded-full bg-content-emphasis",
        className,
      )}
      aria-hidden="true"
    />
  );
}
