import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";
import { type ReviewStatus, relativeTime, typeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface MisoAssignmentCardProps {
  href: string;
  title: string;
  type: "problem_set" | "reading_notes";
  dueAt: string;
  pct: number;
  reviewStatus: ReviewStatus;
  className?: string;
  student?: string;
}

export function MisoAssignmentGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-12 gap-3 md:gap-4", className)}>
      {children}
    </div>
  );
}

export function MisoAssignmentCard({
  href,
  title,
  type,
  dueAt,
  pct,
  reviewStatus,
  className,
  student,
}: MisoAssignmentCardProps) {
  const meta = [student, typeLabel(type), `DUE ${relativeTime(dueAt)}`].filter(Boolean).join(" · ");
  
  return (
    <Link
      href={href}
      className={cn(
        "col-span-12 xl:col-span-6 flex items-center justify-between bg-card border border-border rounded-2xl p-6 group transition-colors duration-150 ease-out hover:bg-accent/50",
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0 pr-4">
        <div className="min-w-0">
          <h3 className="text-foreground text-lg md:text-xl font-bold tracking-[-0.02em] leading-tight mb-1.5 truncate">
            {title}
          </h3>
          <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground flex items-center gap-2 truncate">
            {reviewStatus === "needs_work" && (
              <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-widest shrink-0">
                NEEDS WORK
              </span>
            )}
            <span className="truncate">{meta}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden sm:block text-right">
          <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-0.5">
            Progress
          </div>
          <div className="font-mono text-[12px] tracking-[0.1em] uppercase text-foreground">
            {pct}%
          </div>
        </div>
        <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/90">
           <ArrowUpRight className="size-4" />
        </div>
      </div>
    </Link>
  );
}
