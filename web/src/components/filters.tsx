"use client";

import { useMemo } from "react";
import { Search, X } from "lucide-react";
import type { CompanyDecision } from "@/types";

interface FiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  accountManager: string;
  onAccountManagerChange: (value: string) => void;
  systemType: string;
  onSystemTypeChange: (value: string) => void;
  onClear: () => void;
  companies: CompanyDecision[];
}

export function Filters({
  search,
  onSearchChange,
  accountManager,
  onAccountManagerChange,
  systemType,
  onSystemTypeChange,
  onClear,
  companies,
}: FiltersProps) {
  const hasFilters = search || accountManager || systemType;

  const accountManagers = useMemo(() => {
    const names = new Set(companies.map((c) => c.accountManager).filter(Boolean));
    return Array.from(names).sort((a, b) => (a ?? "").localeCompare(b ?? "", "cs"));
  }, [companies]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Hledat firmu…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 rounded-lg border border-border pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Account Manager */}
      <select
        value={accountManager}
        onChange={(e) => onAccountManagerChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Všichni manažeři</option>
        {accountManagers.map((am) => (
          <option key={am} value={am}>
            {am}
          </option>
        ))}
      </select>

      {/* System Type */}
      <select
        value={systemType}
        onChange={(e) => onSystemTypeChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Všechny systémy</option>
        <option value="Muza">Muza</option>
        <option value="BP1">BP1</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-primary-light"
        >
          <X className="h-3.5 w-3.5" />
          Smazat
        </button>
      )}
    </div>
  );
}
