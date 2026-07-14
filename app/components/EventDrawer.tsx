"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, MapPin, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { Event } from "../data/events";

type EventDrawerProps = {
  event: Event | null;
  onClose: () => void;
};

export function EventDrawer({ event, onClose }: EventDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!event) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 350);

    function onKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") onClose();
      if (keyEvent.key !== "Tab") return;

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (keyEvent.shiftKey && document.activeElement === first) {
        keyEvent.preventDefault();
        last.focus();
      } else if (!keyEvent.shiftKey && document.activeElement === last) {
        keyEvent.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="drawer-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="presentation"
        >
          <motion.button
            type="button"
            className="drawer-backdrop"
            aria-label="Close event details"
            onClick={onClose}
          />

          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-drawer-title"
            className="event-drawer"
            style={{
              "--event-accent": event.accent,
              "--event-glow": event.glow,
            } as CSSProperties}
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 155, damping: 24, mass: 0.8 }}
          >
            <div className="drawer-noise" aria-hidden="true" />
            <div className="drawer-topline">
              <span>Event / {event.category}</span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="drawer-close"
                aria-label="Close event details"
              >
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>

            <div
              className="drawer-visual"
              aria-hidden="true"
            >
              <motion.div
                className="drawer-orb drawer-orb-one"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="drawer-orb drawer-orb-two"
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <Sparkles size={26} strokeWidth={1.25} />
            </div>

            <div className="drawer-content">
              <span className="drawer-kicker">A gathered experience</span>
              <h2 id="event-drawer-title">{event.title}</h2>
              <p className="drawer-description">{event.longDescription}</p>

              <div className="drawer-facts">
                <div><CalendarDays size={17} /><span>{event.date} {event.month}</span></div>
                <div><Clock3 size={17} /><span>{event.time}</span></div>
                <div><MapPin size={17} /><span>{event.location}, {event.city}</span></div>
              </div>

              <div className="drawer-hosts">
                <span>Featuring</span>
                <p>{event.speakers.join(" · ")}</p>
              </div>

              <div className="drawer-bottom">
                <span>{event.capacity}</span>
                <button type="button" className="reserve-button">
                  Reserve a place <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
