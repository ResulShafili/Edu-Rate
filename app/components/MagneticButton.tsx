"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function MagneticButton({
  children,
  className = "",
  onClick,
  ariaLabel,
}: MagneticButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 20, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 280, damping: 20, mass: 0.35 });

  function handleMove(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.16);
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.16);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      type="button"
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`magnetic-button ${className}`}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}
