"use client";

import {
  CalendarDays,
  Home,
  Megaphone,
  Menu,
  MessageCircleQuestion,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { isPlatformRouteCurrent } from "../data/platform-shell";

type PlatformTabBarProps = {
  pathname: string;
  menuOpen: boolean;
  onMenu: () => void;
};

const tabs: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Əsas", icon: Home },
  { href: "/feed", label: "Elanlar", icon: Megaphone },
  { href: "/events", label: "Tədbir", icon: CalendarDays },
  { href: "/questions", label: "Suallar", icon: MessageCircleQuestion },
];

/**
 * Mobil tətbiq üslubunda alt naviqasiya paneli.
 *
 * Yalnız telefon ölçülərində görünür (CSS ilə). Əsas bölmələrə bir toxunuşla
 * çıxış verir; beşinci düymə tam menyunu (yan paneli) açır. Masaüstündə tamamilə
 * gizlidir — orada sol naviqasiya reyi işləyir.
 */
export function PlatformTabBar({ pathname, menuOpen, onMenu }: PlatformTabBarProps) {
  return (
    <nav className="platform-tabbar" aria-label="Sürətli naviqasiya">
      {tabs.map(({ href, label, icon: Icon }) => {
        const current = href === "/" ? pathname === "/" : isPlatformRouteCurrent(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`platform-tabbar-item${current ? " is-active" : ""}`}
            aria-current={current ? "page" : undefined}
          >
            <span className="platform-tabbar-icon"><Icon size={22} aria-hidden="true" /></span>
            <span className="platform-tabbar-label">{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        className={`platform-tabbar-item${menuOpen ? " is-active" : ""}`}
        onClick={onMenu}
        aria-expanded={menuOpen}
        aria-controls="platform-mobile-navigation"
        aria-label={menuOpen ? "Menyunu bağla" : "Menyunu aç"}
      >
        <span className="platform-tabbar-icon"><Menu size={22} aria-hidden="true" /></span>
        <span className="platform-tabbar-label">Menyu</span>
      </button>
    </nav>
  );
}
