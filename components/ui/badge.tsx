import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-[20px] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.05em] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default: "bg-[#1a1a1a] text-[#faf8f3] dark:bg-[#faf8f3] dark:text-[#1a1a1a] [a]:hover:bg-primary/80",
        secondary:
          "bg-[#f4f1ea] text-[#1a1a1a] border border-[#e4dfd4] dark:bg-[#1a1a1a] dark:text-[#f4f1ea] dark:border-[#322f29] [a]:hover:bg-secondary/80",
        destructive:
          "bg-[#f6ece9] text-[#8a2e22] dark:bg-[#8a2e22]/10 dark:text-[#cf8a7e] [a]:hover:bg-destructive/20",
        outline:
          "border border-[#e4dfd4] bg-transparent text-[#5b564d] dark:border-[#322f29] dark:text-[#b3ac9f] [a]:hover:bg-muted",
        ghost:
          "hover:bg-[#efebe1] text-[#8a8478] hover:text-[#1a1a1a] dark:hover:bg-[#1d1b16] dark:hover:text-[#f4f1ea]",
        link: "text-[#e75d2d] underline-offset-4 hover:underline",
        accent:
          "bg-[#fbece4] text-[#e75d2d] dark:bg-[#e75d2d]/10 dark:text-[#f0824a]",
        "accent-alt":
          "bg-[#fbece4] text-[#cf4d22] dark:bg-[#cf4d22]/10 dark:text-[#f0824a]",
        success: "bg-[#eef3ee] text-[#3a6347] dark:bg-[#3a6347]/15 dark:text-[#9bbca5]",
        warning: "bg-[#f6efe2] text-[#8f6326] dark:bg-[#8f6326]/15 dark:text-[#d8b783]",
        info: "bg-[#ebeef4] text-[#2e4a75] dark:bg-[#2e4a75]/15 dark:text-[#6e89b5]",
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
