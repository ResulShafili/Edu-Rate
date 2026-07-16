"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { mentors } from "../data/mentors";

const ease = [0.22, 1, 0.36, 1] as const;

export function MentorshipDashboard() {
  const [expandedId, setExpandedId] = useState<string | null>(mentors[0]?.id ?? null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(() => new Set());
  const reduceMotion = useReducedMotion();

  function requestMentorship(mentorId: string) {
    setRequestedIds((current) => new Set(current).add(mentorId));
  }

  return (
    <section id="mentors" className="mentor-section route-module-section" aria-labelledby="mentor-title">
      <div className="mentor-ambient mentor-ambient-one" aria-hidden="true" />
      <div className="mentor-ambient mentor-ambient-two" aria-hidden="true" />

      <motion.div
        className="mentor-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease }}
      >
        <div>
          <span className="mentor-kicker">04 / İnkişaf yolunda bələdçi</span>
          <h1 id="mentor-title">
            Mentorunu tap.<br />
            Növbəti addımı <em>özün seç.</em>
          </h1>
        </div>
        <div className="mentor-heading-aside">
          <span><Sparkles size={13} /> Diqqətlə uyğunlaşdırılır</span>
          <p>
            Hazırda verdiyin suallarla vaxtilə üzləşmiş biri ilə birlikdə öyrən.
            Soyuq tanışlıqlar da, süni əlaqələr də yoxdur.
          </p>
        </div>
      </motion.div>

      <motion.div layout className="mentor-grid" aria-label="Mentor siyahısı">
        {mentors.map((mentor, index) => {
          const expanded = expandedId === mentor.id;
          const requested = requestedIds.has(mentor.id);
          const detailsId = `mentor-details-${mentor.id}`;
          const triggerId = `mentor-trigger-${mentor.id}`;

          return (
            <motion.article
              layout
              key={mentor.id}
              className={`mentor-card${expanded ? " is-expanded" : ""}`}
              style={{
                "--mentor-accent": mentor.accent,
                "--mentor-glow": mentor.glow,
              } as CSSProperties}
              initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={reduceMotion || expanded ? undefined : { y: -5, scale: 1.012 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                layout: { duration: reduceMotion ? 0 : 0.52, ease },
                opacity: { duration: 0.55, delay: index * 0.035 },
                y: { duration: 0.55, delay: index * 0.035, ease },
              }}
            >
              <button
                id={triggerId}
                type="button"
                className="mentor-card-trigger"
                onClick={() => setExpandedId(expanded ? null : mentor.id)}
                aria-expanded={expanded}
                aria-controls={detailsId}
              >
                <span className="mentor-card-index">{String(index + 1).padStart(2, "0")}</span>
                <motion.span
                  layout="position"
                  className="mentor-avatar"
                  aria-hidden="true"
                >
                  <span>{mentor.initials}</span>
                  <i />
                </motion.span>

                <motion.span layout="position" className="mentor-identity">
                  <small>{mentor.role}</small>
                  <strong>{mentor.name}</strong>
                  <span>{mentor.focus}</span>
                </motion.span>

                <span className="mentor-expand-icon" aria-hidden="true">
                  {expanded ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    id={detailsId}
                    className="mentor-details"
                    role="region"
                    aria-labelledby={triggerId}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.48, ease }}
                  >
                    <div className="mentor-details-inner">
                      <div className="mentor-story">
                        <p>{mentor.bio}</p>
                        <blockquote>{mentor.outcome}</blockquote>
                      </div>

                      <div className="mentor-practice">
                        <span className="mentor-label">İxtisas sahələri</span>
                        <div className="mentor-expertise">
                          {mentor.expertise.map((item) => <span key={item}>{item}</span>)}
                        </div>

                        <span className="mentor-label mentor-availability-label">Uyğun vaxtlar</span>
                        <div className="mentor-availability">
                          {mentor.availability.map((slot) => <span key={slot}>{slot}</span>)}
                        </div>
                      </div>

                      <div className="mentor-request-panel">
                        <div className="mentor-facts">
                          <span><MapPin size={13} /> {mentor.location} · {mentor.timezone}</span>
                          <span><Clock3 size={13} /> {mentor.responseTime}</span>
                          <span>{mentor.experience}</span>
                        </div>

                        <motion.button
                          type="button"
                          className={`mentor-request${requested ? " is-requested" : ""}`}
                          onClick={() => !requested && requestMentorship(mentor.id)}
                          aria-pressed={requested}
                          aria-disabled={requested}
                          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                          animate={requested && !reduceMotion ? { scale: [1, 1.06, 1] } : undefined}
                          transition={{ duration: reduceMotion ? 0 : 0.42, ease, times: [0, 0.52, 1] }}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={requested ? "requested" : "request"}
                              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                            >
                              {requested ? <Check size={16} strokeWidth={2.4} /> : <Sparkles size={15} />}
                              {requested ? "Müraciət göndərildi" : "Mentorluq üçün müraciət et"}
                            </motion.span>
                          </AnimatePresence>
                          {requested && !reduceMotion && (
                            <span className="mentor-success-burst" aria-hidden="true">
                              <i /><i /><i /><i />
                            </span>
                          )}
                        </motion.button>
                        <span className="sr-only" aria-live="polite">
                          {requested ? `${mentor.name} üçün mentorluq müraciəti göndərildi.` : ""}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
