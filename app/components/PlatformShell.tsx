"use client";

import { Menu, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { PlatformNavigationRail } from "./PlatformNavigationRail";
import { PlatformUtilityRail } from "./PlatformUtilityRail";
import { RouteTransition } from "./RouteTransition";

type PlatformShellProps = {
  children: ReactNode;
};

export function PlatformShell({ children }: PlatformShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [navigationState, setNavigationState] = useState({ pathname, open: false });
  const [toolsState, setToolsState] = useState({ pathname, open: false });
  const navigationButtonRef = useRef<HTMLButtonElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);
  const navigationOpen = navigationState.pathname === pathname && navigationState.open;
  const toolsOpen = toolsState.pathname === pathname && toolsState.open;
  const accountHref: "/profile" | "/auth" = user ? "/profile" : "/auth";
  const accountLabel = user ? "Profilim" : "Daxil ol";

  const closeNavigation = useCallback(() => {
    setNavigationState({ pathname, open: false });
  }, [pathname]);

  const closeTools = useCallback(() => {
    setToolsState({ pathname, open: false });
  }, [pathname]);

  useEffect(() => {
    if (!navigationOpen && !toolsOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (toolsOpen) {
        setToolsState({ pathname, open: false });
        toolsButtonRef.current?.focus();
        return;
      }

      setNavigationState({ pathname, open: false });
      navigationButtonRef.current?.focus();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [navigationOpen, pathname, toolsOpen]);

  useEffect(() => {
    if (!navigationOpen && !toolsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navigationOpen, toolsOpen]);

  function toggleNavigation() {
    setToolsState({ pathname, open: false });
    setNavigationState((current) => ({
      pathname,
      open: current.pathname === pathname ? !current.open : true,
    }));
  }

  function toggleTools() {
    setNavigationState({ pathname, open: false });
    setToolsState((current) => ({
      pathname,
      open: current.pathname === pathname ? !current.open : true,
    }));
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Əsas məzmuna keç</a>

      <button
        ref={navigationButtonRef}
        type="button"
        className="platform-mobile-nav-trigger"
        onClick={toggleNavigation}
        aria-expanded={navigationOpen}
        aria-controls="platform-mobile-navigation"
        aria-label={navigationOpen ? "Naviqasiyanı bağla" : "Naviqasiyanı aç"}
      >
        <Menu size={21} />
      </button>

      <button
        ref={toolsButtonRef}
        type="button"
        className="platform-mobile-tools-trigger"
        onClick={toggleTools}
        aria-expanded={toolsOpen}
        aria-controls="platform-mobile-utility-sheet"
        aria-label={toolsOpen ? "Səhifə alətlərini bağla" : "Səhifə alətlərini aç"}
      >
        <SlidersHorizontal size={20} />
      </button>

      <PlatformNavigationRail
        pathname={pathname}
        accountHref={accountHref}
        accountLabel={accountLabel}
        accountInitials={user?.initials}
        mobileOpen={navigationOpen}
        onMobileClose={closeNavigation}
      />
      <PlatformUtilityRail key={pathname} mobileOpen={toolsOpen} onMobileClose={closeTools} />

      <div className="platform-route-content">
        <RouteTransition>{children}</RouteTransition>

        <footer className="site-footer">
          <Link href="/" className="brand"><span className="brand-mark"><span /></span>EDURATE</Link>
          <p>Birlikdə öyrənməyin daha yaxşı olduğuna<br />inanan insanlar üçün yaradılıb.</p>
          <div>
            <span>© 2026 EduRate</span>
            <a href="mailto:hello@edurate.community">hello@edurate.community</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
