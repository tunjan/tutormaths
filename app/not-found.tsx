import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Mascot } from "@/components/mascot";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 text-center">
      <Mascot pose="peek" className="h-20 w-28 animate-fade-in" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          That page doesn&rsquo;t exist, or you don&rsquo;t have access to it.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants())}>
        Go home
      </Link>
    </main>
  );
}
