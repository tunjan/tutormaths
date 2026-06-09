import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-[10px] border border-border bg-card px-3.5 py-2 text-base transition-colors duration-micro ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-muted-foreground/30 disabled:cursor-not-allowed disabled:opacity-55 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
