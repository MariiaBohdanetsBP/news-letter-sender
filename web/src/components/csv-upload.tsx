"use client";

import { useState } from "react";

interface UploadResult {
  imported: number;
  errors: number;
  errorDetails?: string[];
}

export function CsvUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/contacts/upload", {
        method: "POST",
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

  return (
    <div className="flex items-center gap-3">
      <label className="cursor-pointer px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
        {uploading ? "Nahrávám..." : "📄 Nahrát CSV kontakty"}
        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {result && (
        <span className="text-xs text-green-400">
          ✓ {result.imported} kontaktů nahráno
          {result.errors > 0 && ` (${result.errors} chyb)`}
        </span>
      )}
      {error && <span className="text-xs text-red-400">✗ {error}</span>}
    </div>
  );
}
