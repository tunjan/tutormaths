import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* Heading */}
      <Skeleton className="h-8 w-28" />

      {/* Reminder windows card */}
      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-2 p-6 pb-0">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-14 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}
