import { cn } from "@/lib/utils";

/**
 * Brand mark: a near-black ink tile carrying a serif "x²" — a small, recognisable
 * maths identity. The glyph is cut from the page background so the tile inverts
 * cleanly between light and dark themes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-xl bg-foreground text-background shadow-calm",
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-display text-base leading-none">
        x<sup className="text-[0.6em]">2</sup>
      </span>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 select-none", className)}>
      <span className="font-display text-xl tracking-tight">
        Maths<span className="text-primary">Tasks</span>
      </span>
    </span>
  );
}
