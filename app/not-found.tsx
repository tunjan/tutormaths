import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12"
    >
      <Card className="w-full max-w-md gap-6 p-6 text-center shadow-sm sm:p-8">
        <CardHeader className="gap-2">
          <h1 className="text-h1">Page not found</h1>
          <CardDescription className="mx-auto max-w-sm">
            That page doesn&rsquo;t exist, or you don&rsquo;t have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link
            href="/"
            className={cn(buttonVariants(), "w-full sm:w-auto")}
          >
            Go home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
