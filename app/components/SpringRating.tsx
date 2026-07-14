"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type SpringRatingProps = {
  teacherName: string;
  value: number;
  onChange: (value: number) => void;
};

const starPath =
  "M12 2.75 14.85 8.5l6.35.92-4.6 4.48 1.09 6.32L12 17.23l-5.69 2.99 1.09-6.32-4.6-4.48 6.35-.92L12 2.75Z";

export function SpringRating({ teacherName, value, onChange }: SpringRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 260, damping: 24, mass: 0.55 });
  const springY = useSpring(pointerY, { stiffness: 260, damping: 24, mass: 0.55 });
  const reduceMotion = useReducedMotion();
  const visibleValue = hoveredValue ?? value;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width);
    const relativeY = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height);
    const nextValue = Math.min(5, Math.max(1, Math.ceil((relativeX / bounds.width) * 5)));
    pointerX.set(relativeX);
    pointerY.set(relativeY);
    setHoveredValue(nextValue);
  }

  function handleKeyboard(event: KeyboardEvent<HTMLButtonElement>, currentValue: number) {
    let nextValue = currentValue;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") nextValue = Math.min(5, currentValue + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextValue = Math.max(1, currentValue - 1);
    if (event.key === "Home") nextValue = 1;
    if (event.key === "End") nextValue = 5;

    if (nextValue === currentValue && !["Home", "End"].includes(event.key)) return;
    event.preventDefault();
    onChange(nextValue);
    starRefs.current[nextValue - 1]?.focus();
  }

  return (
    <div
      ref={groupRef}
      className="rating-stars"
      role="radiogroup"
      aria-label={`${teacherName} üçün 5 ulduz üzərindən qiymətləndirmə`}
      aria-required="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoveredValue(null)}
    >
      {!reduceMotion && hoveredValue !== null && (
        <motion.span className="rating-cursor" style={{ x: springX, y: springY }} aria-hidden="true">
          <i />
        </motion.span>
      )}

      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const active = rating <= visibleValue;
        return (
          <motion.button
            ref={(node) => { starRefs.current[index] = node; }}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} ulduz seç`}
            key={rating}
            className={active ? "is-active" : ""}
            tabIndex={value === rating || (value === 0 && rating === 1) ? 0 : -1}
            onClick={() => onChange(rating)}
            onKeyDown={(event) => handleKeyboard(event, rating)}
            onFocus={() => setHoveredValue(rating)}
            onBlur={() => setHoveredValue(null)}
            animate={active ? { y: -2, scale: 1.06 } : { y: 0, scale: 1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.88 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={starPath} />
            </svg>
          </motion.button>
        );
      })}

      <span className="rating-value" aria-live="polite">
        {visibleValue > 0 ? `${visibleValue},0` : "—"}
      </span>
    </div>
  );
}
