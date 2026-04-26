"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Filters } from "@/components/filters";
import { ClientsTable } from "@/components/clients-table";
import { CreateCampaignModal } from "@/components/create-campaign-modal";
import { RenameCampaignModal } from "@/components/rename-campaign-modal";
import { HistoryModal } from "@/components/history-modal";
import type { Campaign, CompanyDecision } from "@/types";

// Mock campaigns for initial state (until backend integration)
const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: "1", name: "Q3 Benefits Update", status: "Processed", planDate: "2025-07-15", createdAt: "2025-07-01T10:00:00Z" },
  { id: "2", name: "Summer Promo 2025", status: "Processed", planDate: null, createdAt: "2025-06-20T08:00:00Z" },
];

const INITIAL_HISTORY: Campaign[] = [
  { id: "h1", name: "Spring Newsletter", status: "Sent", planDate: null, createdAt: "2025-04-15T14:00:00Z" },
  { id: "h2", name: "Q1 Benefits Review", status: "Sent", planDate: null, createdAt: "2025-03-01T09:00:00Z" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Core state
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [history] = useState<Campaign[]>(INITIAL_HISTORY);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [companies] = useState<CompanyDecision[]>(MOCK_COMPANIES);

  // Per-campaign selections stored as Map<campaignId, Set<companyId>>
  const selectionsRef = useRef<Map<string, Set<string>>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [accountManager, setAccountManager] = useState("");
  const [systemType, setSystemType] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renameModal, setRenameModal] = useState<{ id: string; name: string } | null>(null);
  const [historyModal, setHistoryModal] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Store/restore selections when switching campaigns
  const handleSelectCampaign = useCallback(
    (id: string) => {
      // Save current selections
      if (activeCampaignId) {
        selectionsRef.current.set(activeCampaignId, new Set(selectedIds));
      }
      // Restore selections for new campaign
      const restored = selectionsRef.current.get(id) ?? new Set<string>();
      setSelectedIds(restored);
      setActiveCampaignId(id);
    },
    [activeCampaignId, selectedIds],
  );

  const handleToggle = useCallback((companyId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  }, []);

  const handleCreateCampaign = useCallback(
    (name: string, planDate?: string) => {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name,
        status: "Processed",
        planDate: planDate ?? null,
        createdAt: new Date().toISOString(),
      };
      setCampaigns((prev) => [...prev, newCampaign]);
      setCreateModalOpen(false);
      handleSelectCampaign(newCampaign.id);
    },
    [handleSelectCampaign],
  );

  const handleRenameCampaign = useCallback(
    (newName: string) => {
      if (!renameModal) return;
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === renameModal.id ? { ...c, name: newName } : c,
        ),
      );
      setRenameModal(null);
    },
    [renameModal],
  );

  const handleSave = useCallback(async () => {
    if (!activeCampaignId) return;
    setSaving(true);
    // Simulate save delay
    await new Promise((r) => setTimeout(r, 500));
    // Store selections persistently
    selectionsRef.current.set(activeCampaignId, new Set(selectedIds));
    setSaving(false);
  }, [activeCampaignId, selectedIds]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setAccountManager("");
    setSystemType("");
  }, []);

  // History modal decisions (mock)
  const historyDecisions = useMemo(() => {
    if (!historyModal) return [];
    // Show a subset as "selected" for demo
    return MOCK_COMPANIES.slice(0, 5).map((c) => ({ ...c, selected: true }));
  }, [historyModal]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-text-secondary">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          campaigns={campaigns}
          history={history}
          activeCampaignId={activeCampaignId}
          onSelect={handleSelectCampaign}
          onCreate={() => setCreateModalOpen(true)}
          onRename={(id, name) => setRenameModal({ id, name })}
          onHistoryClick={(c) => setHistoryModal(c)}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeCampaignId ? (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {campaigns.find((c) => c.id === activeCampaignId)?.name}
                </h2>
                <p className="text-sm text-text-secondary">
                  Select companies to include in this campaign
                </p>
              </div>

              <Filters
                search={search}
                onSearchChange={setSearch}
                accountManager={accountManager}
                onAccountManagerChange={setAccountManager}
                systemType={systemType}
                onSystemTypeChange={setSystemType}
                onClear={clearFilters}
              />

              <ClientsTable
                companies={companies}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSave={handleSave}
                saving={saving}
                search={search}
                accountManager={accountManager}
                systemType={systemType}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-text-secondary">
                  Select a campaign to get started
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Choose from the sidebar or create a new one
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateCampaignModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />

      {renameModal && (
        <RenameCampaignModal
          open={true}
          currentName={renameModal.name}
          onClose={() => setRenameModal(null)}
          onSubmit={handleRenameCampaign}
        />
      )}

      <HistoryModal
        open={!!historyModal}
        campaign={historyModal}
        decisions={historyDecisions}
        onClose={() => setHistoryModal(null)}
      />
    </div>
  );
}
