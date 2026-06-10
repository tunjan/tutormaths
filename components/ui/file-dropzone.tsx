"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
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
        "flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed px-6 py-8 text-center text-sm transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0a0a0a] dark:focus-within:ring-white",
        interactive ? "cursor-pointer" : "cursor-default opacity-80",
        dragging
          ? "border-black dark:border-white bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground"
          : "border-[#e5e5e5] dark:border-[#262626] bg-transparent text-[#737373] dark:text-[#a3a3a3] hover:border-[#a3a3a3] dark:hover:border-[#737373]",
      )}
    >
      {busy ? (
        <span className="text-sm font-medium">{busyLabel}</span>
      ) : selectedName ? (
        <>
          <span className="max-w-full truncate font-semibold text-foreground">
            {selectedName}
          </span>
          <span className="text-xs text-[#525252] dark:text-[#a3a3a3]">Click or drop a file to replace</span>
        </>
      ) : (
        <>
          <UploadCloud className="mb-1 size-5 text-[#737373] dark:text-[#a3a3a3]" />
          <span className="font-semibold text-foreground">
            Drag a file here, or click to choose
          </span>
          <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">{hint}</span>
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
