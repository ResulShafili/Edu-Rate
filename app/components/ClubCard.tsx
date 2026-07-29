"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, CalendarDays, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import type { Club } from "../data/clubs";

type ClubCardProps = {
  club: Club;
  index: number;
};

const parallaxSpring = {
  stiffness: 150,
  damping: 24,
  mass: 0.55,
} as const;

function clampPointer(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function ClubCard({ club, index }: ClubCardProps) {
  const reducedMotion = useReducedMotion();
  const boundsRef = useRef<DOMRect | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const artX = useSpring(useTransform(pointerX, [-1, 1], [-18, 18]), parallaxSpring);
  const artY = useSpring(useTransform(pointerY, [-1, 1], [-14, 14]), parallaxSpring);
  const artRotate = useSpring(
    useTransform(pointerX, [-1, 1], [-1.8, 1.8]),
    parallaxSpring,
  );
  const contentX = useSpring(
    useTransform(pointerX, [-1, 1], [3, -3]),
    parallaxSpring,
  );
  const contentY = useSpring(
    useTransform(pointerY, [-1, 1], [2, -2]),
    parallaxSpring,
  );

  function updateParallax(event: PointerEvent<HTMLElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;

    const bounds = boundsRef.current ?? event.currentTarget.getBoundingClientRect();
    boundsRef.current = bounds;
    pointerX.set(clampPointer(((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    pointerY.set(clampPointer(((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
  }

  function resetParallax() {
    boundsRef.current = null;
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.article
      className="club-directory-card"
      data-tone={club.tone}
      initial={reducedMotion ? false : { opacity: 0, y: 42, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: 0.72,
              delay: Math.min(index * 0.055, 0.22),
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onPointerEnter={(event) => {
        if (!reducedMotion && event.pointerType === "mouse") {
          boundsRef.current = event.currentTarget.getBoundingClientRect();
        }
      }}
      onPointerMove={updateParallax}
      onPointerLeave={resetParallax}
      style={{ "--club-sequence": index + 1 } as CSSProperties}
    >
      <Link
        href={`/clubs/${club.slug}`}
        className="club-directory-link"
        aria-label={`${club.name} səhifəsinə keç`}
      >
        <div className="club-card-visual" aria-hidden="true">
          <motion.div
            className="club-card-art"
            style={{ x: artX, y: artY, rotate: artRotate }}
          >
            <span className="club-card-art-grid" />
            <span className="club-card-art-orbit club-card-art-orbit-primary" />
            <span className="club-card-art-orbit club-card-art-orbit-secondary" />
            <span className="club-card-art-glow" />
            <span className="club-card-visual-mark">{club.visualMark}</span>
          </motion.div>
          <span className="club-card-visual-label">Açıq tələbə məkanı</span>
        </div>

        <motion.div className="club-card-content" style={{ x: contentX, y: contentY }}>
          <div className="club-card-topline">
            <span className="club-card-category">{club.category}</span>
            <span className="club-card-arrow" aria-hidden="true">
              <ArrowUpRight size={20} strokeWidth={1.7} />
            </span>
          </div>

          <div className="club-card-copy">
            <h2>{club.name}</h2>
            <p className="club-card-tagline">{club.tagline}</p>
          </div>

          <div className="club-card-footer">
            <div className="club-card-meta">
              <span>
                <UsersRound size={15} strokeWidth={1.7} aria-hidden="true" />
                {club.stats[0]?.value ?? "—"} {club.stats[0]?.label.toLocaleLowerCase("az-AZ")}
              </span>
              <span>
                <CalendarDays size={15} strokeWidth={1.7} aria-hidden="true" />
                {club.meeting.cadence}
              </span>
            </div>
            <span className="club-card-action">Kluba bax <ArrowUpRight size={15} aria-hidden="true" /></span>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}
