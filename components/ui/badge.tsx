import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-sm border border-transparent py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-muted text-muted-foreground border-border",
        destructive: "bg-surface-error text-content-error border-border-error/30",
        error: "bg-surface-error text-content-error border-border-error/30",
        red: "bg-surface-error text-content-error border-border-error/30",
        outline: "border-border text-foreground bg-transparent",
        warning: "bg-surface-warning text-content-warning border-border-warning/30",
        orange: "bg-surface-warning text-content-warning border-border-warning/30",
        success: "bg-surface-success text-content-success border-border-success/30",
        green: "bg-surface-success text-content-success border-border-success/30",
        info: "bg-surface-info text-content-info border-border-info/30",
        blue: "bg-surface-info text-content-info border-border-info/30",
        gray: "bg-muted text-muted-foreground border-border",
        ghost: "hover:bg-muted text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-5 px-1.5 text-[11px]",
        md: "h-5.5 px-2 text-xs",
        lg: "h-6 px-2.5 text-xs rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "md",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  })
}

export { Badge, badgeVariants }
