"use client";

import { useRef, useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/**
 * Presentational drag-and-drop file picker.
 */
export function FileDropzone({
  accept,
  hint,
  onFile,
  title = "Drop a file here",
  actionLabel = "Browse files",
  busy = false,
  busyLabel = "Uploading…",
  selectedName,
  disabled = false,
  className,
}: {
  accept: string;
  hint: string;
  onFile: (file: File | undefined) => void;
  title?: string;
  actionLabel?: string;
  busy?: boolean;
  busyLabel?: string;
  selectedName?: string;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const interactive = !busy && !disabled;

  return (
    <label
      onDragOver={(e) => {
        if (!interactive) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        if (!interactive) return;
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files[0]) {
          onFile(e.dataTransfer.files[0]);
        }
      }}
      aria-disabled={!interactive}
      aria-live="polite"
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-8 text-center text-body transition-[background-color,border-color,box-shadow] duration-base focus-within:outline-none",
        interactive ? "cursor-pointer" : "cursor-default opacity-80",
        dragging
          ? "border-accent-ink bg-accent-ink-subtle text-foreground"
          : "border-border-default bg-card text-content-subtle hover:border-border-emphasis hover:bg-bg-muted",
        className,
      )}
    >
      {busy ? (
        <>
          <Spinner className="size-5 text-foreground" />
          <span className="text-label text-foreground">{busyLabel}</span>
          <span className="text-caption text-muted-foreground">Keep this page open until the upload finishes.</span>
        </>
      ) : selectedName ? (
        <>
          <CheckCircle2 className="size-5 text-content-success" aria-hidden />
          <span className="max-w-full truncate text-label text-foreground">
            {selectedName}
          </span>
          <span className="text-caption text-muted-foreground">Click or drop a file to replace</span>
        </>
      ) : (
        <>
          <span className="flex size-10 items-center justify-center rounded-md bg-bg-subtle text-content-default">
            <UploadCloud className="size-5" aria-hidden />
          </span>
          <span className="text-label text-foreground">{title}</span>
          <span className="max-w-[18rem] text-caption text-muted-foreground">
            {hint}
          </span>
          <span className="mt-1 rounded-sm border border-border bg-card px-3 py-2 text-button text-content-emphasis transition-colors duration-fast group-hover:bg-bg-muted">
            {actionLabel}
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={!interactive}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </label>
  );
}
