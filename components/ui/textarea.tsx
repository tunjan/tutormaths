import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full resize-y rounded-[8px] border border-[#e4dfd4] bg-white px-4 py-2.5 text-sm leading-relaxed transition-all duration-200 placeholder:text-[#b3ac9f] outline-none",
        "focus-visible:border-black focus-visible:ring-[3px] focus-visible:ring-black/5",
        "disabled:cursor-not-allowed disabled:bg-[#f4f1ea] disabled:text-[#b3ac9f]",
        "dark:bg-black dark:text-white dark:border-[#322f29] dark:focus-visible:border-white dark:focus-visible:ring-white/5",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
