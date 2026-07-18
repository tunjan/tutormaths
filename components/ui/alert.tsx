import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-1 rounded-md border border-transparent p-4 text-left text-body has-data-[slot=alert-action]:pr-16 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:mt-1 *:[svg]:size-5",
  {
    variants: {
      variant: {
        default: "border-border bg-bg-muted text-content-emphasis *:[svg]:text-content-subtle",
        info: "bg-bg-info text-content-emphasis *:[svg]:text-content-info",
        success: "bg-bg-success text-content-emphasis *:[svg]:text-content-success",
        warning: "bg-bg-warning text-content-emphasis *:[svg]:text-content-warning",
        destructive: "bg-bg-error text-content-emphasis *:[svg]:text-content-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-label group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-caption text-content-subtle group-has-[>svg]/alert:col-start-2 [&_a]:text-content-info [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-3",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-3 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
