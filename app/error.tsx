"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12"
    >
      <Card className="w-full max-w-md gap-6 p-6 text-center shadow-sm sm:p-8">
        <CardHeader className="gap-2">
          <h1 className="text-h1">Something went wrong</h1>
          <CardDescription className="mx-auto max-w-sm">
            An unexpected error occurred. You can try again, or head back home.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={reset} className="w-full sm:w-auto">
            Try again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto",
            )}
          >
            Go home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
