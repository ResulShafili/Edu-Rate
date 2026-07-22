"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  CircleHelp,
  Compass,
  GraduationCap,
  HeartHandshake,
  Home,
  LayoutDashboard,
  LogIn,
  Megaphone,
  FileText,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { platformRoutes } from "../data/navigation";
import { isPlatformRouteCurrent } from "../data/platform-shell";

type PlatformNavigationRailProps = {
  pathname: string;
  accountHref: "/profile" | "/auth";
  accountLabel: string;
  accountInitials?: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const routeIcons: Record<string, LucideIcon> = {
  "/events": CalendarDays,
  "/community": UsersRound,
  "/teachers": GraduationCap,
  "/mentors": HeartHandshake,
  "/support": CircleHelp,
  "/feed": Megaphone,
  "/clubs": Compass,
  "/admin": ShieldCheck,
  "/technical-presentation": FileText,
};

export function PlatformNavigationRail({
  pathname,
  accountHref,
  accountLabel,
  accountInitials,
  mobileOpen,
  onMobileClose,
}: PlatformNavigationRailProps) {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <aside className="platform-left-rail" aria-label="Əsas naviqasiya">
        <Link
          href="/"
          className="platform-sidebar-brand"
          aria-label="EduRate ana səhifəsi"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <strong>EDURATE</strong>
        </Link>

        <nav className="platform-rail-navigation" aria-label="Platforma bölmələri">
          <Link
            href="/"
            className={`platform-rail-link${pathname === "/" ? " is-active" : ""}`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            {pathname === "/" && (
              <motion.span
                className="platform-rail-active"
                layoutId="platform-left-rail-active"
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            )}
            <Home size={18} aria-hidden="true" />
            <span>Ana səhifə</span>
          </Link>

          {platformRoutes.map((route) => {
            const Icon = routeIcons[route.href] ?? LayoutDashboard;
            const current = isPlatformRouteCurrent(pathname, route.href);

            return (
              <Link
                key={route.href}
                href={route.href}
                className={`platform-rail-link${current ? " is-active" : ""}`}
                aria-current={current ? "page" : undefined}
              >
                {current && (
                  <motion.span
                    className="platform-rail-active"
                    layoutId="platform-left-rail-active"
                    transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                  />
                )}
                <Icon size={18} aria-hidden="true" />
                <span>{route.label}</span>
                <small aria-hidden="true">{route.number}</small>
              </Link>
            );
          })}
        </nav>

        <div className="platform-sidebar-account">
          <span>Hesab</span>
          <Link
            href={accountHref}
            className={`platform-rail-account${isPlatformRouteCurrent(pathname, accountHref) ? " is-active" : ""}`}
            aria-current={isPlatformRouteCurrent(pathname, accountHref) ? "page" : undefined}
          >
            {accountInitials ? <i aria-hidden="true">{accountInitials}</i> : accountHref === "/auth" ? <LogIn size={17} aria-hidden="true" /> : <UserRound size={17} aria-hidden="true" />}
            <span>{accountLabel}</span>
          </Link>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="platform-mobile-navigation-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="platform-mobile-navigation-backdrop"
              onClick={onMobileClose}
              aria-label="Naviqasiyanı bağla"
            />
            <motion.aside
              id="platform-mobile-navigation"
              className="platform-mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Əsas naviqasiya"
              initial={reducedMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 36 }}
            >
              <header>
                <Link href="/" className="platform-sidebar-brand" onClick={onMobileClose}>
                  <span className="brand-mark" aria-hidden="true"><span /></span>
                  <strong>EDURATE</strong>
                </Link>
                <button type="button" onClick={onMobileClose} aria-label="Naviqasiyanı bağla"><X size={19} /></button>
              </header>

              <nav aria-label="Platforma bölmələri">
                <Link
                  href="/"
                  className={pathname === "/" ? "is-active" : ""}
                  onClick={onMobileClose}
                  onNavigate={onMobileClose}
                  aria-current={pathname === "/" ? "page" : undefined}
                >
                  <Home size={18} aria-hidden="true" />
                  <span>Ana səhifə</span>
                  <small>00</small>
                </Link>
                {platformRoutes.map((route) => {
                  const Icon = routeIcons[route.href] ?? LayoutDashboard;
                  const current = isPlatformRouteCurrent(pathname, route.href);
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={current ? "is-active" : ""}
                      onClick={onMobileClose}
                      onNavigate={onMobileClose}
                      aria-current={current ? "page" : undefined}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{route.label}</span>
                      <small>{route.number}</small>
                    </Link>
                  );
                })}
              </nav>

              <footer>
                <Link href={accountHref} onClick={onMobileClose} onNavigate={onMobileClose}>
                  {accountInitials ? <i aria-hidden="true">{accountInitials}</i> : <UserRound size={17} aria-hidden="true" />}
                  <span>{accountLabel}</span>
                </Link>
              </footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
