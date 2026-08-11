"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
<<<<<<< Updated upstream
import { IconCheck } from "@tabler/icons-react"
=======
import { CheckIcon, MinusIcon } from "lucide-react"
>>>>>>> Stashed changes

function Checkbox({
  className,
  indeterminate,
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
<<<<<<< Updated upstream
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-input shadow-xs transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-1.5 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
=======
        "peer relative flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm border border-[var(--color-faint)] bg-[var(--color-canvas-elevated)] shadow-xs transition-[background-color,border-color,color,box-shadow] duration-fast outline-none after:absolute after:-inset-3",
        "hover:border-border-emphasis focus-visible:border-accent-ink focus-visible:shadow-[var(--focus-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
>>>>>>> Stashed changes
        className
      )}
      indeterminate={indeterminate}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
<<<<<<< Updated upstream
        <IconCheck />
=======
        {indeterminate ? <MinusIcon aria-hidden /> : <CheckIcon aria-hidden />}
>>>>>>> Stashed changes
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
