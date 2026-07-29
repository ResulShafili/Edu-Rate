"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Command,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { events } from "../data/events";
import { announcements } from "../data/network";
import { formatAzDate, getUpcomingItems, isExpired } from "../lib/date";
import {
  getPlatformRouteContext,
  platformSearchItems,
  type PlatformRouteContext,
} from "../data/platform-shell";

type UtilityTab = "search" | "shortcuts" | "updates";

type PlatformUtilityRailProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  desktopOpen: boolean;
  onDesktopOpenChange: (open: boolean) => void;
};

type UtilityContentProps = {
  activeTab: UtilityTab;
  context: PlatformRouteContext;
  query: string;
  onQueryChange: (value: string) => void;
  onNavigate: () => void;
  onSearchSubmit: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  idPrefix: string;
};

const utilityTabs: readonly {
  id: UtilityTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "search", label: "Axtarış", icon: Search },
  { id: "shortcuts", label: "Qısa yollar", icon: Command },
  { id: "updates", label: "Yeniliklər", icon: Bell },
];

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase("az");
}

function UtilityContent({
  activeTab,
  context,
  query,
  onQueryChange,
  onNavigate,
  onSearchSubmit,
  searchInputRef,
  idPrefix,
}: UtilityContentProps) {
  const upcomingEvents = getUpcomingItems(events).slice(0, 3);
  const activeAnnouncements = announcements.filter((item) => !isExpired(item.expiresAt)).slice(0, 3);
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return platformSearchItems.slice(0, 6);

    return platformSearchItems.filter((item) =>
      normalizeSearchValue(`${item.label} ${item.description} ${item.keywords}`).includes(normalizedQuery),
    );
  }, [query]);

  if (activeTab === "search") {
    return (
      <div id={`${idPrefix}-search`} className="platform-utility-content" role="tabpanel" aria-label="Platformada axtarış">
        <form
          className="platform-global-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <Search size={16} aria-hidden="true" />
          <label className="sr-only" htmlFor={`${idPrefix}-search-input`}>Platformada axtar</label>
          <input
            ref={searchInputRef}
            id={`${idPrefix}-search-input`}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Bölmə və ya xüsusiyyət axtar..."
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown") return;
              const firstResult = event.currentTarget.closest(".platform-utility-content")?.querySelector<HTMLElement>(".platform-search-results a");
              if (firstResult) { event.preventDefault(); firstResult.focus(); }
            }}
          />
          <kbd aria-hidden="true">↵</kbd>
        </form>

        <div className="platform-search-summary" aria-live="polite">
          <span>{query ? "Axtarış nəticələri" : "Tez keçidlər"}</span>
          <strong>{filteredItems.length}</strong>
        </div>

        <div
          className="platform-search-results"
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a"));
            const index = links.indexOf(document.activeElement as HTMLElement);
            if (index < 0) return;
            event.preventDefault();
            const next = event.key === "ArrowDown" ? Math.min(index + 1, links.length - 1) : Math.max(index - 1, 0);
            links[next]?.focus();
          }}
        >
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )) : (
            <p className="platform-search-empty">Bu sorğuya uyğun bölmə tapılmadı.</p>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "shortcuts") {
    return (
      <div id={`${idPrefix}-shortcuts`} className="platform-utility-content" role="tabpanel" aria-label="Səhifə qısa yolları">
        <div className="platform-context-card">
          <span>{context.label}</span>
          <h3>{context.title}</h3>
          <p>{context.description}</p>
          <small><i aria-hidden="true" />{context.metric}</small>
        </div>

        <div className="platform-shortcut-list">
          {context.shortcuts.map((shortcut) => (
            <Link key={shortcut.href} href={shortcut.href} onClick={onNavigate}>
              <span>
                <strong>{shortcut.label}</strong>
                <small>{shortcut.description}</small>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id={`${idPrefix}-updates`} className="platform-utility-content" role="tabpanel" aria-label="Yaxın yeniliklər">
      <section className="platform-update-group" aria-labelledby={`${idPrefix}-events-title`}>
        <header>
          <CalendarDays size={15} aria-hidden="true" />
          <h3 id={`${idPrefix}-events-title`}>Yaxın tədbirlər</h3>
        </header>
        {upcomingEvents.map((event) => (
          <Link key={event.id} href="/events" onClick={onNavigate}>
            <time dateTime={event.startAt}><strong>{event.date}</strong>{formatAzDate(event.startAt)}</time>
            <span><strong>{event.title}</strong><small>{event.time} · {event.location}</small></span>
          </Link>
        ))}
      </section>

      <section className="platform-update-group" aria-labelledby={`${idPrefix}-announcements-title`}>
        <header>
          <Sparkles size={15} aria-hidden="true" />
          <h3 id={`${idPrefix}-announcements-title`}>Son elanlar</h3>
        </header>
        {activeAnnouncements.map((announcement) => (
          <Link key={announcement.id} href="/feed" onClick={onNavigate}>
            <span className="platform-update-dot" aria-hidden="true" />
            <span><strong>{announcement.title}</strong><small>{announcement.dateLabel} · {announcement.source}</small></span>
          </Link>
        ))}
      </section>
    </div>
  );
}

export function PlatformUtilityRail({
  mobileOpen,
  onMobileClose,
  desktopOpen,
  onDesktopOpenChange,
}: PlatformUtilityRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<UtilityTab | null>(null);
  const [query, setQuery] = useState("");
  const lastDesktopTriggerRef = useRef<HTMLButtonElement | null>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const context = getPlatformRouteContext(pathname);
  const displayedMobileTab = activeTab ?? "search";
  const displayedDesktopTab = desktopOpen ? activeTab ?? "search" : null;

  const closeDesktopPanel = useCallback((restoreFocus = true) => {
    const fallbackTrigger = document.querySelector<HTMLElement>(
      '[aria-controls="platform-desktop-utility-panel"][aria-expanded="true"]',
    );
    setActiveTab(null);
    onDesktopOpenChange(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        (lastDesktopTriggerRef.current ?? fallbackTrigger)?.focus();
      });
    }
  }, [onDesktopOpenChange]);

  const closeAllPanels = useCallback(() => {
    closeDesktopPanel(false);
    onMobileClose();
  }, [closeDesktopPanel, onMobileClose]);

  const firstSearchResult = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    const results = normalizedQuery
      ? platformSearchItems.filter((item) =>
          normalizeSearchValue(`${item.label} ${item.description} ${item.keywords}`).includes(normalizedQuery),
        )
      : platformSearchItems;
    return results[0];
  }, [query]);

  useEffect(() => {
    const visibleTab = activeTab ?? (mobileOpen || desktopOpen ? "search" : null);
    if (visibleTab !== "search") return;
    const frame = window.requestAnimationFrame(() => {
      (mobileOpen ? mobileSearchRef : desktopSearchRef).current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, desktopOpen, mobileOpen]);

  useEffect(() => {
    if (!desktopOpen || mobileOpen) return;

    function handlePanelKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDesktopPanel();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = document.getElementById("platform-desktop-utility-panel");
      const focusable = Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    window.addEventListener("keydown", handlePanelKeyboard);
    return () => window.removeEventListener("keydown", handlePanelKeyboard);
  }, [closeDesktopPanel, desktopOpen, mobileOpen]);

  function toggleDesktopTab(tab: UtilityTab, trigger: HTMLButtonElement) {
    lastDesktopTriggerRef.current = trigger;
    setActiveTab((current) => {
      const next = current === tab ? null : tab;
      onDesktopOpenChange(Boolean(next));
      return next;
    });
  }

  function submitSearch() {
    if (!firstSearchResult) return;
    router.push(firstSearchResult.href);
    closeAllPanels();
  }

  return (
    <>
      <aside className="platform-right-rail" aria-label="Səhifə alətləri">
        <span className="platform-rail-status" aria-label={`Hazırkı bölmə: ${context.label}`}>{context.label.slice(0, 1)}</span>
        <div role="tablist" aria-label="Qlobal alətlər">
          {utilityTabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`platform-utility-tab${selected ? " is-active" : ""}`}
                onClick={(event) => toggleDesktopTab(tab.id, event.currentTarget)}
                aria-label={tab.label}
                aria-selected={selected}
                aria-expanded={selected}
                aria-controls="platform-desktop-utility-panel"
                role="tab"
                data-label={tab.label}
              >
                <Icon size={18} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </aside>

      <AnimatePresence>
        {displayedDesktopTab && !mobileOpen && (
          <motion.aside
            id="platform-desktop-utility-panel"
            className="platform-utility-panel"
            initial={reducedMotion ? false : { opacity: 0, x: 24, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 18, scale: 0.99 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
            aria-label={`${utilityTabs.find((tab) => tab.id === displayedDesktopTab)?.label} paneli`}
          >
            <header className="platform-utility-panel-header">
              <div><span>Səhifə alətləri</span><h2>{utilityTabs.find((tab) => tab.id === displayedDesktopTab)?.label}</h2></div>
              <button type="button" onClick={() => closeDesktopPanel()} aria-label="Alətlər panelini bağla"><X size={17} /></button>
            </header>
            <UtilityContent
              activeTab={displayedDesktopTab}
              context={context}
              query={query}
              onQueryChange={setQuery}
              onNavigate={closeAllPanels}
              onSearchSubmit={submitSearch}
              searchInputRef={desktopSearchRef}
              idPrefix="desktop-utility"
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="platform-mobile-utility-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="platform-mobile-utility-backdrop" onClick={onMobileClose} aria-label="Alətlər panelini bağla" />
            <motion.aside
              id="platform-mobile-utility-sheet"
              className="platform-mobile-utility-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Səhifə alətləri"
              initial={reducedMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { x: "100%" }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 36 }}
            >
              <header className="platform-mobile-utility-header">
                <div><span>{context.label}</span><strong>Səhifə alətləri</strong></div>
                <button type="button" onClick={onMobileClose} aria-label="Alətlər panelini bağla"><X size={19} /></button>
              </header>

              <div className="platform-mobile-utility-tabs" role="tablist" aria-label="Qlobal alətlər">
                {utilityTabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = displayedMobileTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={selected ? "is-active" : ""}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={selected}
                      aria-controls="platform-mobile-utility-content"
                    >
                      <Icon size={15} aria-hidden="true" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div id="platform-mobile-utility-content" className="platform-mobile-utility-scroll">
                <UtilityContent
                  activeTab={displayedMobileTab}
                  context={context}
                  query={query}
                  onQueryChange={setQuery}
                  onNavigate={closeAllPanels}
                  onSearchSubmit={submitSearch}
                  searchInputRef={mobileSearchRef}
                  idPrefix="mobile-utility"
                />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
