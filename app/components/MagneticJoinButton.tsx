"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useState, type PointerEvent } from "react";

const magneticSpring = {
  stiffness: 270,
  damping: 20,
  mass: 0.45,
} as const;

type MagneticJoinButtonProps = {
  clubName: string;
  onJoin?: () => void;
};

export function MagneticJoinButton({ clubName, onJoin }: MagneticJoinButtonProps) {
  const [joined, setJoined] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, magneticSpring);
  const y = useSpring(pointerY, magneticSpring);

  function resetPosition() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (
      reduceMotion ||
      event.pointerType !== "mouse" ||
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - (bounds.left + bounds.width / 2);
    const offsetY = event.clientY - (bounds.top + bounds.height / 2);

    pointerX.set(Math.max(-13, Math.min(13, offsetX * 0.18)));
    pointerY.set(Math.max(-10, Math.min(10, offsetY * 0.18)));
  }

  function handleJoin() {
    resetPosition();
    if (joined) return;

    setJoined(true);
    onJoin?.();
  }

  return (
    <motion.button
      type="button"
      className={`magnetic-join-button${joined ? " is-joined" : ""}`}
      style={reduceMotion ? undefined : { x, y }}
      aria-label={joined ? `${clubName} klubuna qoşuldun` : `${clubName} klubuna qoşul`}
      aria-pressed={joined}
      onClick={handleJoin}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onPointerCancel={resetPosition}
      onBlur={resetPosition}
      whileTap={reduceMotion || joined ? undefined : { scale: 0.96 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <span className="magnetic-join-button__glow" aria-hidden="true" />
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={joined ? "joined" : "join"}
          className="magnetic-join-button__content"
          initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.9 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : joined
                ? { opacity: 1, y: 0, scale: [0.9, 1.12, 1] }
                : { opacity: 1, y: 0, scale: 1 }
          }
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          {joined ? <Check size={17} strokeWidth={2.4} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {joined ? "Qoşuldun" : "Kluba qoşul"}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence>
        {joined && !reduceMotion && (
          <motion.span
            className="magnetic-join-button__success-ring"
            aria-hidden="true"
            initial={{ opacity: 0.72, scale: 0.56 }}
            animate={{ opacity: 0, scale: 1.42 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
