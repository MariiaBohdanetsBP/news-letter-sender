"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyDecision } from "@/types";

interface ClientsTableProps {
  companies: CompanyDecision[];
  selectedIds: Set<string>;
  onToggle: (companyId: string) => void;
  onSave: () => void;
  saving?: boolean;
  search: string;
  accountManager: string;
  systemType: string;
}

export function ClientsTable({
  companies,
  selectedIds,
  onToggle,
  onSave,
  saving,
  search,
  accountManager,
  systemType,
}: ClientsTableProps) {
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let result = [...companies];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.companyName.toLowerCase().includes(q),
      );
    }
    if (accountManager) {
      result = result.filter((c) => c.accountManager === accountManager);
    }
    if (systemType) {
      result = result.filter((c) => c.systemType === systemType);
    }

    result.sort((a, b) => {
      const cmp = a.companyName.localeCompare(b.companyName, "cs");
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [companies, search, accountManager, systemType, sortAsc]);

  const selectedCompanies = companies.filter((c) =>
    selectedIds.has(c.companyId),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Selection summary */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-text-primary">
          Vybraní klienti:{" "}
          <span className="font-semibold text-primary">
            {selectedIds.size}
          </span>
        </span>
        {selectedCompanies.slice(0, 8).map((c) => (
          <span
            key={c.companyId}
            className="flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {c.companyName}
            <button
              onClick={() => onToggle(c.companyId)}
              className="rounded-full p-0.5 hover:bg-primary/10"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {selectedCompanies.length > 8 && (
          <span className="text-xs text-text-secondary">
            +{selectedCompanies.length - 8} dalších
          </span>
        )}
      </div>

      {/* Table + Save */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-sm text-text-secondary">
            {filtered.length} firem
          </span>
          <button
            onClick={onSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white",
              "transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Save className="h-4 w-4" />
            {saving ? "Ukládání…" : "Uložit výběr"}
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-primary-light">
              <th className="px-4 py-2.5 font-medium text-text-secondary">
                ID
              </th>
              <th className="px-4 py-2.5 font-medium text-text-secondary">
                <button
                  onClick={() => setSortAsc((v) => !v)}
                  className="flex items-center gap-1 hover:text-text-primary"
                >
                  Firma
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium text-text-secondary">
                Typ systému
              </th>
              <th className="px-4 py-2.5 text-center font-medium text-text-secondary">
                Vybráno
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.companyId}
                className="border-b border-border last:border-0 hover:bg-[#f3eefa]"
              >
                <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">
                  {c.companyId}
                </td>
                <td className="px-4 py-2.5 font-medium text-text-primary">
                  {c.companyName}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      c.systemType === "Muza"
                        ? "bg-primary-light text-primary"
                        : "bg-blue-50 text-blue-700",
                    )}
                  >
                    {c.systemType}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.companyId)}
                    onChange={() => onToggle(c.companyId)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary accent-primary"
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-text-secondary"
                >
                  Žádné firmy neodpovídají filtrům
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
