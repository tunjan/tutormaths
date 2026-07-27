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
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[var(--overlay)] duration-slow ease-[var(--ease-standard)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-md outline-none",
            "duration-base ease-[var(--ease-standard)] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]",
            className,
          )}
          style={style}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title
                className={cn(
                  "text-lg font-semibold text-foreground",
                  titleClassName,
                )}
              >
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="my-5 h-px shrink-0 bg-border" aria-hidden />

          <div>{children}</div>

          {footer && (
            <div className="-mx-6 -mb-6 mt-6 flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-border bg-muted/40 px-6 py-4">
              {footer}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
