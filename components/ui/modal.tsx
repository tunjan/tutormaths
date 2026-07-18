"use client";

import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared controlled dialog for forms and detail views.
 * Base UI owns focus trapping, Escape handling, scroll locking, and focus return.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  style,
  titleClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  titleClassName?: string;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[var(--color-overlay)] duration-slow ease-[var(--ease-standard)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg outline-hidden",
            "duration-slow ease-[var(--ease-out)] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]",
            className,
          )}
          style={style}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title
                className={cn(
                  "text-heading-md text-content-emphasis",
                  titleClassName,
                )}
              >
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-2 text-caption text-content-subtle">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-sm text-content-subtle transition-colors duration-fast hover:bg-bg-muted hover:text-content-emphasis focus-visible:outline-none"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="my-6 h-px shrink-0 bg-border-subtle" aria-hidden />

          <div>{children}</div>

          {footer && (
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
