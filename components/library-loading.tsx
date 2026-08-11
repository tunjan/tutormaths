import { Skeleton } from "@/components/ui/skeleton";

const topicRows = [2, 1, 2];

export function LibraryLoading({ canManage }: { canManage: boolean }) {
  return (
    <div
      className="mx-auto w-full max-w-[1200px]"
      role="status"
      aria-label="Loading Library"
    >
      <div className="mb-5 flex flex-col gap-4 border-b border-border-muted pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        {canManage ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-28" />
            <Skeleton className="h-10 w-full sm:w-40" />
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div
          className={
            canManage
              ? "hidden grid-cols-[minmax(0,1fr)_9rem_7rem_3.5rem] gap-3 border-b border-border-subtle bg-bg-subtle/60 px-5 py-2 sm:grid"
              : "hidden grid-cols-[minmax(0,1fr)_9rem_7rem] gap-3 border-b border-border-subtle bg-bg-subtle/60 px-5 py-2 sm:grid"
          }
          aria-hidden
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>

        {topicRows.map((rowCount, topicIndex) => (
          <div
            key={topicIndex}
            className={topicIndex === 0 ? undefined : "border-t border-border-subtle"}
          >
            <div className="flex h-12 items-center gap-2 bg-bg-subtle/70 px-4 sm:px-5">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={
                  canManage
                    ? "grid min-h-14 grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3 border-t border-border-subtle px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_3.5rem] sm:px-5"
                    : "grid min-h-14 grid-cols-1 items-center gap-3 border-t border-border-subtle px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_9rem_7rem] sm:px-5"
                }
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 shrink-0" />
                  <Skeleton className="h-4 w-48 max-w-[70%]" />
                </div>
                <Skeleton className="hidden h-3 w-24 sm:block" />
                <Skeleton className="hidden h-3 w-12 sm:block" />
                {canManage ? (
                  <Skeleton className="size-8 justify-self-end" />
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
