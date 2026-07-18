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
          "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-8 text-center text-body transition-[background-color,border-color,box-shadow] duration-base focus-within:outline-none",
          interactive ? "cursor-pointer" : "cursor-default opacity-80",
          dragging
            ? "border-accent-ink bg-accent-ink-subtle text-foreground"
            : "border-border-default bg-card text-content-subtle hover:border-border-emphasis hover:bg-bg-muted",
        )}
      >
        <UploadCloud className="mb-1 size-5 text-content-default" aria-hidden />
        <span className="text-label text-foreground">
          Drag files here, or click to choose
        </span>
        <span className="text-caption text-content-subtle">{hint}</span>
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
              className="flex min-h-10 items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-body"
            >
              {isImage(f.mimeType) ? (
                <ImageIcon className="size-4 shrink-0 text-content-subtle" />
              ) : (
                <FileText className="size-4 shrink-0 text-content-subtle" />
              )}
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              {onRemoveExisting && (
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  disabled={!interactive}
                  onClick={() => onRemoveExisting(f.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-sm text-content-subtle transition-colors duration-fast hover:bg-bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex min-h-10 items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-body"
            >
              {f.type.startsWith("image/") ? (
                <ImageIcon className="size-4 shrink-0 text-content-subtle" />
              ) : (
                <FileText className="size-4 shrink-0 text-content-subtle" />
              )}
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                disabled={!interactive}
                onClick={() => onRemove(i)}
                className="grid size-8 shrink-0 place-items-center rounded-sm text-content-subtle transition-colors duration-fast hover:bg-bg-muted hover:text-foreground"
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
