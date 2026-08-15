"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import type { Club, ClubTabId } from "../data/clubs";
import { clubTabIds, clubTabLabels } from "../data/clubs";
import { MagneticJoinButton } from "./MagneticJoinButton";

const ease = [0.22, 1, 0.36, 1] as const;

type ClubDetailExperienceProps = {
  club: Club;
};

export function ClubDetailExperience({ club }: ClubDetailExperienceProps) {
  const [activeTab, setActiveTab] = useState<ClubTabId>("about");
  const reduceMotion = Boolean(useReducedMotion());
  const heroRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<ClubTabId, HTMLButtonElement | null>>({
    about: null,
    events: null,
    members: null,
    history: null,
  });
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 124]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.08]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 42]);

  function selectTab(tab: ClubTabId, moveFocus = false) {
    setActiveTab(tab);
    if (moveFocus) tabRefs.current[tab]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentTab: ClubTabId) {
    const currentIndex = clubTabIds.indexOf(currentTab);
    let nextTab: ClubTabId | undefined;

    if (event.key === "ArrowRight") {
      nextTab = clubTabIds[(currentIndex + 1) % clubTabIds.length];
    } else if (event.key === "ArrowLeft") {
      nextTab = clubTabIds[(currentIndex - 1 + clubTabIds.length) % clubTabIds.length];
    } else if (event.key === "Home") {
      nextTab = clubTabIds[0];
    } else if (event.key === "End") {
      nextTab = clubTabIds[clubTabIds.length - 1];
    }

    if (!nextTab) return;

    event.preventDefault();
    selectTab(nextTab, true);
  }

  const activeTabId = `club-${club.slug}-tab-${activeTab}`;
  const activePanelId = `club-${club.slug}-panel-${activeTab}`;

  return (
    <section className={`club-detail club-tone-${club.tone}`} aria-labelledby="club-detail-title">
      <header ref={heroRef} className="club-detail-hero">
        <motion.div
          className={`club-detail-hero__visual${club.coverUrl ? " has-cover" : ""}`}
          style={{ y: visualY, scale: visualScale, ...(club.coverUrl ? { backgroundImage: `linear-gradient(130deg, rgba(8,37,31,.2), rgba(8,37,31,.64)), url("${club.coverUrl}")` } : {}) }}
          aria-hidden="true"
        >
          <span className="club-detail-hero__orb club-detail-hero__orb--one" />
          <span className="club-detail-hero__orb club-detail-hero__orb--two" />
          <span className="club-detail-hero__mesh" />
          <span className="club-detail-hero__mark">{club.visualMark}</span>
        </motion.div>

        <div className="club-detail-hero__topline">
          <Link href="/clubs" className="club-detail-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Bütün klublar
          </Link>
          <span className="club-detail-category">{club.category}</span>
        </div>

        <motion.div className="club-detail-hero__content" style={{ y: copyY }}>
          <span className="club-detail-eyebrow">EduRate klub şəbəkəsi</span>
          <h1 id="club-detail-title">{club.name}</h1>
          <p className="club-detail-tagline">{club.tagline}</p>
          <p className="club-detail-description">{club.description}</p>

          <div className="club-detail-hero__footer">
            <dl className="club-detail-stats" aria-label="Klub göstəriciləri">
              {club.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
            <MagneticJoinButton clubId={club.slug} clubName={club.name} />
          </div>
        </motion.div>
      </header>

      <div className="club-detail-body">
        <div
          className="club-detail-tabs"
          role="tablist"
          aria-label={`${club.shortName} klub məlumatları`}
        >
          {clubTabIds.map((tab) => {
            const selected = activeTab === tab;
            const tabId = `club-${club.slug}-tab-${tab}`;
            const panelId = `club-${club.slug}-panel-${tab}`;

            return (
              <button
                key={tab}
                ref={(node) => {
                  tabRefs.current[tab] = node;
                }}
                id={tabId}
                type="button"
                className={`club-detail-tab${selected ? " is-active" : ""}`}
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(tab)}
                onKeyDown={(event) => handleTabKeyDown(event, tab)}
              >
                <span>{clubTabLabels[tab]}</span>
                {selected && (
                  <motion.i
                    className="club-detail-tab__indicator"
                    layoutId={`club-detail-tab-indicator-${club.slug}`}
                    transition={{ duration: reduceMotion ? 0 : 0.42, ease }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          <motion.section
            key={activeTab}
            id={activePanelId}
            className={`club-detail-panel club-detail-panel--${activeTab}`}
            role="tabpanel"
            aria-labelledby={activeTabId}
            tabIndex={0}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.992 }}
            transition={{ duration: reduceMotion ? 0 : 0.46, ease }}
          >
            {activeTab === "about" && (
              <div className="club-about-layout">
                <article className="club-about-copy">
                  <span className="club-panel-kicker">Klubun ruhu</span>
                  <h2>Birlikdə öyrənmək üçün açıq məkan.</h2>
                  {club.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <ul className="club-focus-list" aria-label="Klubun əsas mövzuları">
                    {club.focusTags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </article>

                <aside className="club-meeting-card" aria-labelledby="club-meeting-title">
                  <span className="club-meeting-icon" aria-hidden="true"><Sparkles size={18} /></span>
                  <span className="club-panel-kicker">Növbəti ritm</span>
                  <h2 id="club-meeting-title">Görüş məlumatı</h2>
                  <dl>
                    <div><dt><CalendarDays size={15} aria-hidden="true" /> Tezlik</dt><dd>{club.meeting.cadence}</dd></div>
                    <div><dt><Clock3 size={15} aria-hidden="true" /> Vaxt</dt><dd>{club.meeting.day} · {club.meeting.time}</dd></div>
                    <div><dt><MapPin size={15} aria-hidden="true" /> Məkan</dt><dd>{club.meeting.place}</dd></div>
                  </dl>
                </aside>
              </div>
            )}

            {activeTab === "events" && (
              <div className="club-events-section">
                <div className="club-panel-heading">
                  <div><span className="club-panel-kicker">Yaxın proqram</span><h2>İdeyadan görüşə.</h2></div>
                  <p>Klubun açıq sessiya, emalatxana və təqdimatlarını bir axında izlə.</p>
                </div>
                <ol className="club-event-list">
                  {club.events.map((event) => (
                    <li key={event.id} className="club-event-item">
                      <time dateTime={event.date} className="club-event-date">
                        <strong>{event.dateLabel}</strong><span>{event.timeLabel}</span>
                      </time>
                      <div className="club-event-copy">
                        <span>{event.format}</span>
                        <h3>{event.title}</h3>
                        <p>{event.summary}</p>
                      </div>
                      <span className="club-event-place"><MapPin size={14} aria-hidden="true" /> {event.place}</span>
                    </li>
                  ))}
                </ol>
                {club.events.length === 0 && (
                  <div className="club-tab-empty">
                    <CalendarDays size={22} aria-hidden="true" />
                    <div><h3>Hələ tədbir əlavə edilməyib</h3><p>Klubun növbəti tədbiri yayımlandıqda burada görünəcək.</p></div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div className="club-members-section">
                <div className="club-panel-heading">
                  <div><span className="club-panel-kicker">İcma</span><h2>Fərqli bacarıqlar, ortaq niyyət.</h2></div>
                  <p><UsersRound size={15} aria-hidden="true" /> Üzvlər məxfiliyi qoruyan inisiallarla göstərilir.</p>
                </div>
                <ul className="club-member-grid">
                  {club.members.map((member) => (
                    <li key={member.id} className="club-member-card">
                      <span className="club-member-avatar" aria-hidden="true">{member.initials}</span>
                      <div><h3>{member.role}</h3><p>{member.focus}</p></div>
                    </li>
                  ))}
                </ul>
                {club.members.length === 0 && (
                  <div className="club-tab-empty">
                    <UsersRound size={22} aria-hidden="true" />
                    <div><h3>Üzv siyahısı hələ formalaşır</h3><p>Kluba qoşulan üzvlər məxfilik qorunmaqla burada göstəriləcək.</p></div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="club-history-section">
                <div className="club-panel-heading">
                  <div><span className="club-panel-kicker">Yaddaş</span><h2>Kiçik addımlardan davamlı ənənəyə.</h2></div>
                  <p>Klubun formalaşmasına istiqamət verən əsas mərhələlər.</p>
                </div>
                <ol className="club-history-list">
                  {club.history.map((milestone) => (
                    <li key={`${milestone.year}-${milestone.title}`}>
                      <time dateTime={milestone.year}>{milestone.year}</time>
                      <span className="club-history-dot" aria-hidden="true" />
                      <div><h3>{milestone.title}</h3><p>{milestone.description}</p></div>
                    </li>
                  ))}
                </ol>
                {club.history.length === 0 && (
                  <div className="club-tab-empty">
                    <Clock3 size={22} aria-hidden="true" />
                    <div><h3>Tarixçə məlumatı əlavə edilməyib</h3><p>Klubun əsas mərhələləri təsdiqləndikdən sonra burada görünəcək.</p></div>
                  </div>
                )}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </section>
  );
}
