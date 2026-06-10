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
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0a0a] dark:text-[#fafafa]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
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
