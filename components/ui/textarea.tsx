import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full resize-y rounded-md border border-border-subtle bg-card px-3 py-2.5 text-sm leading-relaxed text-content-emphasis transition-all duration-150 placeholder:text-content-muted outline-none",
        "focus-visible:border-border-emphasis focus-visible:ring-4 focus-visible:ring-border-subtle",
        "disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-content-muted",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
