import { Link } from "next-view-transitions";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Back affordance for detail and list pages. The student area has no nav tabs,
 * so on those pages this is the only way back — it needs to read as a
 * deliberate control, not orphaned muted text floating above the title.
 *
 * A hairline pill gives it presence; on hover it fills with the gray "wash"
 * and the chevron nudges left, echoing the motion language of the tutor nav.
 */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex w-fit items-center gap-1 rounded-full py-1 pr-3.5 pl-2 text-sm text-muted-foreground ring-1 ring-border ring-inset transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      <ChevronLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
      {children}
    </Link>
  );
}
