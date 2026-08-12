"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Club } from "../data/clubs";
import { ClubCard } from "./ClubCard";

type ClubsExperienceProps = {
  clubs: readonly Club[];
  failed?:boolean;
};

export function ClubsExperience({ clubs, failed=false }: ClubsExperienceProps) {
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
            Tələbə birlikləri
          </span>
          <h1 id="clubs-directory-title" className="module-page-title">
            Klublar və icmalar
          </h1>
        </motion.div>
      </section>

      <section className="clubs-directory" aria-labelledby="clubs-list-title">
        <header className="clubs-section-heading">
          <div>
            <span>Klublar və təşkilatlar</span>
            <h2 id="clubs-list-title">Klub kataloqu</h2>
          </div>
        </header>

        {failed ? <div className="clubs-catalog-state" role="alert"><strong>Klub kataloqu yüklənmədi.</strong><p>Bağlantını yoxlayıb səhifəni yenidən açın.</p></div>
        : clubs.length===0 ? <div className="clubs-catalog-state"><strong>Aktiv klub yoxdur.</strong><p>Yeni klublar təsdiqləndikdə burada görünəcək.</p></div>
        : <div className="clubs-directory-grid">
          {clubs.map((club, index) => (
            <ClubCard key={club.slug} club={club} index={index} />
          ))}
        </div>}
      </section>

    </div>
  );
}
