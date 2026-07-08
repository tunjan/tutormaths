"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Presentational drag-and-drop file picker.
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
  accept: string;
  hint: string;
  onFile: (file: File | undefined) => void;
  busy?: boolean;
  busyLabel?: string;
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
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center text-sm transition-colors focus-within:outline-none focus-within:ring-4 focus-within:ring-border-subtle",
        interactive ? "cursor-pointer" : "cursor-default opacity-80",
        dragging
          ? "border-border-emphasis bg-bg-muted text-foreground"
          : "border-border-subtle bg-card text-content-subtle hover:border-border-emphasis",
      )}
    >
      {busy ? (
        <>
          <Loader2 className="size-5 animate-spin text-foreground" aria-hidden />
          <span className="text-sm font-medium text-foreground">{busyLabel}</span>
          <span className="text-xs text-muted-foreground">Keep this page open until the upload finishes.</span>
        </>
      ) : selectedName ? (
        <>
          <CheckCircle2 className="size-5 text-foreground" aria-hidden />
          <span className="max-w-full truncate font-semibold text-foreground">
            {selectedName}
          </span>
          <span className="text-xs text-muted-foreground">Click or drop a file to replace</span>
        </>
      ) : (
        <>
          <UploadCloud className="size-5 text-foreground" aria-hidden />
          <span className="font-semibold text-foreground">Upload completed work</span>
          <span className="max-w-[18rem] text-xs leading-5 text-muted-foreground">
            Drag a file here, or click to choose. {hint}.
          </span>
          <span className="rounded-md border border-border-subtle bg-bg-subtle px-3 py-1 text-xs font-medium text-content-emphasis">
            Choose file
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
