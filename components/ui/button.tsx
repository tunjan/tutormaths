import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border text-button transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-[var(--ease-standard)] active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:scale-100 disabled:border-transparent disabled:bg-bg-subtle disabled:text-content-muted [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-[var(--color-ink-hover)]",
        outline:
          "border-border bg-card text-content-emphasis hover:bg-bg-muted",
        secondary:
          "border-border bg-card text-content-emphasis hover:bg-bg-muted",
        ghost:
          "border-transparent bg-transparent text-content-emphasis hover:bg-bg-muted",
        soft:
          "border-transparent bg-bg-subtle text-content-emphasis hover:bg-border-subtle",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-[var(--color-error-deep)]",
        link:
          "h-auto rounded-none border-transparent bg-transparent px-0 text-content-info underline-offset-4 hover:underline",
        marketing:
          "rounded-pill border-transparent bg-primary px-3.5 text-button-lg text-primary-foreground hover:bg-[var(--color-ink-hover)]",
        "marketing-secondary":
          "rounded-pill border-border bg-card px-3.5 text-button-lg text-content-emphasis hover:bg-bg-muted",
        category:
          "rounded-pill-category border-border bg-card px-4 text-button hover:bg-bg-muted",
        icon:
          "rounded-full border-border bg-card text-content-emphasis hover:bg-bg-muted",
      },
      size: {
        default: "h-9 px-1.5",
        sm: "h-8 px-1.5 [&_svg]:size-4",
        md: "h-9 px-1.5",
        lg: "h-10 px-1.5",
        xl: "h-11 px-3.5",
        icon: "size-9 px-0",
        "icon-xs": "size-8 px-0 [&_svg]:size-4",
        "icon-sm": "size-8 px-0 [&_svg]:size-4",
        "icon-lg": "size-11 px-0 [&_svg]:size-5",
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
