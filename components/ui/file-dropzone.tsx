"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Presentational drag-and-drop file picker. Owns the drag/hover affordance and
 * a hidden <input>, and hands the chosen File back via `onFile` — callers decide
 * what to do with it (upload immediately, or hold until form submit). Shared by
 * the submission uploader and the new-assignment form so both file inputs feel
 * identical.
 */
export function FileDropzone({
  accept,
  hint,
  onFile,
  busy = false,
  busyLabel = "Uploading…",
  selectedName,
  disabled = false,
}: {
  /** Value for the input's `accept` attribute, e.g. "application/pdf". */
  accept: string;
  /** Secondary line, e.g. "PDF or JPG, up to 20 MB". */
  hint: string;
  onFile: (file: File | undefined) => void;
  busy?: boolean;
  busyLabel?: string;
  /** When set, shows the chosen file name and a "replace" affordance. */
  selectedName?: string;
  disabled?: boolean;
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
        "flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-6 py-10 text-center text-sm transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        interactive ? "cursor-pointer" : "cursor-default opacity-80",
        dragging
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/60",
      )}
    >
      {busy ? (
        <span>{busyLabel}</span>
      ) : selectedName ? (
        <>
          <span className="max-w-full truncate font-medium text-foreground">
            {selectedName}
          </span>
          <span className="text-xs">Click or drop a file to replace</span>
        </>
      ) : (
        <>
          <UploadCloud className="mb-1 size-5 text-muted-foreground" />
          <span className="font-medium text-foreground">
            Drag a file here, or click to choose
          </span>
          <span className="text-xs">{hint}</span>
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
