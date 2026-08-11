import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main id="main-content" className="auth-canvas flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">
          Page not found
        </h1>
        <p className="max-w-md text-body text-muted-foreground">
          That page doesn&rsquo;t exist, or you don&rsquo;t have access to it.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants())}>
        Go home
      </Link>
    </main>
  );
}
