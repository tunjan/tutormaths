import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard page masthead matching the premium design system.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-10 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-eyebrow text-text-subtle">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "text-heading-lg text-text-heading",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-body-sm text-content-subtle">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
