"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A centred form dialog: a dimmed graph-paper backdrop and a paper panel that
 * closes on Escape or backdrop click. Used for the "Add student" and
 * "Assign task" flows.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  // Only render the portal after mount so SSR and the first client render match.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  // Render to document.body so the fixed overlay is anchored to the viewport,
  // not clipped by a transformed/contained ancestor (e.g. the view-transition
  // wrapper or the max-width <main> column).
  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "animate-pop relative my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_oklch(0.22_0.02_265_/_0.28)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="font-display text-xl leading-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/50 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
