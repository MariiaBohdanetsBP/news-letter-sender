"use client";

import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import { CsvUpload } from "./csv-upload";

interface HeaderProps {
  onSend?: () => void;
  campaignId?: string;
}

export function Header({ onSend, campaignId }: HeaderProps) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between bg-header px-6">
      <h1 className="text-lg font-semibold text-white">
        Příjemci newsletterů
      </h1>

      <div className="flex items-center gap-3">
        {isAdmin && <CsvUpload campaignId={campaignId} onSend={onSend} />}

        <span className="text-sm text-white/70">
          {user?.displayName}
        </span>

        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          title="Odhlásit"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
