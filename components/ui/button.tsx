import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity] outline-none select-none active-press active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 gap-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/95",
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/95",
        secondary: "border border-border bg-secondary text-secondary-foreground shadow-xs hover:bg-muted active:bg-muted/80",
        soft: "border border-border bg-muted/60 text-foreground hover:bg-muted active:bg-muted/80",
        outline: "border border-border bg-card text-foreground shadow-xs hover:bg-muted active:bg-muted/80",
        ghost: "border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
        minimal: "border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
        destructive: "border border-border bg-destructive/10 text-destructive shadow-xs hover:bg-destructive/20 focus-visible:ring-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3 py-1.5 text-sm",
        xs: "h-8 px-2.5 py-1 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-2.5 py-1 text-xs rounded-md",
        lg: "h-10 px-4 py-2 text-sm rounded-md",
        icon: "size-9 p-0 rounded-md",
        "icon-xs": "size-8 p-0 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 p-0 rounded-md",
        "icon-lg": "size-10 p-0 rounded-md",
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

