"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getCampaigns,
  getCampaignHistory,
  getCompanies,
  createCampaign as apiCreateCampaign,
  renameCampaign as apiRenameCampaign,
  getDecisions,
  saveDecisions as apiSaveDecisions,
  sendCampaign as apiSendCampaign,
} from "@/lib/api";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Filters } from "@/components/filters";
import { ClientsTable } from "@/components/clients-table";
import { CreateCampaignModal } from "@/components/create-campaign-modal";
import { RenameCampaignModal } from "@/components/rename-campaign-modal";
import { HistoryModal } from "@/components/history-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Campaign, CompanyDecision, RaynetCompany } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Core state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [history, setHistory] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyDecision[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
  const [error, setError] = useState<string | null>(null);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch campaigns + history + companies from Raynet
  const fetchCampaigns = useCallback(async () => {
    try {
      setError(null);
      const [active, sent, raynetCompanies] = await Promise.all([
        getCampaigns(),
        getCampaignHistory(),
        getCompanies(),
      ]);
      setCampaigns(active);
      setHistory(sent);
      setCompanies(
        raynetCompanies.map((c) => ({
          companyId: c.companyId,
          companyName: c.companyName,
          selected: false,
          decidedBy: null,
          accountManager: c.accountManager,
          systemType: c.systemType,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      setError("Nepodařilo se načíst kampaně. Běží API server?");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user, fetchCampaigns]);

  // Load decisions when switching campaigns
  const handleSelectCampaign = useCallback(
    async (id: string) => {
      // Save current selections
      if (activeCampaignId) {
        selectionsRef.current.set(activeCampaignId, new Set(selectedIds));
      }

      setActiveCampaignId(id);

      // Check if we already have cached selections
      const cached = selectionsRef.current.get(id);
      if (cached) {
        setSelectedIds(cached);
        return;
      }

      // Fetch decisions from API
      try {
        const decisions = await getDecisions(id);
        const selected = new Set(
          decisions.filter((d) => d.selected).map((d) => d.companyId),
        );
        selectionsRef.current.set(id, selected);
        setSelectedIds(selected);
      } catch {
        // No saved decisions yet — start with empty set
        setSelectedIds(new Set());
      }
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
    async (name: string, planDate?: string) => {
      try {
        const created = await apiCreateCampaign(name, planDate);
        setCampaigns((prev) => [...prev, created]);
        setCreateModalOpen(false);
        handleSelectCampaign(created.id);
      } catch (err) {
        console.error("Failed to create campaign:", err);
        alert("Failed to create campaign");
      }
    },
    [handleSelectCampaign],
  );

  const handleRenameCampaign = useCallback(
    async (newName: string) => {
      if (!renameModal) return;
      try {
        await apiRenameCampaign(renameModal.id, newName);
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === renameModal.id ? { ...c, name: newName } : c,
          ),
        );
        setRenameModal(null);
      } catch (err) {
        console.error("Failed to rename campaign:", err);
        alert("Failed to rename campaign");
      }
    },
    [renameModal],
  );

  const handleSave = useCallback(async () => {
    if (!activeCampaignId) return;
    setSaving(true);
    try {
      const decisions = companies.map((c) => ({
        companyId: c.companyId,
        companyName: c.companyName,
        selected: selectedIds.has(c.companyId),
      }));
      await apiSaveDecisions(activeCampaignId, decisions);
      selectionsRef.current.set(activeCampaignId, new Set(selectedIds));
    } catch (err) {
      console.error("Failed to save decisions:", err);
      alert("Failed to save decisions");
    } finally {
      setSaving(false);
    }
  }, [activeCampaignId, selectedIds, companies]);

  const handleSendCampaign = useCallback(async () => {
    if (!activeCampaignId) return;
    setSending(true);
    try {
      const sent = await apiSendCampaign(activeCampaignId);
      // Move from active to history
      setCampaigns((prev) => prev.filter((c) => c.id !== activeCampaignId));
      setHistory((prev) => [sent, ...prev]);
      // Clear selection cache and deselect
      selectionsRef.current.delete(activeCampaignId);
      setActiveCampaignId(null);
      setSelectedIds(new Set());
      setSendConfirmOpen(false);

      // Show Ecomail status feedback
      const eco = (sent as unknown as Record<string, unknown>).ecomail as { status: string; message: string } | undefined;
      if (eco) {
        const icon = eco.status === "sent" ? "✅" : eco.status === "skipped" ? "⚠️" : "❌";
        alert(`${icon} ${eco.message}`);
      }
    } catch (err) {
      console.error("Failed to send campaign:", err);
      alert("Failed to mark campaign as sent");
    } finally {
      setSending(false);
    }
  }, [activeCampaignId]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setAccountManager("");
    setSystemType("");
  }, []);

  // History modal: fetch decisions for sent campaign
  const [historyDecisions, setHistoryDecisions] = useState<CompanyDecision[]>([]);
  useEffect(() => {
    if (!historyModal) {
      setHistoryDecisions([]);
      return;
    }
    getDecisions(historyModal.id)
      .then((decisions) => setHistoryDecisions(decisions.filter((d) => d.selected)))
      .catch(() => setHistoryDecisions([]));
  }, [historyModal]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-text-secondary">Načítání…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header campaignId={activeCampaignId ?? undefined} onSend={() => setSendConfirmOpen(true)} />

      {error && (
        <div className="border-b border-danger/20 bg-danger/5 px-6 py-2 text-sm text-danger">
          {error}
          <button onClick={fetchCampaigns} className="ml-2 underline">
            Zkusit znovu
          </button>
        </div>
      )}

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
          {loadingData ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-text-secondary">Načítání kampaní…</div>
            </div>
          ) : activeCampaignId ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {campaigns.find((c) => c.id === activeCampaignId)?.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Vyberte firmy pro tuto kampaň
                  </p>
                </div>
                <button
                  onClick={() => setSendConfirmOpen(true)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Označit jako odesláno
                </button>
              </div>

              <Filters
                search={search}
                onSearchChange={setSearch}
                accountManager={accountManager}
                onAccountManagerChange={setAccountManager}
                systemType={systemType}
                onSystemTypeChange={setSystemType}
                onClear={clearFilters}
                companies={companies}
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
                  Vyberte kampaň pro začátek
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Vyberte z postranního panelu nebo vytvořte novou
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

      <ConfirmDialog
        open={sendConfirmOpen}
        title="Označit kampaň jako odesláno"
        message={`Opravdu chcete označit "${campaigns.find((c) => c.id === activeCampaignId)?.name ?? ""}" jako odesláno? Tuto akci nelze vrátit — kampaň se přesune do historie.`}
        confirmLabel="Ano, označit jako odesláno"
        confirmVariant="primary"
        onConfirm={handleSendCampaign}
        onCancel={() => setSendConfirmOpen(false)}
        loading={sending}
      />
    </div>
  );
}
