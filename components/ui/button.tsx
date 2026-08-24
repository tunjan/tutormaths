import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border text-button transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-[var(--ease-standard)] active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-bg-muted disabled:text-content-muted disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-[var(--color-accent-brand-hover)] hover:shadow-sm active:bg-[var(--color-accent-brand-active)]",
        outline:
          "border-border-default bg-card text-content-emphasis hover:border-border-emphasis hover:bg-surface-hover",
        secondary:
          "border-border-strong bg-bg-subtle text-content-emphasis shadow-none hover:border-border-default hover:bg-surface-hover",
        ghost:
          "border-transparent bg-transparent text-content-emphasis hover:bg-surface-hover",
        soft:
          "border-border-strong bg-bg-subtle text-content-emphasis hover:border-border-default hover:bg-surface-hover",
        destructive:
          "border-[var(--color-error-border)] bg-transparent text-content-error hover:bg-bg-error",
        link:
          "h-auto rounded-none border-transparent bg-transparent px-0 text-content-info underline-offset-4 hover:underline",
        marketing:
          "h-11! rounded-pill border-transparent bg-primary px-3.5 text-button-lg text-primary-foreground shadow-xs hover:bg-[var(--color-accent-brand-hover)] hover:shadow-sm active:bg-[var(--color-accent-brand-active)]",
        "marketing-secondary":
          "h-11! rounded-pill border-border-default bg-card px-3.5 text-button-lg text-content-emphasis hover:border-border-emphasis hover:bg-surface-hover",
        category:
          "rounded-pill-category border-border-strong bg-bg-subtle px-4 text-button hover:border-border-default hover:bg-surface-hover",
        icon:
          "rounded-full border-border-strong bg-bg-subtle text-content-emphasis shadow-none hover:border-border-default hover:bg-surface-hover",
      },
      size: {
        default: "h-11 px-3.5 sm:h-10",
        sm: "h-11 px-3 sm:h-8 [&_svg]:size-4",
        md: "h-11 px-3.5 sm:h-10",
        lg: "h-11 px-4 text-button-lg",
        xl: "h-12 px-5 text-button-lg",
        icon: "size-11 px-0 sm:size-10",
        "icon-xs": "size-11 px-0 sm:size-8 [&_svg]:size-4",
        "icon-sm": "size-11 px-0 sm:size-9 [&_svg]:size-4",
        "icon-lg": "size-11 px-0 sm:size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
