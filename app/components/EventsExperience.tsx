"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import {
  categories,
  eventCategoryLabels,
  events,
  type Event,
  type EventFilter,
} from "../data/events";
import { EventCard } from "./EventCard";
import { EventDrawer } from "./EventDrawer";

export function EventsExperience() {
  const [activeFilter, setActiveFilter] = useState<EventFilter>("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const reduceMotion = useReducedMotion();
  const visibleEvents = events.filter(
    (event) => activeFilter === "All" || event.category === activeFilter,
  );
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
            <span className="section-kicker">01 / Təqvim</span>
            <h1 id="events-title">Növbəti yaxşı hekayən<br /><em>burada başlasın.</em></h1>
          </div>
          <p>Kiçik qruplar, böyük ideyalar və tanış olduğuna sevinəcəyin insanlar.</p>
        </motion.div>

        <motion.div
          className="filters-row"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
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
                {activeFilter === category && <motion.span className="filter-pill" layoutId="active-event-filter" />}
                <span>{eventCategoryLabels[category]}</span>
              </button>
            ))}
          </div>
          <span className="event-count">{String(visibleEvents.length).padStart(2, "0")} tədbir</span>
        </motion.div>

        <motion.div layout className="events-grid">
          <AnimatePresence mode="popLayout">
            {visibleEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} onSelect={setSelectedEvent} />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
      <EventDrawer event={selectedEvent} onClose={closeDrawer} />
    </>
  );
}
