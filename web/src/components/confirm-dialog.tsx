"use client";

import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Potvrdit",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-primary-light"
          >
            Zrušit
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50",
              confirmVariant === "danger"
                ? "bg-danger hover:bg-danger-hover"
                : "bg-primary hover:bg-primary-hover",
            )}
          >
            {loading ? "Zpracování…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
