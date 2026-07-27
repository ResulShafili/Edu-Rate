"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  Megaphone,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { announcements } from "../data/network";
import { events } from "../data/events";
import { platformRoutes } from "../data/navigation";

const ease = [0.22, 1, 0.36, 1] as const;

const quickActions = [
  { href: "/events", label: "Tədbirlər", description: "Yaxın görüşləri kəşf et", icon: CalendarDays },
  { href: "/feed", label: "Elanlar", description: "Vacib yenilikləri oxu", icon: Megaphone },
  { href: "/community", label: "İcma", description: "Yeni əlaqələr qur", icon: UsersRound },
  { href: "/teachers", label: "Müəllimlər", description: "Meyarlar üzrə müqayisə et", icon: GraduationCap },
] as const;

export function HomeExperience() {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <div className="kuds-home">
      <motion.section
        className="kuds-welcome-banner"
        aria-labelledby="home-title"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.54, ease }}
      >
        <div className="kuds-welcome-copy">
          <span className="kuds-welcome-kicker"><Sparkles size={14} aria-hidden="true" /> EduRate tələbə portalı</span>
          <h1 id="home-title">Universitet həyatın bir yerdə.</h1>
          <p>
            Tədbirlər, elanlar, klublar, mentorluq və müəllim qiymətləndirməsi üçün
            sadə, ardıcıl və rahat rəqəmsal məkan.
          </p>
          <Link href="/events" className="kuds-primary-button">
            Tədbirlərə bax <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="kuds-welcome-summary" aria-label="Platforma göstəriciləri">
          <div><strong>9</strong><span>əsas bölmə</span></div>
          <div><strong>6</strong><span>aktiv tələbə klubu</span></div>
          <div><strong>4</strong><span>obyektiv rəy meyarı</span></div>
        </div>
      </motion.section>

      <section className="kuds-home-section" aria-labelledby="quick-actions-title">
        <header className="kuds-home-section-header">
          <div>
            <span>Tez keçidlər</span>
            <h2 id="quick-actions-title">Nədən başlamaq istəyirsən?</h2>
          </div>
        </header>
        <div className="kuds-quick-grid">
          {quickActions.map(({ href, label, description, icon: Icon }, index) => (
            <motion.div
              key={href}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease }}
            >
              <Link href={href} className="kuds-quick-card">
                <span><Icon size={18} aria-hidden="true" /></span>
                <div><strong>{label}</strong><small>{description}</small></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="kuds-stat-grid" aria-label="EduRate göstəriciləri">
        <article className="kuds-stat-card"><span>Yaxın tədbirlər</span><strong>{events.length}</strong></article>
        <article className="kuds-stat-card"><span>Yeni elanlar</span><strong>{announcements.length}</strong></article>
        <article className="kuds-stat-card"><span>İnkişaf imkanları</span><strong>3</strong></article>
      </section>

      <section className="kuds-home-grid" aria-label="Son fəaliyyətlər">
        <article className="kuds-home-section kuds-list-card">
          <header className="kuds-home-section-header">
            <div><span>Yaxın tədbirlər</span><h2>Bu həftə</h2></div>
            <Link href="/events" className="kuds-inline-link">Hamısına bax</Link>
          </header>
          <ul className="kuds-activity-list">
            {events.slice(0, 3).map((event) => (
              <li key={event.id}>
                <i aria-hidden="true" />
                <div><strong>{event.title}</strong><p>{event.location} · {event.category}</p></div>
                <time>{event.date} {event.month}</time>
              </li>
            ))}
          </ul>
        </article>

        <article className="kuds-home-section kuds-list-card">
          <header className="kuds-home-section-header">
            <div><span>Son elanlar</span><h2>Kampusdan xəbərlər</h2></div>
            <Link href="/feed" className="kuds-inline-link">Elanlara keç</Link>
          </header>
          <ul className="kuds-activity-list">
            {announcements.slice(0, 3).map((announcement) => (
              <li key={announcement.id}>
                <i aria-hidden="true" />
                <div><strong>{announcement.title}</strong><p>{announcement.source}</p></div>
                <time>{announcement.dateLabel}</time>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="kuds-home-section" aria-labelledby="platform-modules-title">
        <header className="kuds-home-section-header">
          <div><span>Platforma bölmələri</span><h2 id="platform-modules-title">Bütün imkanlar</h2></div>
        </header>
        <div className="kuds-module-grid">
          {platformRoutes.slice(4).map((route) => (
            <Link key={route.href} href={route.href} className="kuds-module-card">
              <span>{route.number}</span>
              <div><strong>{route.label}</strong><small>{route.description}</small></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
