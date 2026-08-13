import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <header className="mb-5 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-8 w-56" />
          <Skeleton className="mt-1.5 h-5 w-full max-w-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-sm" />
          <Skeleton className="h-8 w-36 rounded-sm" />
        </div>
      </header>

      <section className="mb-5 flex flex-col gap-3" aria-label="Loading dashboard overview">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-surface-raised px-4 py-3.5 sm:last:col-span-2 lg:last:col-span-1"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-7 w-12" />
              <Skeleton className="mt-1 h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)]">
          <div className="overflow-hidden rounded-md border border-border bg-surface-raised">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-1 h-4 w-64 max-w-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
            <div className="flex flex-col gap-px bg-border">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-none" />
              ))}
            </div>
            <div className="flex justify-end border-t border-border px-5 py-2.5">
              <Skeleton className="h-7 w-32 rounded-xl" />
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-surface-raised">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-1 h-4 w-48 max-w-full" />
              </div>
              <Skeleton className="h-7 w-20 rounded-xl" />
            </div>
            <div className="flex flex-col p-5">
              <div className="border-b border-border pb-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-14" />
                </div>
                <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
              </div>
              <div className="mt-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <div className="flex justify-between gap-4 py-2.5">
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

      <section className="overflow-hidden rounded-md border border-border bg-surface-raised">
        <div className="grid gap-3 border-b border-border px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-1 h-4 w-56" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-9 w-full sm:w-56" />
            <Skeleton className="h-9 w-full sm:w-72" />
          </div>
        </div>
        <div className="flex min-h-10 items-center border-b border-border bg-bg-subtle px-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col gap-px bg-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-none" />
          ))}
        </div>
      </section>
    </div>
  );
}
