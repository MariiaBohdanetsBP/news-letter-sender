"use client";

import { useState } from "react";
import { Plus, Pencil, History, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types";

interface SidebarProps {
  campaigns: Campaign[];
  history: Campaign[];
  activeCampaignId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, currentName: string) => void;
  onHistoryClick: (campaign: Campaign) => void;
}

export function Sidebar({
  campaigns,
  history,
  activeCampaignId,
  onSelect,
  onCreate,
  onRename,
  onHistoryClick,
}: SidebarProps) {
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Kampaně
        </span>
        <button
          onClick={onCreate}
          className={cn(
            "flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white",
            "transition-colors hover:bg-primary-hover",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Nová
        </button>
      </div>

      {/* Campaign list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {campaigns.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-text-secondary">
                            Žádné aktivní kampaně
            </p>
          )}
          {campaigns.map((c) => (
            <CampaignRow
              key={c.id}
              campaign={c}
              isActive={c.id === activeCampaignId}
              onSelect={() => onSelect(c.id)}
              onRename={() => onRename(c.id, c.name)}
            />
          ))}
        </div>

        {/* History section */}
        <div className="border-t border-border">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-primary-light"
          >
            <History className="h-4 w-4" />
            Historie
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                historyOpen && "rotate-180",
              )}
            />
          </button>

          {historyOpen && (
            <div className="px-2 pb-2">
              {history.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-text-secondary">
                  Zatím žádné odeslané kampaně
                </p>
              )}
              {history.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onHistoryClick(c)}
                  className="flex w-full flex-col rounded-md px-3 py-2 text-left transition-colors hover:bg-primary-light"
                >
                  <span className="text-sm text-text-primary">{c.name}</span>
                  <span className="text-xs text-text-secondary">
                    {new Date(c.createdAt).toLocaleDateString("cs-CZ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function CampaignRow({
  campaign,
  isActive,
  onSelect,
  onRename,
}: {
  campaign: Campaign;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors",
        isActive
          ? "border-l-3 border-primary bg-primary-light text-primary font-semibold"
          : "border-l-3 border-transparent text-text-primary hover:bg-primary-light",
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">{campaign.name}</span>
        {campaign.planDate && (
          <span
            className={cn(
              "text-xs",
              isActive ? "text-primary/70" : "text-text-secondary",
            )}
          >
            Plán: {new Date(campaign.planDate).toLocaleDateString("cs-CZ")}
          </span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className={cn(
          "rounded p-1 opacity-0 transition-opacity group-hover:opacity-100",
          isActive ? "hover:bg-primary/10" : "hover:bg-primary-light",
        )}
        title="Přejmenovat"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
