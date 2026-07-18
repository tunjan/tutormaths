import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-sm border border-border bg-card px-3 py-2 text-body text-content-emphasis transition-[border-color,box-shadow] duration-fast ease-[var(--ease-standard)] placeholder:text-content-muted outline-none",
        "focus-visible:border-accent-ink",
        "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-bg-subtle disabled:text-content-muted",
        className
      )}
      {...props}
    />
  )
}

export { Input }
