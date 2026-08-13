import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-hidden="true">
      <div className="mb-5 flex items-end justify-between border-b border-border-muted pb-5">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-2 h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      <section className="overflow-hidden rounded-lg border border-border-subtle bg-[var(--color-canvas-elevated)]">
        <div className="border-b border-border-subtle px-4 py-3 sm:px-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
        </div>
        <div className="hidden h-8 border-b border-border-subtle bg-bg-subtle/60 sm:block" />
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:gap-4 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-1.5 h-3 w-40 max-w-full" />
                </div>
              </div>
              <Skeleton className="hidden h-3 w-20 sm:block" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
