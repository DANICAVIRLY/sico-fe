// src/components/AlertModal.jsx
import { Button } from "flowbite-react";
import { HiCheckCircle, HiExclamationCircle, HiXCircle, HiX } from "react-icons/hi";

const STYLES = {
  success: {
    icon: HiCheckCircle,
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-50",
    ring: "ring-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300",
  },
  error: {
    icon: HiXCircle,
    iconColor: "text-rose-500",
    badgeBg: "bg-rose-50",
    ring: "ring-rose-100",
    button: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-300",
  },
  warning: {
    icon: HiExclamationCircle,
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-50",
    ring: "ring-amber-100",
    button: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-200",
  },
};

export default function AlertModal({ open, type = "warning", title, message, onClose }) {
  if (!open) return null;

  const { icon: Icon, iconColor, badgeBg, ring, button } = STYLES[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl shadow-slate-900/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <HiX className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${badgeBg} ring-8 ${ring}`}>
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>

          {title && (
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h3>
          )}

          <p className="mt-2 text-sm leading-relaxed text-slate-500 whitespace-pre-line">
            {message}
          </p>

          <Button
            onClick={onClose}
            className={`mt-7 w-full rounded-xl border-0 font-medium ${button}`}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}