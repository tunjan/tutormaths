"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { LatexContent } from "@/components/ui/latex-content";

export function ProblemMaterialCard({
  title,
  description,
  latexBody,
}: {
  title: string;
  description?: string | null;
  latexBody?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between gap-4 rounded-md border border-border bg-card p-6 text-left transition-[background-color,border-color,box-shadow] duration-base hover:border-border-default hover:bg-surface-muted hover:shadow-sm"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-caption text-muted-foreground">
            Assignment brief
          </span>
          <span className="text-label text-foreground">View problem</span>
        </span>
        <span className="shrink-0 text-label text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
          Open
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        style={{ maxWidth: "56rem" }}
      >
        {description && (
          <p className="mb-4 text-body-lg text-foreground">
            {description}
          </p>
        )}
        {latexBody && <LatexContent source={latexBody} />}
      </Modal>
    </>
  );
}
