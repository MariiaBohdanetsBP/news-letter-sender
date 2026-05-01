"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, Loader2, Upload, RefreshCw } from "lucide-react";
import { sendCampaign } from "@/lib/api";

interface CompanySummary {
  name: string;
  count: number;
}

interface UploadResult {
  imported: number;
  errors: number;
  errorDetails?: string[];
  companySummary?: CompanySummary[];
}

interface CsvUploadProps {
  campaignId?: string;
  onSend?: () => void;
}

export function CsvUpload({ campaignId, onSend }: CsvUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<{ status: string; message: string } | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!campaignId) {
      setError("Nejprve vyberte kampaň");
      return;
    }

    setModalOpen(true);
    setUploading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId);

      const token = localStorage.getItem("token");
      const res = await fetch("/api/contacts/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Upload failed — network error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleClose() {
    setModalOpen(false);
    setResult(null);
    setError(null);
    setSyncResult(null);
  }

  async function handleSend() {
    if (!campaignId) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const sent = await sendCampaign(campaignId);
      const eco = (sent as unknown as Record<string, unknown>).ecomail as { status: string; message: string } | undefined;
      if (eco) {
        setSyncResult(eco);
      } else {
        setSyncResult({ status: "sent", message: "Kampaň označena jako odeslaná" });
      }
      // Notify parent to refresh state
      onSend?.();
    } catch (err) {
      setSyncResult({ status: "error", message: err instanceof Error ? err.message : "Chyba při odesílání" });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <>
      <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
        <Upload className="h-3.5 w-3.5" />
        {uploading ? "Nahrávám..." : "Nahrát CSV kontakty"}
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleUpload}
          disabled={uploading || !campaignId}
          className="hidden"
        />
      </label>

      {/* Upload Results Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-700 px-5 py-4">
              <h3 className="text-sm font-semibold text-white">Výsledky nahrání</h3>
              <button onClick={handleClose} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {uploading && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-sm text-zinc-400">Zpracovávám soubor…</span>
                </div>
              )}

              {error && !uploading && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              )}

              {result && !uploading && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Celkem nahráno: <strong className="text-white">{result.imported}</strong> kontaktů</span>
                  </div>

                  {result.companySummary && result.companySummary.length > 0 && (
                    <div className="max-h-56 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800/50">
                      {result.companySummary.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between px-4 py-2 border-b border-zinc-700/50 last:border-0"
                        >
                          <span className="text-sm text-zinc-300 truncate mr-3">{c.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {c.count > 0 ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-400" />
                            )}
                            <span className={`text-xs font-medium ${c.count > 0 ? "text-green-400" : "text-red-400"}`}>
                              {c.count} příjemců
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.errors > 0 && (
                    <div className="text-xs text-zinc-500">
                      ⚠️ {result.errors} řádků přeskočeno (chybný formát)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sync result feedback */}
            {syncResult && (
              <div className={`mx-5 mb-3 flex items-center gap-2 rounded-lg px-4 py-3 ${
                syncResult.status === "sent" ? "bg-green-500/10 border border-green-500/20" :
                syncResult.status === "skipped" ? "bg-yellow-500/10 border border-yellow-500/20" :
                "bg-red-500/10 border border-red-500/20"
              }`}>
                {syncResult.status === "sent" ? (
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                ) : syncResult.status === "skipped" ? (
                  <XCircle className="h-5 w-5 text-yellow-400 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                )}
                <span className={`text-sm ${
                  syncResult.status === "sent" ? "text-green-300" :
                  syncResult.status === "skipped" ? "text-yellow-300" : "text-red-300"
                }`}>{syncResult.message}</span>
              </div>
            )}

            {/* Footer buttons */}
            {!uploading && (result || error) && (
              <div className="flex items-center justify-end gap-3 border-t border-zinc-700 px-5 py-3">
                <button
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  {syncResult ? "Zavřít" : "Zrušit"}
                </button>
                {result && result.imported > 0 && !syncResult && (
                  <button
                    onClick={handleSend}
                    disabled={syncing}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {syncing ? "Odesílám…" : "Aktualizovat seznam kontaktů"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
