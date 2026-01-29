"use client";

import { ReactNode, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Tooltip from "@/components/ui/tooltip";

interface AdminModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidthClass?: string;
}

const AdminModal = ({ title, description, children, onClose, maxWidthClass }: AdminModalProps) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className={`relative w-full ${maxWidthClass || "max-w-4xl"} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Form</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
          </div>
          <Tooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:text-slate-900"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminModal;
