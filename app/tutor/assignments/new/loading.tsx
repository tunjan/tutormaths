import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* Heading */}
      <Skeleton className="h-8 w-44" />

      {/* Card with form fields */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-6">
          {/* Student select */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          {/* Type select */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          {/* Description */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
          {/* Due */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          {/* File dropzone */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          {/* Submit button */}
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </div>
  );
}
