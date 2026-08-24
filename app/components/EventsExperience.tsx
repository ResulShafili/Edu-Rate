"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  categories,
  eventCategoryLabels,
  mapApiEvent,
  type ApiEvent,
  type Event,
  type EventFilter,
} from "../data/events";
import { getTemporalStatus, sortByStartAt } from "../lib/date";
import { EventCard } from "./EventCard";
import { EventDrawer } from "./EventDrawer";
import { EmptyState, ErrorState, Skeleton } from "./ui/Primitives";
import { useAuth } from "./AuthProvider";
import { EventSubmissionDialog } from "./EventSubmissionDialog";

type EventPeriod = "upcoming" | "past";

export function EventsExperience() {
  const {user}=useAuth();
  const [eventItems, setEventItems] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventFilter>("All");
  const [period, setPeriod] = useState<EventPeriod>("upcoming");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [createOpen,setCreateOpen]=useState(false);
  const canCreate=Boolean(user?.accessRole&&["teacher","admin","assistant_admin","owner_admin"].includes(user.accessRole));
  const publishesDirectly=Boolean(user?.accessRole&&["admin","assistant_admin","owner_admin"].includes(user.accessRole));
  const reduceMotion = useReducedMotion();
  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("az");
    return sortByStartAt(eventItems).filter((event) => {
      const temporal = getTemporalStatus(event.startAt, event.endAt);
      const matchesPeriod = period === "upcoming" ? temporal !== "finished" : temporal === "finished";
      const matchesCategory = activeFilter === "All" || event.category === activeFilter;
      const matchesDate = !dateFilter || event.startAt.slice(0, 10) === dateFilter;
      const matchesQuery = !normalizedQuery || `${event.title} ${event.location} ${event.organizer}`.toLocaleLowerCase("az").includes(normalizedQuery);
      return matchesPeriod && matchesCategory && matchesDate && matchesQuery;
    });
  }, [activeFilter, dateFilter, eventItems, period, query]);
  const closeDrawer = useCallback(() => setSelectedEvent(null), []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/catalog/events", { cache: "no-store" });
      const payload = await response.json() as { data?: ApiEvent[]; error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Tədbirlər yüklənmədi.");
      if (!Array.isArray(payload.data)) throw new Error("Tədbir məlumatları düzgün formatda deyil.");
      setEventItems(payload.data.map(mapApiEvent));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Tədbirlər yüklənmədi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvents(), 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  return (
    <>
      <section id="events" className="events-section route-module-section" aria-labelledby="events-title">
        <motion.div
          className="section-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <span className="section-kicker">Kampus təqvimi</span>
            <h1 id="events-title" className="module-page-title">Tədbirlər</h1>
          </div>
          {canCreate?<button type="button" className="event-create-trigger" onClick={()=>setCreateOpen(true)}><Plus size={17}/>Tədbir yarat</button>:null}
        </motion.div>

        <motion.div
          className="filters-row"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="event-period-tabs" role="tablist" aria-label="Tədbir dövrü">
            {(["upcoming", "past"] as const).map((value) => (
              <button key={value} type="button" role="tab" aria-selected={period === value} className={period === value ? "active" : ""} onClick={() => setPeriod(value)}>{value === "upcoming" ? "Gələcək" : "Keçmiş"}</button>
            ))}
          </div>
          <label className="event-search-field"><Search size={16} aria-hidden="true" /><span className="sr-only">Tədbir axtar</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tədbir və ya təşkilatçı axtar" /></label>
          <label className="event-date-field"><span className="sr-only">Tarixə görə süzgəc</span><input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>
        </motion.div>

        <div className="filters-row event-category-row">
          <div className="filters" role="group" aria-label="Tədbirləri kateqoriyaya görə süzgəcdən keçir">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeFilter === category ? "active" : ""}
                onClick={() => setActiveFilter(category)}
                aria-pressed={activeFilter === category}
              >
                {activeFilter === category && <motion.span className="filter-pill" layoutId="active-event-filter" />}
                <span>{eventCategoryLabels[category]}</span>
              </button>
            ))}
          </div>
          <span className="event-count">{visibleEvents.length} tədbir</span>
        </div>

        {isLoading ? (
          <div className="events-grid event-skeleton-grid" aria-label="Tədbirlər yüklənir">
            {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="event-card-skeleton" />)}
          </div>
        ) : loadError ? (
          <ErrorState title="Tədbirləri göstərmək mümkün olmadı" description={loadError} action={<button type="button" className="kuds-primary-button" onClick={() => void loadEvents()}>Yenidən yoxla</button>} />
        ) : visibleEvents.length ? (
          <motion.div layout className="events-grid">
            <AnimatePresence mode="popLayout">
              {visibleEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} onSelect={setSelectedEvent} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState title="Uyğun tədbir tapılmadı" description="Axtarış sözünü, tarixi və ya kateqoriya seçimini dəyişərək yenidən yoxla." action={<button type="button" className="kuds-primary-button" onClick={() => { setQuery(""); setDateFilter(""); setActiveFilter("All"); }}>Filtrləri təmizlə</button>} />
        )}
      </section>
      <EventDrawer event={selectedEvent} onClose={closeDrawer} />
      <EventSubmissionDialog open={createOpen} onClose={()=>setCreateOpen(false)} onCreated={()=>void loadEvents()} organizerName={user?.name??""} publishesDirectly={publishesDirectly}/>
    </>
  );
}
