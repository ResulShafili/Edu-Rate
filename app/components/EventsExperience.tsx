"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  categories,
  eventCategoryLabels,
  events,
  type Event,
  type EventFilter,
} from "../data/events";
import { getTemporalStatus, sortByStartAt } from "../lib/date";
import { EventCard } from "./EventCard";
import { EventDrawer } from "./EventDrawer";
import { EmptyState } from "./ui/Primitives";

type EventPeriod = "upcoming" | "past";

export function EventsExperience() {
  const [activeFilter, setActiveFilter] = useState<EventFilter>("All");
  const [period, setPeriod] = useState<EventPeriod>("upcoming");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const reduceMotion = useReducedMotion();
  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("az");
    return sortByStartAt(events).filter((event) => {
      const temporal = getTemporalStatus(event.startAt, event.endAt);
      const matchesPeriod = period === "upcoming" ? temporal !== "finished" : temporal === "finished";
      const matchesCategory = activeFilter === "All" || event.category === activeFilter;
      const matchesDate = !dateFilter || event.startAt.slice(0, 10) === dateFilter;
      const matchesQuery = !normalizedQuery || `${event.title} ${event.location} ${event.organizer}`.toLocaleLowerCase("az").includes(normalizedQuery);
      return matchesPeriod && matchesCategory && matchesDate && matchesQuery;
    });
  }, [activeFilter, dateFilter, period, query]);
  const closeDrawer = useCallback(() => setSelectedEvent(null), []);

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
          <p>Maraq dairənə uyğun kampus tədbirlərini axtar və qeydiyyat vəziyyətini yoxla.</p>
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

        {visibleEvents.length ? (
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
    </>
  );
}
