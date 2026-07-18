"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-transparent text-button text-content-default outline-none transition-[background-color,border-color,color,box-shadow] duration-fast ease-[var(--ease-standard)] hover:bg-bg-muted hover:text-content-emphasis disabled:pointer-events-none disabled:bg-bg-subtle disabled:text-content-muted aria-invalid:border-destructive aria-pressed:bg-card aria-pressed:text-content-emphasis aria-pressed:shadow-xs data-[state=on]:bg-card data-[state=on]:text-content-emphasis data-[state=on]:shadow-xs [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border bg-card hover:bg-bg-muted",
      },
      size: {
        default:
          "h-8 min-w-8 px-3",
        sm: "h-8 min-w-8 px-2 text-micro",
        lg: "h-9 min-w-9 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
