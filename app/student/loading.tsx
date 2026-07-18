import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl py-2">
      <div className="mb-7 flex items-end justify-between gap-4 border-b border-border-soft pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="hidden h-9 w-44 sm:block" />
      </div>

      <Card>
        <CardHeader className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
          <Skeleton className="size-11 rounded-md" />
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
        <CardFooter className="justify-between gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-11 w-36" />
        </CardFooter>
      </Card>

      <div className="mt-10 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 px-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex flex-col gap-px overflow-hidden rounded-md border border-border bg-border-muted">
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
