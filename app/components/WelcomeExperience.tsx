"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, Compass, GraduationCap, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

type Club = { slug: string; name: string; category: string; description?: string; tagline?: string };
type CampusEvent = { id: string; title: string; startAt: string; location?: string; category?: string };
type Teacher = { id: string; slug: string; name: string; specialty: string; headline: string };

export function WelcomeExperience() {
  const { user } = useAuth();
  const reduceMotion = Boolean(useReducedMotion());
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [pending, setPending] = useState("");
  // Render zamanı Date.now() çağırmamaq üçün açılış anını bir dəfə sabitləyirik.
  const [openedAt] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    /** Hər siyahı müstəqil gəlir: biri geciksə də qalanları dərhal görünür. */
    function loadInto<T>(path: string, apply: (items: T[]) => void) {
      void fetch(path, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : { data: [] }))
        .then((payload: { data?: T[] }) => {
          if (!cancelled) apply(payload.data ?? []);
        })
        .catch(() => undefined);
    }

    loadInto<Club>("/api/clubs", setClubs);
    loadInto<CampusEvent>("/api/catalog/events", setEvents);
    loadInto<Teacher>("/api/catalog/teachers", setTeachers);

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";
  const program = user?.program ?? "";

  const upcoming = useMemo(
    () => events
      .filter((item) => new Date(item.startAt).getTime() > openedAt)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, 2),
    [events, openedAt],
  );

  /** İxtisasla söz kəsişməsinə görə uyğun müəllimlər; tapılmasa ilk ikisi. */
  const suggestedTeachers = useMemo(() => {
    const words = program.toLocaleLowerCase("az").split(/\s+/).filter((word) => word.length > 3);
    const matched = teachers.filter((teacher) => {
      const haystack = `${teacher.specialty} ${teacher.headline}`.toLocaleLowerCase("az");
      return words.some((word) => haystack.includes(word));
    });
    return (matched.length ? matched : teachers).slice(0, 2);
  }, [teachers, program]);

  const suggestedClubs = useMemo(() => clubs.slice(0, 3), [clubs]);

  async function joinClub(slug: string) {
    setPending(slug);
    try {
      const response = await fetch(`/api/clubs/${encodeURIComponent(slug)}/memberships`, { method: "POST" });
      if (response.ok) setJoined((current) => [...current, slug]);
    } catch {
      // Uğursuz cəhd səssiz keçilir; tələbə klub səhifəsindən yenidən cəhd edə bilər.
    } finally {
      setPending("");
    }
  }

  return (
    <section className="welcome-shell">
      <motion.header
        className="welcome-hero"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="welcome-kicker"><Sparkles size={14} /> Xoş gəldin</span>
        <h1 className="module-page-title">
          {firstName ? `Salam, ${firstName}!` : "EduRate-ə xoş gəldin!"}
        </h1>
        <p>
          {program && !program.startsWith("İxtisas məlumatı")
            ? `${program} üzrə universitet həyatına başlayırsan. Aşağıdakı üç addım bir neçə dəqiqə çəkir və saytı sənin üçün doldurur.`
            : "Aşağıdakı üç addım bir neçə dəqiqə çəkir və saytı sənin üçün doldurur."}
        </p>
      </motion.header>

      <ol className="welcome-steps">
        <li className="welcome-step">
          <div className="welcome-step__head">
            <span className="welcome-step__num">01</span>
            <div>
              <h2><CalendarDays size={16} /> Dərs cədvəlini qur</h2>
              <p>Cədvəlin saytda olsa, hər gün açanda növbəti dərsini və kampusdakı tədbirləri bir yerdə görəcəksən.</p>
            </div>
          </div>
          <Link href="/schedule" className="kuds-primary-button">Cədvələ keç <ArrowRight size={15} /></Link>
        </li>

        <li className="welcome-step">
          <div className="welcome-step__head">
            <span className="welcome-step__num">02</span>
            <div>
              <h2><Compass size={16} /> Bir kluba qoşul</h2>
              <p>Klublar kampusda ən sürətli tanışlıq yoludur. Qoşulduğun anda klubun qrup söhbəti də açılır.</p>
            </div>
          </div>
          <div className="welcome-picks">
            {suggestedClubs.length ? suggestedClubs.map((club) => {
              const isJoined = joined.includes(club.slug);
              return (
                <div key={club.slug} className="welcome-pick">
                  <div>
                    <strong>{club.name}</strong>
                    <small>{club.category}</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => void joinClub(club.slug)}
                    disabled={isJoined || pending === club.slug}
                    className={isJoined ? "is-done" : ""}
                  >
                    {isJoined ? <><Check size={14} /> Qoşuldun</> : pending === club.slug ? "Gözlə…" : "Qoşul"}
                  </button>
                </div>
              );
            }) : <p className="welcome-none">Klublar yüklənir…</p>}
          </div>
        </li>

        <li className="welcome-step">
          <div className="welcome-step__head">
            <span className="welcome-step__num">03</span>
            <div>
              <h2><UsersRound size={16} /> Kampusda nə baş verir</h2>
              <p>Yaxın tədbirlərə bax və maraqlı olana yer ayır.</p>
            </div>
          </div>
          <div className="welcome-picks">
            {upcoming.length ? upcoming.map((item) => (
              <Link key={item.id} href="/events" className="welcome-pick welcome-pick--link">
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {new Intl.DateTimeFormat("az-AZ", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(item.startAt))}
                    {item.location ? ` · ${item.location}` : ""}
                  </small>
                </div>
                <ArrowRight size={15} />
              </Link>
            )) : <p className="welcome-none">Hazırda planlaşdırılan tədbir yoxdur.</p>}
          </div>
        </li>
      </ol>

      {suggestedTeachers.length ? (
        <div className="welcome-teachers">
          <h2><GraduationCap size={16} /> İxtisasına yaxın müəllimlər</h2>
          <p>Semestr seçimindən əvvəl müəllimləri dörd meyar üzrə müqayisə edə bilərsən.</p>
          <div className="welcome-picks">
            {suggestedTeachers.map((teacher) => (
              <div key={teacher.id} className="welcome-pick">
                <div>
                  <strong>{teacher.name}</strong>
                  <small>{teacher.specialty}</small>
                </div>
              </div>
            ))}
          </div>
          <Link href="/teachers/compare" className="welcome-secondary">Müəllimləri müqayisə et <ArrowRight size={14} /></Link>
        </div>
      ) : null}

      <div className="welcome-footer">
        <Link href="/profile" className="welcome-secondary">Profilimə keç</Link>
        <Link href="/" className="welcome-skip">Sonra edərəm</Link>
      </div>
    </section>
  );
}
