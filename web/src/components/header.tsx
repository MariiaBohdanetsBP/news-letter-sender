"use client";

import { useAuth } from "@/lib/auth-context";
import { Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSend?: () => void;
}

export function Header({ onSend }: HeaderProps) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-lg font-semibold text-text-primary">
        Newsletter Recipients
      </h1>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={onSend}
            className={cn(
              "flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white",
              "transition-colors hover:bg-primary-hover",
            )}
          >
            <Zap className="h-4 w-4" />
            Send
          </button>
        )}

        <span className="text-sm text-text-secondary">
          {user?.displayName}
        </span>

        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-gray-100"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
