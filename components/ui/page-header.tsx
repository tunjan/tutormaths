import type { ReactNode } from "react";

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
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-text-heading">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
