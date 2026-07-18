import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full resize-y rounded-sm border border-border bg-card px-3 py-2 text-body text-content-emphasis transition-[border-color,box-shadow] duration-fast ease-[var(--ease-standard)] placeholder:text-content-muted outline-none",
        "focus-visible:border-accent-ink",
        "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-bg-subtle disabled:text-content-muted",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
