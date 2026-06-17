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
        className="group flex w-full items-center justify-between gap-4 rounded-panel border border-border-soft bg-surface-paper/90 p-5 text-left transition-colors hover:border-border-strong hover:bg-surface-muted"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Assignment brief
          </span>
          <span className="font-medium text-foreground">View problem</span>
        </span>
        <span className="shrink-0 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Open
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        titleClassName="text-xl!"
        style={{ maxWidth: "56rem" }}
      >
        {description && (
          <p className="mb-4 text-base leading-relaxed text-foreground">
            {description}
          </p>
        )}
        {latexBody && <LatexContent source={latexBody} />}
      </Modal>
    </>
  );
}
