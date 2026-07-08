import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-4 focus-visible:ring-border-subtle [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default:
          "bg-bg-inverted text-content-inverted [a]:hover:bg-content-default",
        secondary:
          "border border-border-subtle bg-bg-subtle text-content-default [a]:hover:bg-bg-emphasis",
        destructive:
          "bg-bg-error text-content-error [a]:hover:bg-bg-error",
        outline:
          "border border-border-subtle bg-transparent text-content-default [a]:hover:bg-bg-muted",
        ghost:
          "text-content-subtle hover:bg-content-emphasis/5 hover:text-content-emphasis",
        link: "text-content-info underline-offset-4 hover:underline",
        accent: "bg-bg-info text-content-info",
        "accent-alt": "bg-bg-attention text-content-attention",
        success: "bg-bg-success text-content-success",
        warning: "bg-bg-warning text-content-warning",
        info: "bg-bg-info text-content-info",
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
