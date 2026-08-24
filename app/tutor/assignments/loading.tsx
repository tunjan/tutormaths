import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-2 h-5 w-full max-w-md" />
        </div>
        <Skeleton className="h-8 w-36 rounded-sm" />
      </header>

      <section
        className="overflow-hidden rounded-md bg-surface-raised shadow-xs"
        aria-label="Loading assignments"
      >
        <div className="grid gap-3 px-4 pt-4 pb-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-1 h-4 w-64 max-w-full" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-10 w-full sm:h-8 sm:w-60" />
            <Skeleton className="h-10 w-full sm:h-8 sm:w-72" />
          </div>
        </div>
        <div className="mx-3 mb-2 flex min-h-11 items-center rounded-sm bg-bg-subtle px-3 sm:mx-4">
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="hidden h-9 items-center border-b border-border-subtle bg-bg-subtle/55 px-4 md:flex">
          <Skeleton className="ml-12 h-3 w-24" />
        </div>
        <div className="divide-y divide-border-muted">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex h-14 items-center gap-3 px-3">
              <Skeleton className="size-5 shrink-0" />
              <Skeleton className="h-4 w-56 max-w-[55%]" />
              <Skeleton className="ml-auto hidden h-4 w-24 md:block" />
              <Skeleton className="hidden h-5 w-24 md:block" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
