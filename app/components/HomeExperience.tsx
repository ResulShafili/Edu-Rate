"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { announcements } from "../data/network";
import { events } from "../data/events";
import {
  formatAzDate,
  formatAzDateTime,
  getUpcomingItems,
  isExpired,
} from "../lib/date";
import { useAuth } from "./AuthProvider";
import { EmptyState } from "./ui/Primitives";

const ease = [0.22, 1, 0.36, 1] as const;

const recommendations = [
  { href: "/teachers", label: "Müəllimləri müqayisə et", description: "Tədris meyarlarına və təsdiqlənmiş rəylərə bax.", icon: GraduationCap },
  { href: "/mentors", label: "Mentor tap", description: "Sahə, uyğun vaxt və görüş formatına görə seçim et.", icon: HeartHandshake },
  { href: "/community", label: "İcmanı kəşf et", description: "Ortaq marağı olan tələbələrlə əlaqə qur.", icon: UsersRound },
] as const;

export function HomeExperience() {
  const reducedMotion = Boolean(useReducedMotion());
  const { user } = useAuth();
  const upcomingEvents = getUpcomingItems(events).slice(0, 3);
  const activeAnnouncements = announcements
    .filter((item) => !isExpired(item.expiresAt))
    .sort((left, right) => Number(right.priority) - Number(left.priority))
    .slice(0, 3);
  const firstName = user?.name.split(/\s+/)[0];

  return (
    <div className="kuds-home">
      <motion.section
        className="kuds-welcome-banner"
        aria-labelledby="home-title"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease }}
      >
        <div className="kuds-welcome-copy">
          <span className="kuds-welcome-kicker"><Sparkles size={14} aria-hidden="true" /> EduRate tələbə portalı</span>
          <h1 id="home-title">{firstName ? `Salam, ${firstName}.` : "Universitet həyatın bir yerdə."}</h1>
          <p>{user ? "Yaxın tədbirlərini, vacib elanları və sənə uyğun imkanları bir baxışda izlə." : "Tədbirləri, elanları, icmaları və öyrənmə imkanlarını vahid məkanda kəşf et."}</p>
          <Link href={user ? "/feed" : "/auth"} className="kuds-primary-button">
            {user ? "Vacib elanlara bax" : "Hesabına daxil ol"} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="kuds-welcome-summary" aria-label="Bu gün üçün xülasə">
          <div><strong>{upcomingEvents.length}</strong><span>yaxın tədbir</span></div>
          <div><strong>{activeAnnouncements.length}</strong><span>aktiv elan</span></div>
          <div><strong>{user ? user.stats[1]?.value ?? 0 : "—"}</strong><span>icma əlaqəsi</span></div>
        </div>
      </motion.section>

      <section className="kuds-home-grid" aria-label="Əsas yeniliklər">
        <article className="kuds-home-section kuds-list-card">
          <header className="kuds-home-section-header">
            <div><span><CalendarDays size={14} aria-hidden="true" /> Təqvim</span><h2>Yaxın tədbirlər</h2></div>
            <Link href="/events" className="kuds-inline-link">Hamısına bax</Link>
          </header>
          {upcomingEvents.length ? (
            <ul className="kuds-activity-list">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <i aria-hidden="true" />
                  <div><strong>{event.title}</strong><p>{event.location} · {event.organizer}</p></div>
                  <time dateTime={event.startAt}>{formatAzDateTime(event.startAt)}</time>
                </li>
              ))}
            </ul>
          ) : <EmptyState compact title="Yaxın tədbir yoxdur" description="Yeni tədbirlər əlavə olunanda burada görünəcək." action={<Link href="/events" className="kuds-inline-link">Təqvimə bax</Link>} />}
        </article>

        <article className="kuds-home-section kuds-list-card">
          <header className="kuds-home-section-header">
            <div><span><Megaphone size={14} aria-hidden="true" /> Yeniliklər</span><h2>Vacib elanlar</h2></div>
            <Link href="/feed" className="kuds-inline-link">Elanlara keç</Link>
          </header>
          {activeAnnouncements.length ? (
            <ul className="kuds-activity-list">
              {activeAnnouncements.map((announcement) => (
                <li key={announcement.id}>
                  <i aria-hidden="true" />
                  <div><strong>{announcement.title}</strong><p>{announcement.source}</p></div>
                  <time dateTime={announcement.expiresAt}>{formatAzDate(announcement.expiresAt)}</time>
                </li>
              ))}
            </ul>
          ) : <EmptyState compact title="Aktiv elan yoxdur" description="Arxiv elanlarına Elanlar bölməsindən baxa bilərsən." />}
        </article>
      </section>

      <section className="kuds-home-section" aria-labelledby="recommendations-title">
        <header className="kuds-home-section-header"><div><span>Sənin üçün</span><h2 id="recommendations-title">Faydalı istiqamətlər</h2></div></header>
        <div className="kuds-recommendation-grid">
          {recommendations.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="kuds-recommendation-card"><span><Icon size={19} aria-hidden="true" /></span><div><strong>{label}</strong><small>{description}</small></div><ArrowRight size={16} aria-hidden="true" /></Link>
          ))}
        </div>
      </section>
    </div>
  );
}
