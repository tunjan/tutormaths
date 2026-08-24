"use client";

import type { CSSProperties, ReactNode } from "react";
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
  contentClassName,
  style,
  titleClassName,
  initialFocus,
  finalFocus,
  closeDisabled = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  titleClassName?: string;
  initialFocus?: Dialog.Popup.Props["initialFocus"];
  finalFocus?: Dialog.Popup.Props["finalFocus"];
  closeDisabled?: boolean;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !closeDisabled) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-overlay bg-[var(--color-overlay)] duration-base ease-[var(--ease-standard)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          className={cn(
            "fixed inset-x-0 bottom-0 z-modal flex max-h-[85dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-modal border border-transparent bg-card pt-6 pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] text-card-foreground shadow-xl outline-hidden sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-2rem)] sm:max-w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-modal sm:p-6",
            "duration-base ease-[var(--ease-out)] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]",
            className,
          )}
          style={style}
        >
          <div className="flex shrink-0 items-start justify-between gap-4">
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
                <Dialog.Description className="mt-2 max-w-[65ch] text-body text-content-subtle">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close dialog"
              disabled={closeDisabled}
              className="grid size-11 shrink-0 place-items-center rounded-sm text-content-subtle transition-colors duration-fast hover:bg-bg-subtle hover:text-content-emphasis focus-visible:outline-none disabled:cursor-not-allowed disabled:text-content-muted sm:size-9"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          <div className={cn("mt-6", contentClassName)}>{children}</div>

          {footer && (
            <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end [&_[data-slot=button]]:w-full sm:[&_[data-slot=button]]:w-auto">
              {footer}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
