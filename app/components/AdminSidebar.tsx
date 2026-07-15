"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export type AdminSection = "overview" | "users" | "clubs" | "events";

type AdminSidebarProps = {
  activeSection: AdminSection;
  collapsed: boolean;
  onSelect: (section: AdminSection) => void;
  onToggle: () => void;
};

type NavigationItem = {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
  target: string;
};

const navigationItems: readonly NavigationItem[] = [
  {
    id: "overview",
    label: "İcmal",
    icon: LayoutDashboard,
    target: "admin-overview",
  },
  {
    id: "users",
    label: "İstifadəçilər",
    icon: UsersRound,
    target: "admin-data",
  },
  {
    id: "clubs",
    label: "Klublar",
    icon: ChartNoAxesCombined,
    target: "admin-data",
  },
  {
    id: "events",
    label: "Tədbirlər",
    icon: CalendarDays,
    target: "admin-data",
  },
] as const;

export function AdminSidebar({
  activeSection,
  collapsed,
  onSelect,
  onToggle,
}: AdminSidebarProps) {
  const reducedMotion = useReducedMotion();

  function selectSection(item: NavigationItem) {
    onSelect(item.id);
    document.getElementById(item.target)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <motion.aside
      className={`admin-sidebar${collapsed ? " is-collapsed" : ""}`}
      aria-label="Administrator bölmələri"
      layout={reducedMotion ? false : "size"}
      transition={{ type: "spring", stiffness: 330, damping: 34 }}
    >
      <div className="admin-sidebar__topline">
        <Link
          href="/"
          className="admin-sidebar__brand"
          aria-label="EduRate ana səhifəsinə qayıt"
        >
          <span className="admin-sidebar__brand-mark" aria-hidden="true">
            <span />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="admin-brand-label"
                initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                EDURATE
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <button
          type="button"
          className="admin-sidebar__toggle"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-controls="admin-sidebar-content"
          aria-label={collapsed ? "Yan paneli genişləndir" : "Yan paneli yığ"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      <div id="admin-sidebar-content" className="admin-sidebar__content">
        <div className="admin-sidebar__identity">
          <span className="admin-sidebar__identity-icon" aria-hidden="true">
            <ShieldCheck size={18} />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="admin-identity-copy"
                initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                <strong>İdarəetmə mərkəzi</strong>
                <span>Təhlükəsiz iş sahəsi</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin panel naviqasiyası">
          {!collapsed && <span className="admin-sidebar__nav-label">İş sahəsi</span>}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={active ? "is-active" : undefined}
                onClick={() => selectSection(item)}
                aria-pressed={active}
                aria-label={collapsed ? item.label : undefined}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key={`${item.id}-label`}
                      initial={reducedMotion ? false : { opacity: 0, x: -7 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, x: -7 }}
                      transition={{ duration: reducedMotion ? 0 : 0.16 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.i
                    className="admin-sidebar__active-marker"
                    layoutId="admin-sidebar-active-marker"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <Link
          href="/"
          className="admin-sidebar__return-link"
          aria-label="Platformaya qayıt"
        >
          <ArrowUpRight size={17} aria-hidden="true" />
          {!collapsed && <span>Platformaya qayıt</span>}
        </Link>
      </div>
    </motion.aside>
  );
}
