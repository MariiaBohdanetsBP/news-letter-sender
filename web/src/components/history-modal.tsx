"use client";

import { X } from "lucide-react";
import type { Campaign, CompanyDecision } from "@/types";

interface HistoryModalProps {
  open: boolean;
  campaign: Campaign | null;
  decisions: CompanyDecision[];
  onClose: () => void;
}

export function HistoryModal({
  open,
  campaign,
  decisions,
  onClose,
}: HistoryModalProps) {
  if (!open || !campaign) return null;

  const selected = decisions.filter((d) => d.selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {campaign.name}
            </h2>
            <div className="flex gap-4 text-sm text-text-secondary">
              <span>
                Odesláno: {new Date(campaign.createdAt).toLocaleDateString("cs-CZ")}
              </span>
              {campaign.planDate && (
                <span>
                  Datum plánu:{" "}
                  {new Date(campaign.planDate).toLocaleDateString("cs-CZ")}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-primary-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 rounded-md bg-primary-light px-3 py-2">
          <span className="text-sm font-medium text-primary">
            {selected.length} {selected.length === 1 ? "firma vybrána" : "firem vybráno"}
          </span>
          <span className="text-sm text-text-secondary">
            {" "}
            z {decisions.length} celkem
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {selected.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium text-text-secondary">
                    Firma
                  </th>
                  <th className="pb-2 font-medium text-text-secondary">
                    Rozhodl/a
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.map((d) => (
                  <tr
                    key={d.companyId}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-1.5 text-text-primary">
                      {d.companyName}
                    </td>
                    <td className="py-1.5 text-text-secondary">
                      {d.decidedBy ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-4 text-center text-sm text-text-secondary">
              Pro tuto kampaň nebyli vybráni žádní příjemci.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary-light"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
