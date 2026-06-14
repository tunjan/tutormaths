"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExistingFile {
  id: string;
  name: string;
  mimeType: string;
}

/**
 * Drag-and-drop picker that accumulates MANY files. Selected files are shown as
 * removable chips in a responsive grid. Optionally renders a set of already-saved
 * attachments (with their own remove handler) for edit flows.
 */
export function MultiFileDropzone({
  accept,
  hint,
  files,
  onAdd,
  onRemove,
  existing = [],
  onRemoveExisting,
  busy = false,
  disabled = false,
}: {
  accept: string;
  hint: string;
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  existing?: ExistingFile[];
  onRemoveExisting?: (id: string) => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const interactive = !busy && !disabled;

  const isImage = (mime: string) => mime.startsWith("image/");

  return (
    <div className="flex flex-col gap-3">
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
          const dropped = Array.from(e.dataTransfer.files);
          if (dropped.length) onAdd(dropped);
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
        <UploadCloud className="mb-1 size-5 text-[#737373] dark:text-[#a3a3a3]" />
        <span className="font-semibold text-foreground">
          Drag files here, or click to choose
        </span>
        <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">{hint}</span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          disabled={!interactive}
          className="sr-only"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            if (picked.length) onAdd(picked);
            // Reset so picking the same file again still fires onChange.
            e.target.value = "";
          }}
        />
      </label>

      {(existing.length > 0 || files.length > 0) && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {existing.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-[8px] border border-[#e5e5e5] dark:border-[#262626] bg-card px-3 py-2 text-sm"
            >
              {isImage(f.mimeType) ? (
                <ImageIcon className="size-4 shrink-0 text-[#737373] dark:text-[#a3a3a3]" />
              ) : (
                <FileText className="size-4 shrink-0 text-[#737373] dark:text-[#a3a3a3]" />
              )}
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              {onRemoveExisting && (
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  disabled={!interactive}
                  onClick={() => onRemoveExisting(f.id)}
                  className="shrink-0 rounded-full p-0.5 text-[#737373] hover:bg-[#f0f0f0] hover:text-foreground dark:text-[#a3a3a3] dark:hover:bg-[#262626]"
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-[8px] border border-[#e5e5e5] dark:border-[#262626] bg-card px-3 py-2 text-sm"
            >
              {f.type.startsWith("image/") ? (
                <ImageIcon className="size-4 shrink-0 text-[#737373] dark:text-[#a3a3a3]" />
              ) : (
                <FileText className="size-4 shrink-0 text-[#737373] dark:text-[#a3a3a3]" />
              )}
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                disabled={!interactive}
                onClick={() => onRemove(i)}
                className="shrink-0 rounded-full p-0.5 text-[#737373] hover:bg-[#f0f0f0] hover:text-foreground dark:text-[#a3a3a3] dark:hover:bg-[#262626]"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
