import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <header className="flex flex-col gap-3">
        {/* Back link */}
        <Skeleton className="h-4 w-28" />
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* Metadata line */}
        <Skeleton className="h-4 w-44" />
      </header>

      {/* Steps bar */}
      <Skeleton className="h-14 w-full rounded-md" />

      {/* Review banner area */}
      <Skeleton className="h-12 w-full rounded-md" />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-8">
        {/* Left: PDF preview */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-[600px] rounded-md" />
        </section>

        {/* Right: upload + progress + comments */}
        <div className="flex flex-col gap-10">
          {/* Submit your work */}
          <section className="flex flex-col gap-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-28 rounded-md" />
          </section>

          {/* Progress card */}
          <div className="rounded-md border border-border bg-card">
            <div className="flex flex-col gap-2 p-6 pb-0">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex flex-col gap-6 p-6">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Comments */}
          <section className="flex flex-col gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 rounded-md" />
            <Skeleton className="h-24 rounded-md" />
            <Skeleton className="h-20 rounded-md" />
          </section>
        </div>
      </div>
    </div>
  );
}
