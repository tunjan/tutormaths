import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Standard page masthead using the documented type hierarchy. */
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
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="break-words text-caption font-medium tracking-normal text-content-subtle">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "break-words text-balance text-page-title text-text-heading",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[65ch] break-words text-pretty text-body-sm tabular-nums text-content-subtle">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
