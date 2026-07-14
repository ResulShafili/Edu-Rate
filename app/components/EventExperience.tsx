"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  categories,
  eventCategoryLabels,
  events,
  type Event,
  type EventFilter,
} from "../data/events";
import { EventCard } from "./EventCard";
import { EventDrawer } from "./EventDrawer";
import { MagneticButton } from "./MagneticButton";
import { ConnectionsExperience } from "./ConnectionsExperience";
import { GuidanceExperience } from "./GuidanceExperience";
import { TeacherEvaluation } from "./TeacherEvaluation";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function EventExperience() {
  const [activeFilter, setActiveFilter] = useState<EventFilter>("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const rightOrbY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.86], [1, 0.22]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);

  const visibleEvents = events.filter(
    (event) => activeFilter === "All" || event.category === activeFilter,
  );

  const closeDrawer = useCallback(() => setSelectedEvent(null), []);

  function scrollToEvents() {
    document.getElementById("events")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  function scrollToTeachers() {
    document.getElementById("teachers")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <main className="site-shell">
      <nav className="nav-shell" aria-label="Əsas naviqasiya">
        <a href="#top" className="brand" aria-label="EduRate ana səhifəsi">
          <span className="brand-mark"><span /></span>
          EDURATE
        </a>

        <div className="nav-links">
          <a href="#events">Tədbirlər</a>
          <a href="#peers">İcma</a>
          <a href="#teachers">Müəllimlər</a>
          <a href="#mentors">Mentorlar</a>
          <a href="#support">Dəstək</a>
        </div>

        <MagneticButton className="nav-cta" onClick={scrollToTeachers}>
          Müəllim tap <ArrowRight size={15} />
        </MagneticButton>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Naviqasiyanı bağla" : "Naviqasiyanı aç"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
            >
              <a href="#events" onClick={() => setMenuOpen(false)}>Tədbirlər</a>
              <a href="#peers" onClick={() => setMenuOpen(false)}>İcma</a>
              <a href="#teachers" onClick={() => setMenuOpen(false)}>Müəllimlər</a>
              <a href="#mentors" onClick={() => setMenuOpen(false)}>Mentorlar</a>
              <a href="#support" onClick={() => setMenuOpen(false)}>Dəstək</a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <motion.section
        ref={heroRef}
        id="top"
        className="hero-section"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <motion.div className="hero-orb hero-orb-left" style={{ y: orbY }} aria-hidden="true" />
        <motion.div className="hero-orb hero-orb-right" style={{ y: rightOrbY }} aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
        >
          <Sparkles size={14} />
          EduRate icması · Payız ’26
        </motion.div>

        <motion.div
          className="hero-title"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.11, delayChildren: 0.24 } },
          }}
        >
          <div className="title-line"><motion.span variants={reveal}>Maraqla gəl.</motion.span></div>
          <div className="title-line title-line-accent"><motion.span variants={reveal}>Birlikdə öyrən.</motion.span></div>
          <div className="title-line title-line-last"><motion.span variants={reveal}>Daha <em>irəli get.</em></motion.span></div>
        </motion.div>

        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.78, ease: [0.22, 1, 0.36, 1] }}
        >
          <p>
            EduRate düşünülmüş təcrübələr, etibarlı icma və davam edən
            söhbətlər vasitəsilə öyrənmək istəyən insanları bir araya gətirir.
          </p>
          <button type="button" onClick={scrollToEvents} className="scroll-cue">
            <span>Mövsümü kəşf et</span>
            <i><ArrowDown size={16} /></i>
          </button>
        </motion.div>

        <motion.div
          className="hero-stamp"
          initial={{ opacity: 0, rotate: -12, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 6, scale: 1 }}
          transition={{ type: "spring", delay: 1, stiffness: 110, damping: 14 }}
          aria-hidden="true"
        >
          <span>06</span>
          <small>şəhər</small>
        </motion.div>
      </motion.section>

      <section id="events" className="events-section">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <span className="section-kicker">01 / Təqvim</span>
            <h2>Növbəti yaxşı hekayən<br /><em>burada başlasın.</em></h2>
          </div>
          <p>Kiçik qruplar, böyük ideyalar və tanış olduğuna sevinəcəyin insanlar.</p>
        </motion.div>

        <motion.div
          className="filters-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="filters" role="group" aria-label="Tədbirləri kateqoriyaya görə süzgəcdən keçir">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeFilter === category ? "active" : ""}
                onClick={() => setActiveFilter(category)}
                aria-pressed={activeFilter === category}
              >
                {activeFilter === category && (
                  <motion.span className="filter-pill" layoutId="active-filter" />
                )}
                <span>{eventCategoryLabels[category]}</span>
              </button>
            ))}
          </div>
          <span className="event-count">
            {String(visibleEvents.length).padStart(2, "0")} tədbir
          </span>
        </motion.div>

        <motion.div layout className="events-grid">
          <AnimatePresence mode="popLayout">
            {visibleEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onSelect={setSelectedEvent}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <ConnectionsExperience />

      <TeacherEvaluation />

      <GuidanceExperience />

      <section id="about" className="manifesto-section">
        <motion.div
          className="manifesto-orb"
          aria-hidden="true"
          animate={{ x: [0, 22, 0], y: [0, -18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8 }}
        >
          Daha az formal tanışlıq.<br />Daha çox <em>həqiqi bağ.</em>
        </motion.p>
        <span>EduRate-də hər əlaqə ortaq maraqdan başlayır və faydalı bir sürprizə çevrilmək üçün yetərincə yer saxlayır.</span>
      </section>

      <footer id="journal" className="site-footer">
        <a href="#top" className="brand"><span className="brand-mark"><span /></span>EDURATE</a>
        <p>Birlikdə öyrənməyin daha yaxşı olduğuna<br />inanan insanlar üçün yaradılıb.</p>
        <div>
          <span>© 2026 EduRate</span>
          <a href="mailto:hello@edurate.community">hello@edurate.community</a>
        </div>
      </footer>

      <EventDrawer event={selectedEvent} onClose={closeDrawer} />
    </main>
  );
}
