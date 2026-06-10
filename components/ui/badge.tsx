import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-[20px] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.05em] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default: "bg-[#000000] text-[#ffffff] dark:bg-[#ffffff] dark:text-[#000000] [a]:hover:bg-primary/80",
        secondary:
          "bg-[#fafafa] text-[#0a0a0a] border border-[#e5e5e5] dark:bg-[#0a0a0a] dark:text-[#fafafa] dark:border-[#262626] [a]:hover:bg-secondary/80",
        destructive:
          "bg-[#fef2f2] text-[#991b1b] dark:bg-[#991b1b]/10 dark:text-[#fca5a5] [a]:hover:bg-destructive/20",
        outline:
          "border border-[#e5e5e5] bg-transparent text-[#525252] dark:border-[#262626] dark:text-[#a3a3a3] [a]:hover:bg-muted",
        ghost:
          "hover:bg-[#f5f5f5] text-[#737373] hover:text-[#0a0a0a] dark:hover:bg-[#171717] dark:hover:text-[#fafafa]",
        link: "text-[#3b82f6] underline-offset-4 hover:underline",
        accent:
          "bg-[#f3f0ff] text-[#7c3aed] dark:bg-[#7c3aed]/10 dark:text-[#a78bfa]",
        "accent-alt":
          "bg-[#eff6ff] text-[#1e40af] dark:bg-[#1e40af]/10 dark:text-[#93c5fd]",
        success: "bg-[#f0fdf4] text-[#166534] dark:bg-[#166534]/15 dark:text-[#86efac]",
        warning: "bg-[#fffbeb] text-[#92400e] dark:bg-[#92400e]/15 dark:text-[#fcd34d]",
        info: "bg-[#eff6ff] text-[#1e40af] dark:bg-[#1e40af]/15 dark:text-[#93c5fd]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
