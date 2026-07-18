import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <header className="flex flex-col gap-3">
        {/* Back link */}
        <Skeleton className="h-4 w-24" />
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* Metadata line */}
        <Skeleton className="h-4 w-56" />
        {/* Progress bar */}
        <div className="max-w-sm">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="mt-1 h-3 w-40" />
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

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

        {/* Right: submissions + review + comments */}
        <div className="flex flex-col gap-10">
          {/* Submitted work */}
          <section className="flex flex-col gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 rounded-md" />
          </section>

          {/* Review card */}
          <Skeleton className="h-32 rounded-md" />

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
