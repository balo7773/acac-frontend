"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Minimal accessible modal: overlay bg-black/40, centered card, Esc + backdrop close,
 * focus moves into the dialog on open and body scroll is locked.
 */
export function Modal({
  open,
  onClose,
  title,
  titleId,
  children,
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleId: string;
  children: ReactNode;
  /** Set false while a request is in flight so the modal can't be closed mid-submit. */
  dismissable?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("input, select, textarea, button");
    first?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="modal-fade absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={() => dismissable && onClose()}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-in relative w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_-20px_rgba(8,37,82,0.45)]"
      >
        <h2 id={titleId} className="text-lg font-bold tracking-tight text-acac-navy">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
