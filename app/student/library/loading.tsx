import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 py-8">
      <Skeleton className="h-8 w-44" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
