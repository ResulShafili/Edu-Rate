"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

const spring = { stiffness: 260, damping: 18, mass: 0.4 } as const;

type MagneticLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  /** Çəkmə gücü (px). */
  strength?: number;
};

/**
 * Kursora doğru zərif "magnetic" çəkilən keçid. Yalnız fine-pointer
 * cihazlarda hərəkət edir; toxunma və reduced-motion rejimində sabit qalır.
 * Anchor semantikası və klaviatura davranışı tam qorunur.
 */
export function MagneticLink({ href, className, children, strength = 14 }: MagneticLinkProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  function handleMove(event: PointerEvent<HTMLAnchorElement>) {
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
    x.set(Math.max(-strength, Math.min(strength, offsetX * 0.4)));
    y.set(Math.max(-strength, Math.min(strength, offsetY * 0.4)));
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={reduceMotion ? undefined : { x, y }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onBlur={reset}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}
