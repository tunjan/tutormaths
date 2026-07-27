"use client";

import { cn } from "@/lib/utils";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

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
    <ToggleGroup
      value={[value]}
      onValueChange={(nextValues) => {
        const nextValue = nextValues.at(-1) as T | undefined;
        if (nextValue) onValueChange(nextValue);
      }}
      className={cn(
        "self-start inline-flex p-1 rounded-md bg-muted border border-border/60 gap-1",
        className,
      )}
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className="rounded-sm px-3 py-1 text-xs font-medium transition-all text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-xs"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
