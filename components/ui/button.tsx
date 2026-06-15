import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary hover:bg-primary/90 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(0,0,0,0.1)]",
        outline:
          "border border-border-strong bg-surface-raised text-foreground hover:bg-surface-muted hover:border-text-subtle hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
        secondary:
          "bg-surface-muted text-text-heading border border-border-strong hover:bg-surface-hover hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
        ghost: "bg-transparent text-text-muted hover:bg-surface-hover hover:text-text-heading",
        soft: "bg-[#f3f0ff] text-[#7c3aed] hover:bg-[#a78bfa]/20 dark:bg-[#7c3aed]/10 dark:text-[#a78bfa] dark:hover:bg-[#7c3aed]/20",
        destructive:
          "bg-[#ef4444] text-white hover:bg-[#ea580c] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(239,68,68,0.2)] dark:bg-[#ef4444] dark:hover:bg-[#ea580c]",
        link: "text-[#3b82f6] hover:text-[#2563eb] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 text-sm rounded-[8px]",
        sm: "h-8 px-4 text-xs rounded-[6px]",
        md: "h-10 px-5 text-sm rounded-[8px]",
        lg: "h-12 px-6 text-base rounded-[8px]",
        xl: "h-14 px-8 text-lg rounded-[10px]",
        icon: "h-10 w-10 rounded-[8px]",
        "icon-xs": "h-8 w-8 rounded-[6px] [&_svg]:size-3",
        "icon-sm": "h-9 w-9 rounded-[8px]",
        "icon-lg": "h-14 w-14 rounded-[8px] [&_svg]:size-6",
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
