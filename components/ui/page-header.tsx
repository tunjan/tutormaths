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
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-border-soft pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium text-text-subtle">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight text-text-heading",
            eyebrow && "mt-1.5",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
