import { cn } from "@/lib/utils";

/**
 * Brand mark: a rounded teal tile with a summation glyph (Σ) — a small,
 * recognisable maths identity that works as a favicon and inline wordmark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
      <path
        d="M21 9H11l5 7-5 7h10"
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-semibold tracking-tight">Maths Tasks</span>
    </span>
  );
}
