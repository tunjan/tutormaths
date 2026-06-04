import { cn } from "@/lib/utils";

/** Overline-style section label — reads clearly as a structural divider. */
export function SectionHeading({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-xs font-semibold tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}
