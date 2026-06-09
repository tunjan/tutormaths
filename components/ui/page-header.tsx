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
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-3xl sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}
