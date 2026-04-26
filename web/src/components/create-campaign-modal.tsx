"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, planDate?: string) => void;
  loading?: boolean;
}

export function CreateCampaignModal({
  open,
  onClose,
  onSubmit,
  loading,
}: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [planDate, setPlanDate] = useState("");

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), planDate || undefined);
    setName("");
    setPlanDate("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#100321]/60"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Nová kampaň
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-primary-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Název kampaně
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="např. Letní newsletter 2025"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Datum plánu{" "}
              <span className="font-normal text-text-secondary">
                (nepovinné)
              </span>
            </label>
            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary-light"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={cn(
                "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {loading ? "Vytváření…" : "Vytvořit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
