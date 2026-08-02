"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { mentors } from "../data/mentors";
import { useAuth } from "./AuthProvider";
import { ErrorState, Skeleton } from "./ui/Primitives";

const ease = [0.22, 1, 0.36, 1] as const;

export function MentorshipDashboard() {
  const [availableMentorIds, setAvailableMentorIds] = useState<Set<string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(() => new Set());
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [day, setDay] = useState("all");
  const [language, setLanguage] = useState("all");
  const [response, setResponse] = useState("all");
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();

  const loadMentors = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/catalog/mentors", { cache: "no-store" });
      const payload = await response.json() as { data?: Array<{ id: string; available: boolean }>; error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Mentorlar yüklənmədi.");
      if (!Array.isArray(payload.data)) throw new Error("Mentor məlumatları düzgün formatda deyil.");
      setAvailableMentorIds(new Set(payload.data.filter((mentor) => mentor.available).map((mentor) => mentor.id)));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Mentorlar yüklənmədi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMentors(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMentors]);

  useEffect(() => {
    if (!user) {
      const timer = window.setTimeout(() => setRequestedIds(new Set()), 0);
      return () => window.clearTimeout(timer);
    }
    void fetch("/api/mentorship/requests", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { data?: Array<{ mentorId: string; status: string }> };
        if (response.ok && Array.isArray(payload.data)) {
          setRequestedIds(new Set(payload.data.filter((item) => item.status === "pending").map((item) => item.mentorId)));
        }
      })
      .catch(() => undefined);
  }, [user]);

  const filteredMentors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("az");
    return mentors.filter((mentor) => {
      if (!availableMentorIds?.has(mentor.id)) return false;
      const matchesQuery = !normalized || `${mentor.name} ${mentor.role} ${mentor.expertise.join(" ")}`.toLocaleLowerCase("az").includes(normalized);
      const matchesDay = day === "all" || mentor.availability.some((slot) => slot.startsWith(day));
      const matchesLanguage = language === "all" || mentor.languages.includes(language);
      const fastResponse = /4 saat|6 saat|8 saat/.test(mentor.responseTime);
      const matchesResponse = response === "all" || (response === "fast" ? fastResponse : !fastResponse);
      return matchesQuery && matchesDay && matchesLanguage && matchesResponse && (mode === "all" || mentor.mode === mode);
    });
  }, [availableMentorIds, day, language, mode, query, response]);

  async function requestMentorship(mentorId: string) {
    if (requestingId) return;
    setRequestingId(mentorId);
    setRequestError("");
    try {
      const response = await fetch("/api/mentorship/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mentorId }),
      });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Müraciət göndərilmədi.");
      setRequestedIds((current) => new Set(current).add(mentorId));
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Müraciət göndərilmədi.");
    } finally {
      setRequestingId(null);
    }
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
          <span className="mentor-kicker">Mentorluq</span>
          <h1 id="mentor-title" className="module-page-title">Mentorlar</h1>
        </div>
        <div className="mentor-heading-aside">
          <span><Sparkles size={13} /> Uyğun mentorunu tap</span>
        </div>
      </motion.div>

      <div className="mentor-filters" aria-label="Mentor filtrləri">
        <label><span>Ad və ya ixtisas</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Məsələn, məhsul strategiyası" /></label>
        <label><span>Görüş formatı</span><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="all">Bütün formatlar</option><option value="Onlayn">Onlayn</option><option value="Əyani">Əyani</option><option value="Hibrid">Hibrid</option></select></label>
        <label><span>Uyğun gün</span><select value={day} onChange={(event) => setDay(event.target.value)}><option value="all">Bütün günlər</option><option value="Bazar ertəsi">Bazar ertəsi</option><option value="Çərşənbə axşamı">Çərşənbə axşamı</option><option value="Çərşənbə">Çərşənbə</option><option value="Cümə axşamı">Cümə axşamı</option><option value="Cümə">Cümə</option><option value="Şənbə">Şənbə</option><option value="Bazar">Bazar</option></select></label>
        <label><span>Dil</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="all">Bütün dillər</option><option value="Azərbaycan dili">Azərbaycan dili</option><option value="İngilis dili">İngilis dili</option></select></label>
        <label><span>Cavab vaxtı</span><select value={response} onChange={(event) => setResponse(event.target.value)}><option value="all">Fərq etmir</option><option value="fast">8 saata qədər</option><option value="daily">Bir günədək</option></select></label>
      </div>

      {isLoading ? (
        <div className="mentor-grid mentor-skeleton-grid" aria-label="Mentorlar yüklənir">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="mentor-card-skeleton" />)}
        </div>
      ) : loadError ? (
        <ErrorState title="Mentorları göstərmək mümkün olmadı" description={loadError} action={<button type="button" className="kuds-primary-button" onClick={() => void loadMentors()}>Yenidən yoxla</button>} />
      ) : (
      <motion.div layout className="mentor-grid" aria-label="Mentor siyahısı">
        {filteredMentors.map((mentor, index) => {
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
                  <span className="mentor-summary-facts">{mentor.mode} · {mentor.responseTime.replace("Adətən ", "")}</span>
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
                          <span>{mentor.experience} · {mentor.mode}</span>
                          <span>{mentor.languages.join(" · ")}</span>
                        </div>

                        {user ? <motion.button
                          type="button"
                          className={`mentor-request${requested ? " is-requested" : ""}`}
                          onClick={() => !requested && void requestMentorship(mentor.id)}
                          aria-pressed={requested}
                          aria-disabled={requested || requestingId === mentor.id}
                          disabled={requested || requestingId === mentor.id}
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
                              {requested ? "Müraciət göndərildi" : requestingId === mentor.id ? "Göndərilir…" : "Mentorluq üçün müraciət et"}
                            </motion.span>
                          </AnimatePresence>
                          {requested && !reduceMotion && (
                            <span className="mentor-success-burst" aria-hidden="true">
                              <i /><i /><i /><i />
                            </span>
                          )}
                        </motion.button> : <Link className="mentor-request" href="/auth?returnTo=%2Fmentors">Müraciət üçün daxil ol <ArrowUpRight size={15} /></Link>}
                        {requestError && expanded && <p className="mentor-request-error" role="alert">{requestError}</p>}
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
        {filteredMentors.length === 0 && <div className="mentor-filter-empty">Bu filtrlərə uyğun mentor tapılmadı.</div>}
      </motion.div>
      )}
    </section>
  );
}
