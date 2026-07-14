"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { platformRoutes } from "../data/navigation";

type RouteTransitionProps = {
  children: ReactNode;
};

export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const pageVariants = reduceMotion
    ? {
        initial: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.994 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -7, scale: 0.996 },
      };
  const routeLabel = pathname === "/"
    ? "Ana səhifə"
    : platformRoutes.find((route) => pathname === route.href || pathname.startsWith(`${route.href}/`))?.label ?? "Səhifə";

  function focusCurrentPage() {
    frameRef.current?.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
  }

  return (
    <>
      <span className="sr-only" aria-live="polite">{routeLabel} açıldı</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          ref={frameRef}
          key={pathname}
          className="route-frame"
          variants={pageVariants}
          initial="initial"
          animate="visible"
          exit="exit"
          transition={reduceMotion
            ? { duration: 0.12 }
            : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={(phase) => {
            if (phase === "visible") focusCurrentPage();
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
