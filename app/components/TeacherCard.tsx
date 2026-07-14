"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check, MapPin, Star, Users } from "lucide-react";
import { useRef, type CSSProperties, type RefObject } from "react";
import type { Teacher } from "../data/teachers";

const studentFormatter = new Intl.NumberFormat("az-AZ");
const ratingFormatter = new Intl.NumberFormat("az-AZ", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type TeacherCardProps = {
  teacher: Teacher;
  index: number;
  selected: boolean;
  scrollContainer: RefObject<HTMLDivElement | null>;
  onSelect: (teacher: Teacher) => void;
};

export function TeacherCard({ teacher, index, selected, scrollContainer, onSelect }: TeacherCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollXProgress } = useScroll({
    container: scrollContainer,
    target: cardRef,
    axis: "x",
    offset: ["start end", "end start"],
  });
  const portraitX = useTransform(scrollXProgress, [0, 1], [-30, 30]);
  const portraitScale = useTransform(scrollXProgress, [0, 0.5, 1], [1.1, 1.04, 1.1]);

  return (
    <motion.article
      ref={cardRef}
      className={`teacher-card${selected ? " is-selected" : ""}`}
      role="listitem"
      style={{
        "--teacher-accent": teacher.accent,
        "--teacher-glow": teacher.glow,
      } as CSSProperties}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.58, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="teacher-image" aria-hidden="true">
        <motion.div
          className="teacher-image-source"
          style={{
            x: reduceMotion ? 0 : portraitX,
            scale: reduceMotion ? 1.04 : portraitScale,
            backgroundPosition: `${teacher.imagePosition} 54%`,
          }}
        />
        <span className="teacher-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="teacher-availability"><i /> {teacher.availability}</span>
        <span className="teacher-rating"><Star size={12} fill="currentColor" /> {ratingFormatter.format(teacher.rating)}</span>
      </div>

      <div className="teacher-card-body">
        <span className="teacher-subject">{teacher.subject}</span>
        <h3>{teacher.name}</h3>
        <p>{teacher.bio}</p>

        <div className="teacher-card-meta">
          <span><MapPin size={12} /> {teacher.city}</span>
          <span><Users size={12} /> {studentFormatter.format(teacher.studentsCount)} tələbə</span>
        </div>

        <div className="teacher-card-footer">
          <span>{teacher.experience}</span>
          <button
            type="button"
            className={selected ? "is-selected" : ""}
            onClick={() => onSelect(teacher)}
            aria-pressed={selected}
            aria-label={selected ? `${teacher.name} seçilib` : `${teacher.name} müəllimi seç`}
          >
            {selected && <Check size={14} />}
            {selected ? "Seçildi" : "Müəllimi seç"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
