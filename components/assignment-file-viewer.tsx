"use client";

import { useState } from "react";
import { ExternalLink, FileWarning } from "lucide-react";
import { FilePreview } from "@/components/ui/file-preview";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AssignmentFileView {
  id: string;
  name: string;
  mimeType: string;
  url: string | null;
}

function fileTypeLabel(mimeType: string) {
  return mimeType === "application/pdf" ? "PDF document" : "Image";
}

/**
 * Keeps one assignment file active at a time so PDFs remain readable and a
 * multi-file assignment does not mount several heavyweight previews at once.
 */
export function AssignmentFileViewer({
  files,
}: {
  files: AssignmentFileView[];
}) {
  const [activeId, setActiveId] = useState(files[0]?.id ?? "");
  const activeFile = files.find((file) => file.id === activeId) ?? files[0];

  if (!activeFile) return null;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-3 rounded-md border border-border-subtle bg-bg-muted p-3 sm:flex-row sm:items-center">
        {files.length > 1 ? (
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="assignment-file-select" className="sr-only">
              Assignment file
            </FieldLabel>
            <Select
              value={activeFile.id}
              onValueChange={(nextId) => {
                if (nextId) setActiveId(nextId);
              }}
            >
              <SelectTrigger id="assignment-file-select" className="w-full">
                <SelectValue>{activeFile.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {files.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-label text-foreground">
              {activeFile.name}
            </p>
            <p className="text-caption text-muted-foreground">
              {fileTypeLabel(activeFile.mimeType)}
            </p>
          </div>
        )}

        {activeFile.url && (
          <a
            href={activeFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "shrink-0",
            )}
          >
            Open file
            <ExternalLink data-icon="inline-end" />
          </a>
        )}
      </div>

      {activeFile.url ? (
        <FilePreview
          key={activeFile.id}
          url={activeFile.url}
          mimeType={activeFile.mimeType}
          title={activeFile.name}
        />
      ) : (
        <Empty className="min-h-64 p-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileWarning />
            </EmptyMedia>
            <EmptyTitle>File unavailable</EmptyTitle>
            <EmptyDescription>
              This preview could not be loaded. Edit the assignment to replace
              the file.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
