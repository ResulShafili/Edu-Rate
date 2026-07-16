"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { accountRoutes, platformRoutes } from "../data/navigation";
import { useAuth } from "./AuthProvider";
import { RouteTransition } from "./RouteTransition";

type PlatformShellProps = {
  children: ReactNode;
};

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformShell({ children }: PlatformShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  const accountHref = user ? "/profile" : "/auth";
  const accountIsCurrent = isCurrentRoute(pathname, accountHref);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Əsas məzmuna keç</a>

      <nav className="nav-shell" aria-label="Əsas naviqasiya">
        <Link
          href="/"
          className="brand"
          aria-label="EduRate ana səhifəsi"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <span className="brand-mark"><span /></span>
          EDURATE
        </Link>

        <div className="nav-links">
          {platformRoutes.map((route) => {
            const current = isCurrentRoute(pathname, route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={current ? "is-active" : ""}
                aria-current={current ? "page" : undefined}
              >
                <span>{route.label}</span>
                {current && (
                  <motion.i
                    layoutId="active-navigation-route"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <Link
          href={accountHref}
          className={`nav-cta${accountIsCurrent ? " is-active" : ""}`}
          aria-current={accountIsCurrent ? "page" : undefined}
        >
          {user ? (
            <>
              <span className="nav-user-initials" aria-hidden="true">{user.initials}</span>
              Profilim
            </>
          ) : (
            <>
              Daxil ol
              <LogIn size={15} />
            </>
          )}
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="global-mobile-menu"
          aria-label={menuOpen ? "Naviqasiyanı bağla" : "Naviqasiyanı aç"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="global-mobile-menu"
              className="mobile-menu"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {platformRoutes.map((route) => {
                const current = isCurrentRoute(pathname, route.href);
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={closeMenu}
                    onNavigate={closeMenu}
                    aria-current={current ? "page" : undefined}
                  >
                    <span>{route.number}</span>
                    {route.label}
                  </Link>
                );
              })}
              <span className="mobile-menu-group-label">Hesab</span>
              {accountRoutes.map((route) => {
                const current = isCurrentRoute(pathname, route.href);
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="mobile-account-link"
                    onClick={closeMenu}
                    onNavigate={closeMenu}
                    aria-current={current ? "page" : undefined}
                  >
                    <span aria-hidden="true">
                      {route.href === "/profile" ? <UserRound size={14} /> : <LogIn size={14} />}
                    </span>
                    {route.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

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
  );
}
