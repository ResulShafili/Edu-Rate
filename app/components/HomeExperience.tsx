"use client";

import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  LifeBuoy,
  Megaphone,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { networkFilterLabels, type NetworkFilter } from "../data/network";
import { useAuth } from "./AuthProvider";

/**
 * Ana səhifə — sıx idarə paneli.
 *
 * Əvvəl burada ekranı tamamilə dolduran nəhəng başlıq, orbital animasiya və yan
 * menyunu təkrarlayan 7 kart var idi: real məlumat sıfır, boşluq maksimum.
 * İndi istifadəçi bir ekranda əsl məzmunu görür — son elanlar, yaxınlaşan
 * tədbirlər və populyar klublar. Bloklar sıx, kartlar kiçik, animasiya yoxdur.
 */

const quickLinks = [
  { href: "/events", label: "Tədbirlər", icon: CalendarDays },
  { href: "/feed", label: "Elanlar", icon: Megaphone },
  { href: "/clubs", label: "Klublar", icon: Sparkles },
  { href: "/community", label: "İcma", icon: UsersRound },
  { href: "/teachers", label: "Müəllimlər", icon: GraduationCap },
  { href: "/mentors", label: "Mentorlar", icon: HeartHandshake },
  { href: "/support", label: "Dəstək", icon: LifeBuoy },
] as const;

type Club = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  memberCount?: number;
  visualMark?: string;
};

type Announcement = {
  id: string;
  category?: string;
  title: string;
  summary?: string;
  dateLabel?: string;
  source?: string;
  sourceInitials?: string;
};

type CampusEvent = {
  id: string;
  title?: string;
  name?: string;
  startAt?: string;
  place?: string;
  location?: string;
  category?: string;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = (await response.json().catch(() => null)) as { data?: T } | null;
  if (!response.ok || !payload || payload.data === undefined) {
    throw new Error("Məlumat yüklənmədi.");
  }
  return payload.data;
}

/** API "clubs"/"faculties" kimi açar qaytarır — ekranda azərbaycanca göstərilir. */
function categoryLabel(value?: string) {
  if (!value) return "";
  return networkFilterLabels[value as NetworkFilter] ?? value;
}

/** "22 May" formatı — tədbir kartındakı tarix bloku üçün. */
function splitDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: date.toLocaleDateString("az-AZ", { day: "2-digit" }),
    month: date.toLocaleDateString("az-AZ", { month: "short" }).toUpperCase(),
    time: date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function HomeExperience() {
  const { user } = useAuth();
  const firstName = user?.name.trim().split(/\s+/)[0];

  const clubs = useSWR("home-clubs", () => getJson<Club[]>("/api/clubs"), {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
  const network = useSWR(
    "home-network",
    () => getJson<{ announcements: Announcement[] }>("/api/network"),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );
  const events = useSWR("home-events", () => getJson<CampusEvent[]>("/api/catalog/events"), {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  const announcements = network.data?.announcements ?? [];
  const topClubs = [...(clubs.data ?? [])]
    .sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0))
    .slice(0, 4);
  const upcoming = (events.data ?? []).slice(0, 4);

  return (
    <div className="home-board">
      {/* Kompakt banner — əvvəlki tam ekran hero-nun yerinə */}
      <section className="home-banner" aria-labelledby="home-title">
        <div>
          <span className="home-banner__kicker">
            <Sparkles size={13} aria-hidden="true" /> EduRate
          </span>
          <h1 id="home-title">
            {firstName ? `Xoş gəldin, ${firstName}.` : "Kampus həyatın bir yerdə."}
          </h1>
          <p>Tədbirlərə qoşul, klubları kəşf et, elanları izlə.</p>
        </div>
        <div className="home-banner__actions">
          <Link href="/events" className="home-btn is-primary">
            Tədbirlərə bax <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link href={user ? "/profile" : "/auth"} className="home-btn">
            {user ? "Profilim" : "Daxil ol"}
          </Link>
        </div>
      </section>

      <div className="home-columns">
        <div className="home-main">
          {/* Sürətli keçidlər — bir sıra, kiçik */}
          <nav className="home-quick" aria-label="Sürətli keçidlər">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="home-quick__item">
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <section className="home-panel" aria-labelledby="home-feed-title">
            <header className="home-panel__head">
              <h2 id="home-feed-title">Son elanlar</h2>
              <Link href="/feed">Hamısına bax <ArrowRight size={14} aria-hidden="true" /></Link>
            </header>

            {network.isLoading ? (
              <ul className="home-skeleton" aria-hidden="true"><li /><li /><li /></ul>
            ) : announcements.length ? (
              <ul className="home-feed">
                {announcements.map((item) => (
                  <li key={item.id}>
                    <span className="home-feed__mark" aria-hidden="true">
                      {item.sourceInitials || item.title.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="home-feed__meta">
                        {item.category ? <em>{categoryLabel(item.category)}</em> : null}
                        {item.dateLabel ? <time>{item.dateLabel}</time> : null}
                      </div>
                      <h3>{item.title}</h3>
                      {item.summary ? <p>{item.summary}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="home-empty">Hələ elan yoxdur.</p>
            )}
          </section>
        </div>

        {/* Sağ sütun — tədbirlər və klublar */}
        <aside className="home-rail" aria-label="Kampus xülasəsi">
          <section className="home-panel" aria-labelledby="home-events-title">
            <header className="home-panel__head">
              <h2 id="home-events-title">Yaxınlaşan tədbirlər</h2>
              <Link href="/events" aria-label="Bütün tədbirlərə bax">
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </header>

            {events.isLoading ? (
              <ul className="home-skeleton" aria-hidden="true"><li /><li /></ul>
            ) : upcoming.length ? (
              <ul className="home-events">
                {upcoming.map((event) => {
                  const when = splitDate(event.startAt);
                  return (
                    <li key={event.id}>
                      <span className="home-events__date" aria-hidden="true">
                        <strong>{when?.day ?? "--"}</strong>
                        <small>{when?.month ?? ""}</small>
                      </span>
                      <div>
                        <h3>{event.title ?? event.name ?? "Tədbir"}</h3>
                        <span className="home-events__meta">
                          <MapPin size={12} aria-hidden="true" />
                          {event.place ?? event.location ?? "Kampus"}
                          {when?.time ? ` · ${when.time}` : ""}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="home-empty">Yaxın vaxtda tədbir planlaşdırılmayıb.</p>
            )}
          </section>

          <section className="home-panel" aria-labelledby="home-clubs-title">
            <header className="home-panel__head">
              <h2 id="home-clubs-title">Populyar klublar</h2>
              <Link href="/clubs" aria-label="Bütün klublara bax">
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </header>

            {clubs.isLoading ? (
              <ul className="home-skeleton" aria-hidden="true"><li /><li /></ul>
            ) : topClubs.length ? (
              <ul className="home-clubs">
                {topClubs.map((club) => (
                  <li key={club.id}>
                    <span className="home-clubs__mark" aria-hidden="true">
                      {club.visualMark || club.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h3>{club.name}</h3>
                      <small>
                        {club.memberCount ?? 0} üzv
                        {club.category ? ` · ${club.category}` : ""}
                      </small>
                    </div>
                    <Link href={`/clubs/${club.slug}`} className="home-clubs__cta">Bax</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="home-empty">Hələ klub yoxdur.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
