import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border px-2 py-0.5 text-caption font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-fast focus-visible:outline-none [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-bg-subtle text-content-default [a]:hover:bg-border-subtle",
        secondary:
          "border-border bg-card text-content-default [a]:hover:bg-bg-muted",
        destructive:
          "border-content-error/20 bg-bg-error text-content-error [a]:hover:bg-bg-error/70",
        outline:
          "border-border bg-card text-content-default [a]:hover:bg-bg-muted",
        ghost:
          "border-transparent text-content-subtle hover:bg-bg-muted hover:text-content-emphasis",
        link:
          "border-transparent text-content-info underline-offset-4 hover:underline",
        accent:
          "border-border-subtle bg-accent-ink-subtle text-accent-ink",
        "accent-alt":
          "border-content-attention/20 bg-bg-attention text-content-attention",
        success:
          "border-content-success/20 bg-bg-success text-content-success",
        warning:
          "border-content-warning/20 bg-bg-warning text-content-warning",
        info:
          "border-content-info/20 bg-bg-info text-content-info",
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
