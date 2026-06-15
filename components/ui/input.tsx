import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-[8px] border border-border-strong bg-surface-raised text-text-heading px-4 py-2 text-sm transition-all duration-200 placeholder:text-text-subtle outline-none",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/5",
        "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-subtle",
        className
      )}
      {...props}
    />
  )
}

export { Input }
