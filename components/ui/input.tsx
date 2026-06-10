import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-[8px] border border-[#e5e5e5] bg-white text-[#0a0a0a] px-4 py-2 text-sm transition-all duration-200 placeholder:text-[#a3a3a3] outline-none",
        "focus-visible:border-black focus-visible:ring-[3px] focus-visible:ring-black/5",
        "disabled:cursor-not-allowed disabled:bg-[#fafafa] disabled:text-[#a3a3a3]",
        "dark:bg-black dark:text-white dark:border-[#262626] dark:focus-visible:border-white dark:focus-visible:ring-white/5",
        className
      )}
      {...props}
    />
  )
}

export { Input }
