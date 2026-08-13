"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-label select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-content-muted peer-disabled:cursor-not-allowed peer-disabled:text-content-muted",
        className
      )}
      {...props}
    />
  )
}

export { Label }
