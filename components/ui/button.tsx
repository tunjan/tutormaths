import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border text-sm font-medium transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-bg-subtle disabled:text-content-muted [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-border-subtle",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:bg-content-default hover:ring-4 hover:ring-border-subtle",
        outline:
          "border-border-subtle bg-card text-content-emphasis hover:border-border-emphasis hover:bg-bg-muted hover:ring-4 hover:ring-border-subtle",
        secondary:
          "border-border-subtle bg-bg-subtle text-content-emphasis hover:bg-bg-emphasis hover:ring-4 hover:ring-border-subtle",
        ghost:
          "border-transparent bg-transparent text-content-default hover:bg-content-emphasis/5 hover:text-content-emphasis",
        soft:
          "border-transparent bg-bg-info text-content-info hover:ring-4 hover:ring-bg-info",
        destructive:
          "border-destructive bg-destructive text-white hover:ring-4 hover:ring-bg-error",
        link:
          "border-transparent bg-transparent text-content-info underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-3 text-sm rounded-lg",
        sm: "h-8 px-2.5 text-xs rounded-md",
        md: "h-10 px-3 text-sm rounded-lg",
        lg: "h-11 px-4 text-sm rounded-lg",
        xl: "h-12 px-5 text-base rounded-lg",
        icon: "size-10 rounded-lg",
        "icon-xs": "size-8 rounded-md [&_svg]:size-3",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-lg [&_svg]:size-5",
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
