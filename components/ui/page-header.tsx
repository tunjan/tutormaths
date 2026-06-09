import type { ReactNode } from "react";

/**
 * The standard page masthead: a small mono "eyebrow", a serif display title,
 * an optional description, and right-aligned actions. Matches the scholarly
 * graph-paper language used across the app.
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
    <div className="mb-20 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-4">{actions}</div>
      )}
    </div>
  );
}
