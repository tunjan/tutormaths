"use client";

import { Input } from "@/components/ui/input";

/**
 * Native date-time input. The browser supplies locale-aware formatting, mobile
 * pickers, and complete keyboard behavior while preserving the local
 * "YYYY-MM-DDTHH:mm" value expected by existing server actions.
 */
export function DateTimePicker({
  name,
  defaultValue = "",
  id,
  invalid,
  "aria-describedby": ariaDescribedBy,
  onChange,
  disabled = false,
}: {
  name: string;
  defaultValue?: string;
  id?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Input
      id={id}
      name={name}
      type="datetime-local"
      step={300}
      defaultValue={defaultValue}
      aria-invalid={invalid}
      aria-describedby={ariaDescribedBy}
      autoComplete="off"
      disabled={disabled}
      className="font-metric"
      onChange={(event) => onChange?.(event.currentTarget.value)}
    />
  );
}
