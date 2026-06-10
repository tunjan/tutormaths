"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[#d4d4d4] transition-all outline-none cursor-pointer",
        "focus-visible:border-black focus-visible:ring-[3px] focus-visible:ring-black/5",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-black data-checked:bg-black data-checked:text-white",
        "dark:border-[#262626] dark:focus-visible:border-white dark:focus-visible:ring-white/5",
        "dark:data-checked:border-white dark:data-checked:bg-white dark:data-checked:text-black",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
