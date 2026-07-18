import { cn } from "@/lib/utils";

/** Standard sub-section heading from the documented type scale. */
export function SectionHeading({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-heading-md text-foreground",
        className,
      )}
      {...props}
    />
  );
}
