"use client";

import { useId, useRef, useState } from "react";
import { UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  id,
  name = "assignment_files",
  invalid = false,
  "aria-describedby": ariaDescribedBy,
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
  id?: string;
  name?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const [dragging, setDragging] = useState(false);
  const interactive = !busy && !disabled;
  const inputId = id ?? generatedId;
  const fileCount = existing.length + files.length;

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
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-8 text-center text-body transition-[background-color,border-color,box-shadow] duration-base focus-within:border-content-info focus-within:shadow-[var(--focus-ring)] focus-within:outline-none",
          interactive ? "cursor-pointer" : "cursor-default opacity-80",
          dragging
            ? "border-accent-ink bg-accent-ink-subtle text-foreground"
            : invalid
              ? "border-destructive bg-destructive-muted text-content-subtle"
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
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          multiple
          disabled={!interactive}
          aria-invalid={invalid}
          aria-describedby={ariaDescribedBy}
          className="sr-only"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            if (picked.length) onAdd(picked);
            // Reset so picking the same file again still fires onChange.
            e.target.value = "";
          }}
        />
      </label>

      <p className="sr-only" aria-live="polite">
        {fileCount === 0
          ? "No files selected."
          : `${fileCount} file${fileCount === 1 ? "" : "s"} selected.`}
      </p>

      {(existing.length > 0 || files.length > 0) && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {existing.map((f) => (
            <li
              key={f.id}
              className="flex min-h-9 items-center gap-2 rounded-sm border border-border-subtle bg-card px-3 py-2 text-body"
            >
              {isImage(f.mimeType) ? (
                <ImageIcon
                  className="size-4 shrink-0 text-content-subtle"
                  aria-hidden
                />
              ) : (
                <FileText
                  className="size-4 shrink-0 text-content-subtle"
                  aria-hidden
                />
              )}
              <span className="min-w-0 flex-1 truncate text-foreground">
                {f.name}
              </span>
              {onRemoveExisting && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${f.name}`}
                  disabled={!interactive}
                  onClick={() => onRemoveExisting(f.id)}
                >
                  <X aria-hidden />
                </Button>
              )}
            </li>
          ))}
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex min-h-9 items-center gap-2 rounded-sm border border-border-subtle bg-card px-3 py-2 text-body"
            >
              {f.type.startsWith("image/") ? (
                <ImageIcon
                  className="size-4 shrink-0 text-content-subtle"
                  aria-hidden
                />
              ) : (
                <FileText
                  className="size-4 shrink-0 text-content-subtle"
                  aria-hidden
                />
              )}
              <span className="min-w-0 flex-1 truncate text-foreground">
                {f.name}
              </span>
              <span className="shrink-0 text-caption text-content-muted font-metric">
                {formatFileSize(f.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${f.name}`}
                disabled={!interactive}
                onClick={() => onRemove(i)}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: megabytes >= 10 ? 0 : 1,
  }).format(megabytes)}\u00a0MB`;
}
