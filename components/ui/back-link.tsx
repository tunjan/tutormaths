import { Link } from "next-view-transitions";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Quiet secondary navigation for detail and list pages. */
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
        "inline-flex min-h-9 w-fit items-center gap-2 rounded-full px-3 py-2 text-body text-muted-foreground transition-colors duration-fast hover:bg-bg-muted hover:text-foreground focus-visible:outline-none",
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </Link>
  );
}
