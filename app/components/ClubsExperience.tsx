"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Club } from "../data/clubs";
import { ClubCard } from "./ClubCard";

type ClubsExperienceProps = {
  clubs: readonly Club[];
};

export function ClubsExperience({ clubs }: ClubsExperienceProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="clubs-experience">
      <section className="clubs-hero" aria-labelledby="clubs-directory-title">
        <motion.div
          className="clubs-hero-copy"
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <span className="clubs-hero-eyebrow">
            <Sparkles size={13} strokeWidth={1.8} aria-hidden="true" />
            07 / Tələbə birlikləri
          </span>
          <h1 id="clubs-directory-title" className="module-page-title">
            Klublar və icmalar
          </h1>
        </motion.div>

        <motion.p
          className="clubs-hero-note"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.62, delay: 0.12, ease: [0.22, 1, 0.36, 1] }
          }
        >
          Yeni bacarıq, ortaq fikir və mənalı tanışlıq üçün kampusun açıq
          tələbə məkanlarını sakit bir kataloqda kəşf et.
        </motion.p>

        <div className="clubs-hero-art" aria-hidden="true">
          <span className="clubs-hero-art-orbit clubs-hero-art-orbit-one" />
          <span className="clubs-hero-art-orbit clubs-hero-art-orbit-two" />
          <span className="clubs-hero-art-core" />
          <span className="clubs-hero-art-label">EDU / 07</span>
        </div>
      </section>

      <section className="clubs-directory" aria-labelledby="clubs-list-title">
        <header className="clubs-section-heading">
          <div>
            <span>Klublar və təşkilatlar</span>
            <h2 id="clubs-list-title">Klub kataloqu</h2>
          </div>
          <p>
            Hər kartın arxasında açıq görüşlər, şəffaf proqram və səni gözləyən
            bir komanda var.
          </p>
        </header>

        <div className="clubs-directory-grid">
          {clubs.map((club, index) => (
            <ClubCard key={club.slug} club={club} index={index} />
          ))}
        </div>
      </section>

    </div>
  );
}
