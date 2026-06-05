import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      {/* Back link + title block */}
      <div>
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36 shrink-0" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card gap-1 py-5">
            <div className="px-5">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="mt-1 h-4 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Active assignments section */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>

      {/* History section */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
