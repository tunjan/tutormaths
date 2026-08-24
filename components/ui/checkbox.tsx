"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { CheckIcon, MinusIcon } from "lucide-react"

function Checkbox({
  className,
  indeterminate,
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer relative flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm text-primary-foreground outline-none after:absolute after:-inset-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      indeterminate={indeterminate}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none grid size-[18px] place-content-center rounded-sm border border-border-default bg-card text-current shadow-xs transition-[background-color,border-color,color,box-shadow] duration-fast group-hover:border-border-emphasis group-focus-visible:border-accent-ink group-data-checked:border-primary group-data-checked:bg-primary group-data-indeterminate:border-primary group-data-indeterminate:bg-primary"
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center transition-none [&>svg]:size-3.5"
        >
          {indeterminate ? <MinusIcon /> : <CheckIcon />}
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
