"use client";

import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";

type TiltCardProps = {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  /** Maksimal əyilmə dərəcəsi. */
  max?: number;
};

/**
 * Kursoru izləyən 3D-tilt + işıq sheen kartı. Yalnız fine-pointer (mouse)
 * cihazlarda əyilir; toxunma və reduced-motion rejimində sakit qalır, lakin
 * keçid tam funksionaldır. CSS dəyişənləri (--tx/--ty/--mx/--my) creative.css
 * tərəfindən oxunur.
 */
export function TiltCard({ href, className, children, ariaLabel, max = 9 }: TiltCardProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(event: PointerEvent<HTMLAnchorElement>) {
    const node = ref.current;
    if (
      !node ||
      reduceMotion ||
      event.pointerType !== "mouse" ||
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const bounds = node.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;
    node.style.setProperty("--tx", `${(px - 0.5) * 2 * max}deg`);
    node.style.setProperty("--ty", `${(0.5 - py) * 2 * max}deg`);
    node.style.setProperty("--mx", `${px * 100}%`);
    node.style.setProperty("--my", `${py * 100}%`);
    node.style.setProperty("--active", "1");
  }

  function reset() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--tx", "0deg");
    node.style.setProperty("--ty", "0deg");
    node.style.setProperty("--active", "0");
  }

  return (
    <Link
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      className={`tilt-card${className ? ` ${className}` : ""}`}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      <span className="tilt-card__sheen" aria-hidden="true" />
      {children}
    </Link>
  );
}
