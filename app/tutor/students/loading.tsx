import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      {/* Heading */}
      <Skeleton className="h-8 w-28" />

      {/* Invite card */}
      <div className="rounded-md border border-border bg-card">
        <div className="flex flex-col gap-2 p-6 pb-0">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Student list section */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <div className="rounded-md border border-border bg-card py-0">
          <div className="divide-y divide-border px-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-1 h-4 w-44" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="size-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
