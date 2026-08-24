import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-8 w-60" />
          <Skeleton className="mt-2 h-5 w-full max-w-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 rounded-sm" />
          <Skeleton className="h-8 w-36 rounded-sm" />
        </div>
      </header>

      <section
        className="flex flex-col gap-4"
        aria-label="Loading dashboard overview"
      >
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="bg-surface-raised px-5 py-4"
            >
              <Skeleton className="h-4 w-28" />
              <div className="mt-2 flex items-end gap-3">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="mb-0.5 h-4 w-36 max-w-[60%]" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
          <div className="overflow-hidden rounded-md border border-border bg-surface-raised">
            <div className="flex items-start justify-between gap-4 border-b border-border-muted px-5 py-3">
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-1 h-4 w-72 max-w-full" />
              </div>
              <Skeleton className="h-6 w-24 rounded-sm" />
            </div>
            <div className="divide-y divide-border-muted border-b border-border-muted">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex h-14 items-center gap-3 px-5">
                  <Skeleton className="size-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-48 max-w-[70%]" />
                    <Skeleton className="mt-1.5 h-3 w-64 max-w-[85%]" />
                  </div>
                  <Skeleton className="hidden h-6 w-24 sm:block" />
                </div>
              ))}
            </div>
            <div className="flex min-h-12 items-center justify-between px-5 py-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-8 w-32 rounded-sm" />
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-surface-raised">
            <div className="flex items-start justify-between gap-4 border-b border-border-muted px-5 py-3">
              <div>
                <Skeleton className="h-6 w-36" />
                <Skeleton className="mt-1 h-4 w-48 max-w-full" />
              </div>
              <Skeleton className="h-8 w-16 rounded-sm" />
            </div>
            <div className="flex flex-col px-5 py-4">
              <div className="border-b border-border-muted pb-3">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1.5 h-3 w-32" />
                  </div>
                  <Skeleton className="h-7 w-12" />
                </div>
                <Skeleton className="mt-2.5 h-1.5 w-full rounded-full" />
              </div>
              <div className="mt-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="border-b border-border-muted last:border-0"
                  >
                    <div className="flex justify-between gap-4 py-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
