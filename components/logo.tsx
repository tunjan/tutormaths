import { cn } from "@/lib/utils";

/**
 * Brand mark: a monochrome near-black tile with a summation glyph (Σ) — a small,
 * recognisable maths identity that works as a favicon and inline wordmark.
 * The tile inherits the foreground ink and the glyph is cut from the page
 * background, so it inverts cleanly between light and dark themes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-7 text-foreground", className)}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M21 9H11l5 7-5 7h10"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-8" />
      <span className="hidden sm:inline-block font-heading text-lg font-semibold tracking-tight">
        Maths Tasks
      </span>
    </span>
  );
}
