"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/**
 * A small two-or-more-way segmented toggle (e.g. "Upload files" / "Write
 * LaTeX"). Tokenized to the design system so it themes correctly in dark mode.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex self-start rounded-lg border border-border-subtle bg-bg-subtle p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onValueChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-card text-content-emphasis shadow-[var(--shadow-md)]"
                : "text-content-subtle hover:text-content-emphasis",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
