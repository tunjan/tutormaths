import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8">
      <header>
        <Skeleton className="mb-4 h-9 w-28" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-1.5 h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-36 shrink-0" />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-md bg-card px-4 py-3.5 shadow-xs sm:px-5 sm:py-4"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-7 w-14" />
          </div>
        ))}
      </div>

      <AssignmentSectionSkeleton rows={2} />
      <AssignmentSectionSkeleton rows={1} />
    </div>
  );
}

function AssignmentSectionSkeleton({ rows }: { rows: number }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-3" />
      </div>
      <div className="overflow-hidden rounded-md bg-card shadow-xs">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b border-border-subtle px-4 py-3.5 last:border-b-0 sm:px-5"
          >
            <Skeleton className="size-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="mt-1.5 h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="hidden h-6 w-20 sm:block" />
          </div>
        ))}
      </div>
    </section>
  );
}
