"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import type { CSSProperties } from "react";
import type { TeacherReview } from "../data/teachers";

type ReviewCardProps = {
  review: TeacherReview;
  index: number;
};

export function ReviewCard({ review, index }: ReviewCardProps) {
  const reduceMotion = useReducedMotion();

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
      <div className="review-author">
        <span>{review.initials}</span>
        <div>
          <strong>{review.author}</strong>
          <small>{review.teacherName} · {review.date}</small>
        </div>
      </div>
    </motion.article>
  );
}
