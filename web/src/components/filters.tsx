"use client";

import { Search, X } from "lucide-react";
import { ACCOUNT_MANAGERS } from "@/lib/mock-data";

interface FiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  accountManager: string;
  onAccountManagerChange: (value: string) => void;
  systemType: string;
  onSystemTypeChange: (value: string) => void;
  onClear: () => void;
}

export function Filters({
  search,
  onSearchChange,
  accountManager,
  onAccountManagerChange,
  systemType,
  onSystemTypeChange,
  onClear,
}: FiltersProps) {
  const hasFilters = search || accountManager || systemType;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Search company…"
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
        <option value="">All Managers</option>
        {ACCOUNT_MANAGERS.map((am) => (
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
        <option value="">All Systems</option>
        <option value="Muza">Muza</option>
        <option value="BP1">BP1</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-gray-100"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
