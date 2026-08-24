import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      <Card className="gap-0 p-0">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_17rem]">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-52" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col justify-between gap-6 bg-bg-subtle p-5 sm:p-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-3 w-16" />
              <div className="flex items-baseline justify-between gap-4">
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-sm" />
          </CardContent>
        </div>
      </Card>

      <div className="mt-10 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 px-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-md bg-card shadow-xs">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-card px-4 py-3 sm:px-6"
            >
              <Skeleton className="size-9 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
