"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A centred form dialog conforming to the premium design system modals.
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

  return createPortal(
    <div className="modal-overlay">
      <div
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "modal",
          className
        )}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title font-heading tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[#525252] dark:text-[#a3a3a3]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="modal-close text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="py-2">{children}</div>

        {footer && (
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
