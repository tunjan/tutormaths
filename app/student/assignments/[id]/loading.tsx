import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 pb-6">
      <div className="min-w-0">
        <Skeleton className="h-9 w-36 rounded-xl" />

        <header className="mt-3 flex min-w-0 flex-col gap-4 border-b border-border pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
            <Skeleton className="h-6 w-24 rounded-sm" />
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Skeleton className="h-8 w-full max-w-lg" />
            <Skeleton className="h-5 w-44 md:justify-self-end" />
          </div>
        </header>
      </div>

      <main className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20 rounded-sm" />
          </div>
          <div className="p-2 sm:p-3">
            <Skeleton className="min-h-[480px] w-full rounded-md" />
          </div>
        </section>

        <aside className="flex min-w-0 flex-col gap-4" aria-label="Loading assignment controls">
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-7 w-full rounded-xl" />
              <div className="h-px w-full bg-border" />
              <Skeleton className="h-28 w-full rounded-md" />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
