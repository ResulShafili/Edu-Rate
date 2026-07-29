"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  CircleHelp,
  Compass,
  GraduationCap,
  HeartHandshake,
  Home,
  LogIn,
  LogOut,
  Megaphone,
  Settings,
  ShieldCheck,
  UserPlus,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  platformRoutes,
  primaryNavigationGroups,
} from "../data/navigation";
import { isPlatformRouteCurrent } from "../data/platform-shell";

type PlatformNavigationRailProps = {
  pathname: string;
  authenticated: boolean;
  isAdmin: boolean;
  accountInitials?: string;
  signOutHref: string | null;
  onCredentialSignOut: () => Promise<void>;
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
};

export function PlatformNavigationRail(props: PlatformNavigationRailProps) {
  const reducedMotion = useReducedMotion();
  const navigation = (
    <>
      <NavigationLink href="/" label="Ana səhifə" pathname={props.pathname} icon={Home} reducedMotion={Boolean(reducedMotion)} />
      {primaryNavigationGroups.map((group) => (
        <div className="platform-nav-group" key={group.label}>
          <span className="platform-nav-group-label">{group.label}</span>
          {group.routes.map((href) => {
            const route = platformRoutes.find((item) => item.href === href);
            if (!route) return null;
            return <NavigationLink key={href} href={href} label={route.label} pathname={props.pathname} icon={routeIcons[href]} reducedMotion={Boolean(reducedMotion)} />;
          })}
        </div>
      ))}
      {props.isAdmin && (
        <div className="platform-nav-group">
          <span className="platform-nav-group-label">İdarəetmə</span>
          <NavigationLink href="/admin" label="Admin paneli" pathname={props.pathname} icon={ShieldCheck} reducedMotion={Boolean(reducedMotion)} />
        </div>
      )}
    </>
  );

  const account = props.authenticated ? (
    <>
      <AccountLink href="/profile" label="Profil" icon={UserRound} pathname={props.pathname} initials={props.accountInitials} />
      <AccountLink href="/settings" label="Parametrlər" icon={Settings} pathname={props.pathname} />
      {props.signOutHref ? (
        <a href={props.signOutHref} className="platform-rail-account"><LogOut size={17} aria-hidden="true" /><span>Çıxış</span></a>
      ) : (
        <button type="button" className="platform-rail-account" onClick={() => void props.onCredentialSignOut()}><LogOut size={17} aria-hidden="true" /><span>Çıxış</span></button>
      )}
    </>
  ) : (
    <>
      <AccountLink href="/auth" label="Daxil ol" icon={LogIn} pathname={props.pathname} />
      <AccountLink href="/auth?mode=register" label="Qeydiyyat" icon={UserPlus} pathname={props.pathname} />
    </>
  );

  return (
    <>
      <aside className="platform-left-rail" aria-label="Əsas naviqasiya">
        <Brand pathname={props.pathname} />
        <nav className="platform-rail-navigation" aria-label="Platforma bölmələri">{navigation}</nav>
        <div className="platform-sidebar-account"><span>Hesab</span>{account}</div>
      </aside>

      <AnimatePresence>
        {props.mobileOpen && (
          <motion.div className="platform-mobile-navigation-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="platform-mobile-navigation-backdrop" onClick={props.onMobileClose} aria-label="Naviqasiyanı bağla" />
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
              <header><Brand pathname={props.pathname} onClick={props.onMobileClose} /><button type="button" onClick={props.onMobileClose} aria-label="Naviqasiyanı bağla"><X size={19} /></button></header>
              <nav aria-label="Platforma bölmələri" onClick={props.onMobileClose}>{navigation}</nav>
              <footer onClick={props.onMobileClose}>{account}</footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Brand({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return <Link href="/" className="platform-sidebar-brand" onClick={onClick} aria-label="EduRate ana səhifəsi" aria-current={pathname === "/" ? "page" : undefined}><span className="brand-mark" aria-hidden="true"><span /></span><strong>EDURATE</strong></Link>;
}

function NavigationLink({ href, label, pathname, icon: Icon, reducedMotion }: { href: string; label: string; pathname: string; icon?: LucideIcon; reducedMotion: boolean }) {
  const current = isPlatformRouteCurrent(pathname, href);
  const LinkIcon = Icon ?? Compass;
  return (
    <Link href={href} className={`platform-rail-link${current ? " is-active" : ""}`} aria-current={current ? "page" : undefined}>
      {current && <motion.span className="platform-rail-active" layoutId="platform-left-rail-active" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" />}
      <LinkIcon size={18} aria-hidden="true" /><span>{label}</span>
    </Link>
  );
}

function AccountLink({ href, label, icon: Icon, pathname, initials }: { href: string; label: string; icon: LucideIcon; pathname: string; initials?: string }) {
  const current = isPlatformRouteCurrent(pathname, href.split("?")[0]);
  return <Link href={href} className={`platform-rail-account${current ? " is-active" : ""}`} aria-current={current ? "page" : undefined}>{initials ? <i aria-hidden="true">{initials}</i> : <Icon size={17} aria-hidden="true" />}<span>{label}</span></Link>;
}
