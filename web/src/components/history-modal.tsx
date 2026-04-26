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
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {campaign.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Sent: {new Date(campaign.createdAt).toLocaleDateString("cs-CZ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <p className="mb-2 text-sm font-medium text-text-primary">
            Selected recipients: {selected.length}
          </p>

          {selected.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium text-text-secondary">ID</th>
                  <th className="pb-2 font-medium text-text-secondary">
                    Company
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.map((d) => (
                  <tr key={d.companyId} className="border-b border-border last:border-0">
                    <td className="py-1.5 font-mono text-xs text-text-secondary">
                      {d.companyId}
                    </td>
                    <td className="py-1.5 text-text-primary">
                      {d.companyName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-4 text-center text-sm text-text-secondary">
              No recipients were selected for this campaign.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
