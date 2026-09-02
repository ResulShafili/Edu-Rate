"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Compass, MessageCircleQuestion, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";

type Trail = {
  joinedAt: string;
  clubs: number;
  clubNames: string[];
  eventsAttended: number;
  eventsUpcoming: number;
  reviews: number;
  questions: number;
  answers: number;
  lessons: number;
};

/**
 * "Kampus izi" — profildə real fəaliyyətin xülasəsi.
 *
 * Qəsdən xal/səviyyə sistemi DEYİL: hər rəqəm tələbənin həqiqətən etdiyi
 * bir işi göstərir. Heç bir fəaliyyət yoxdursa bölmə göstərilmir.
 */
export function CampusTrail() {
  const reduceMotion = Boolean(useReducedMotion());
  const [trail, setTrail] = useState<Trail | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/trail", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { data: null }))
      .then((payload: { data?: Trail | null }) => {
        if (!cancelled) setTrail(payload.data ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!trail) return null;

  const total = trail.clubs + trail.eventsAttended + trail.eventsUpcoming + trail.reviews + trail.questions + trail.answers + trail.lessons;
  if (total === 0) return null;

  const items = [
    { icon: Compass, value: trail.clubs, label: "klub üzvlüyü", hint: trail.clubNames.join(", ") },
    { icon: CalendarCheck, value: trail.eventsAttended, label: "tədbirdə iştirak", hint: trail.eventsUpcoming ? `${trail.eventsUpcoming} qarşıdan gələn` : "" },
    { icon: Star, value: trail.reviews, label: "təsdiqlənmiş rəy", hint: "" },
    { icon: MessageCircleQuestion, value: trail.questions + trail.answers, label: "sual və cavab", hint: trail.answers ? `${trail.answers} cavab` : "" },
  ].filter((item) => item.value > 0);

  const since = new Intl.DateTimeFormat("az-AZ", { month: "long", year: "numeric" }).format(new Date(trail.joinedAt));

  return (
    <motion.section
      className="campus-trail"
      aria-labelledby="campus-trail-title"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <header>
        <h2 id="campus-trail-title"><Sparkles size={15} /> Kampus izin</h2>
        <small>{since} tarixindən bəri</small>
      </header>
      <div className="campus-trail__grid">
        {items.map(({ icon: Icon, value, label, hint }) => (
          <div key={label} className="campus-trail__item">
            <span className="campus-trail__icon" aria-hidden="true"><Icon size={16} /></span>
            <strong>{value}</strong>
            <small>{label}</small>
            {hint ? <em>{hint}</em> : null}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
