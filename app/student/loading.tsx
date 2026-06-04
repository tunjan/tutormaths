import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
