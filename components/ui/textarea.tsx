import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full resize-y rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-base leading-relaxed transition-colors placeholder:text-muted-foreground focus-visible:border-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-muted-foreground/30 disabled:cursor-not-allowed disabled:opacity-55 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
