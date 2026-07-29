"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flag, Quote, Star } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { TeacherReview } from "../data/teachers";
import { criteriaLabels, type ReviewCriterionKey } from "./CriteriaRating";

type ReviewCardProps = {
  review: TeacherReview;
  index: number;
};

export function ReviewCard({ review, index }: ReviewCardProps) {
  const reduceMotion = useReducedMotion();
  const criterionHighlights = review.criteria
    ? (Object.entries(review.criteria) as Array<[ReviewCriterionKey, number]>)
        .sort(([, first], [, second]) => second - first)
        .slice(0, 2)
    : [];

  return (
    <motion.article
      className={`review-card${review.featured ? " is-featured" : ""}`}
      style={{ "--review-accent": review.accent } as CSSProperties}
      initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.62, delay: Math.min(index * 0.055, 0.32), ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="review-topline">
        <span>{review.course}</span>
        <Quote size={17} />
      </div>
      <p>{review.text}</p>
      <div className="review-stars" aria-label={`${review.rating} ulduz`}> 
        {Array.from({ length: 5 }, (_, star) => (
          <Star key={star} size={12} fill={star < review.rating ? "currentColor" : "none"} />
        ))}
      </div>
      {criterionHighlights.length > 0 && (
        <dl className="review-criteria" aria-label="Rəydə önə çıxan meyarlar">
          {criterionHighlights.map(([criterion, score]) => (
            <div key={criterion}>
              <dt>{criteriaLabels[criterion]}</dt>
              <dd>{score}/5</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="review-author">
        <span>{review.initials}</span>
        <div>
          <strong>{review.author}</strong>
          <small>{review.teacherName} · {review.date}</small>
        </div>
        <Link href={`/support?topic=review&review=${encodeURIComponent(review.id)}`} className="review-report" aria-label={`${review.teacherName} haqqında rəyi bildir`} title="Rəyi bildir"><Flag size={14} aria-hidden="true" /></Link>
      </div>
    </motion.article>
  );
}
