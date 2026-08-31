"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  LifeBuoy,
  Megaphone,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { OrbitalHero } from "./OrbitalHero";

const ease = [0.22, 1, 0.36, 1] as const;

const modules = [
  { href: "/events", label: "Tədbirlər", number: "01", icon: CalendarDays },
  { href: "/feed", label: "Elanlar", number: "02", icon: Megaphone },
  { href: "/clubs", label: "Klublar", number: "03", icon: Sparkles },
  { href: "/community", label: "İcma", number: "04", icon: UsersRound },
  { href: "/teachers", label: "Müəllimlər", number: "05", icon: GraduationCap },
  { href: "/mentors", label: "Mentorlar", number: "06", icon: HeartHandshake },
  { href: "/support", label: "Dəstək", number: "07", icon: LifeBuoy },
] as const;

export function HomeExperience() {
  const reducedMotion = Boolean(useReducedMotion());
  const { user } = useAuth();
  const firstName = user?.name.trim().split(/\s+/)[0];

  return (
    <div className="kuds-landing">
      <motion.section
        className="kuds-landing-hero"
        aria-labelledby="home-title"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, ease }}
      >
        <div className="kuds-landing-copy">
          <span className="kuds-landing-kicker">
            <Sparkles size={14} aria-hidden="true" /> EduRate
          </span>
          <h1 id="home-title">
            {firstName ? <><small>Xoş gəldin, {firstName}.</small>Universitet həyatın <em>bir yerdə.</em></> : <>Universitet həyatın <em>bir yerdə.</em></>}
          </h1>
          <p>Başlamaq üçün bölmə seç.</p>
          <div className="kuds-landing-actions">
            <a href="#home-modules" className="kuds-primary-button">
              Bölmələrə bax <ArrowRight size={16} aria-hidden="true" />
            </a>
            <Link href={user ? "/profile" : "/auth"} className="kuds-landing-secondary">
              {user ? "Profilim" : "Daxil ol"}
            </Link>
          </div>
        </div>

        <OrbitalHero />
      </motion.section>

      <section id="home-modules" className="kuds-landing-directory" aria-labelledby="home-modules-title">
        <header>
          <span>EduRate</span>
          <h2 id="home-modules-title">Bölmələr</h2>
        </header>
        <div className="kuds-landing-grid">
          {modules.map(({ href, label, number, icon: Icon }, index) => (
            <motion.div
              key={href}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-24px" }}
              transition={{ duration: 0.42, delay: reducedMotion ? 0 : index * 0.035, ease }}
            >
              <Link href={href} className="kuds-landing-card">
                <span className="kuds-landing-card-number">{number}</span>
                <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
                <strong>{label}</strong>
                <ArrowRight className="kuds-landing-card-arrow" size={17} aria-hidden="true" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
