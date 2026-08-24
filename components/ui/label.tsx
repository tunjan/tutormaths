"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex min-w-0 items-center gap-2 break-words text-pretty text-label group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-content-muted peer-disabled:cursor-not-allowed peer-disabled:text-content-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
