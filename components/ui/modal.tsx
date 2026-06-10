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
          <h2 className="modal-title font-heading tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="modal-close"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {description && (
          <p className="text-[13px] text-[#737373] dark:text-[#a3a3a3] -mt-3 mb-5 leading-relaxed">{description}</p>
        )}

        <div>{children}</div>

        {footer && (
          <div className="mt-5 flex items-center justify-end gap-3 border-t border-[#f0f0f0] dark:border-[#262626] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
