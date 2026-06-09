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
        "flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed px-6 py-8 text-center text-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-foreground",
        interactive ? "cursor-pointer" : "cursor-default opacity-80",
        dragging
          ? "border-foreground bg-accent/30 text-foreground"
          : "border-border bg-transparent text-muted-foreground hover:border-foreground/40",
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
