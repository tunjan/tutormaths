import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4 border-b border-border-soft pb-7">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="hidden gap-2 sm:flex">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-card">
        <div className="flex flex-col gap-4 border-b border-border-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>
        <div className="flex gap-2 border-b border-border-soft p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <div className="flex flex-col gap-px bg-border-muted">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-18 rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}
