"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">
          Something went wrong
        </h1>
        <p className="max-w-md text-body text-muted-foreground">
          An unexpected error occurred. You can try again, or head back home.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Go home
        </Link>
      </div>
    </main>
  );
}
