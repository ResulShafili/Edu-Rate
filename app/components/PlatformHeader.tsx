"use client";

import { Bell, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { getPlatformRouteContext } from "../data/platform-shell";

type PlatformHeaderProps = {
  toolsOpen: boolean;
  onToolsToggle: () => void;
};

export function PlatformHeader({ toolsOpen, onToolsToggle }: PlatformHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const context = getPlatformRouteContext(pathname);

  return (
    <header className="platform-header" aria-label="Səhifə başlığı">
      <div className="platform-header-context">
        <div className="platform-breadcrumb" aria-label="Səhifə yolu">
          <span>EduRate</span>
          <ChevronRight size={14} aria-hidden="true" />
          <strong>{context.label}</strong>
        </div>
        <p>{context.description}</p>
      </div>

      <div className="platform-header-actions">
        <button
          type="button"
          className="platform-header-search"
          onClick={onToolsToggle}
          aria-expanded={toolsOpen}
          aria-controls="platform-desktop-utility-panel"
        >
          <Search size={17} aria-hidden="true" />
          <span>Platformada axtar</span>
          <kbd aria-hidden="true">⌘ K</kbd>
        </button>
        <button
          type="button"
          className="platform-header-icon"
          onClick={onToolsToggle}
          aria-label="Yeniliklər panelini aç"
          title="Yeniliklər"
        >
          <Bell size={18} aria-hidden="true" />
          <i aria-hidden="true" />
        </button>
        <Link
          href={user ? "/profile" : "/auth"}
          className="platform-header-account"
          aria-label={user ? "Profilim" : "Hesaba daxil ol"}
        >
          <span>{user?.initials ?? "ER"}</span>
          <small>{user ? user.name : "Daxil ol"}</small>
        </Link>
      </div>
    </header>
  );
}
