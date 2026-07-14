"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { CSSProperties, MouseEvent } from "react";
import {
  eventCategoryLabels,
  eventMonthLabels,
  eventMonthLongLabels,
  type Event,
} from "../data/events";

type EventCardProps = {
  event: Event;
  index: number;
  onSelect: (event: Event) => void;
};

export function EventCard({ event, index, onSelect }: EventCardProps) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [5, -5]), {
    stiffness: 220,
    damping: 26,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-6, 6]), {
    stiffness: 220,
    damping: 26,
  });

  function handleMove(event: MouseEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  function resetTilt() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <motion.article
      layout
      layoutId={`card-${event.id}`}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
      transition={{
        layout: { type: "spring", stiffness: 210, damping: 26 },
        opacity: { duration: 0.35, delay: index * 0.035 },
        y: { duration: 0.45, delay: index * 0.035 },
      }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      className="event-card group"
    >
      <button
        type="button"
        onClick={() => onSelect(event)}
        className="event-card-button"
        aria-label={`${event.title} tədbirinin təfərrüatlarına bax`}
      >
        <div
          className="event-art"
          style={{
            "--event-accent": event.accent,
            "--event-glow": event.glow,
          } as CSSProperties}
        >
          <div className="event-art-orbit event-art-orbit-one" />
          <div className="event-art-orbit event-art-orbit-two" />
          <div className="event-art-core" />
          <span className="event-category">{eventCategoryLabels[event.category]}</span>
          <span className="event-time">{event.time}</span>
        </div>

        <div className="event-card-content">
          <div
            className="event-date"
            aria-label={`${event.date} ${eventMonthLongLabels[event.month]}`}
          >
            <span>{event.date}</span>
            <small>{eventMonthLabels[event.month]}</small>
          </div>
          <div className="event-copy">
            <div className="event-title-row">
              <h3>{event.title}</h3>
              <span className="event-arrow" aria-hidden="true">
                <ArrowUpRight size={18} strokeWidth={1.8} />
              </span>
            </div>
            <p>{event.description}</p>
            <span className="event-location">
              <MapPin size={13} strokeWidth={1.8} />
              {event.city} · {event.location}
            </span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}
