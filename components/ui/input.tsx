import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-border-subtle bg-card px-3 py-2 text-sm text-content-emphasis transition-all duration-150 placeholder:text-content-muted outline-none",
        "focus-visible:border-border-emphasis focus-visible:ring-4 focus-visible:ring-border-subtle",
        "disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-content-muted",
        className
      )}
      {...props}
    />
  )
}

export { Input }
