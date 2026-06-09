import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background,color,box-shadow,transform] duration-micro ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // The marker-pen cobalt — the one confident accent.
        default:
          "bg-primary text-primary-foreground shadow-calm hover:bg-[var(--accent-cobalt-hover)]",
        // Bordered paper sheet.
        outline:
          "border border-line-strong bg-card text-foreground shadow-calm hover:bg-muted",
        // Quiet inset fill.
        secondary:
          "bg-secondary text-secondary-foreground shadow-calm hover:bg-accent",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        // Soft cobalt wash — low-emphasis primary.
        soft: "bg-[var(--accent-cobalt-soft)] text-[var(--accent-cobalt-ink)] hover:brightness-[0.97]",
        destructive:
          "bg-destructive text-white shadow-calm hover:brightness-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
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
