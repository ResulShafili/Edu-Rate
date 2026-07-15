"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { allPlatformRoutes } from "../data/navigation";

type RouteTransitionProps = {
  children: ReactNode;
};

const pageVariants = {
  initial: { y: 8, scale: 0.997 },
  visible: { y: 0, scale: 1 },
};

const pageTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const routeLabel = pathname === "/"
    ? "Ana səhifə"
    : allPlatformRoutes.find((route) => pathname === route.href || pathname.startsWith(`${route.href}/`))?.label ?? "Səhifə";

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    try {
      window.scrollTo(0, 0);
    } finally {
      root.style.scrollBehavior = previousScrollBehavior;
    }

    frameRef.current?.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <span className="sr-only" aria-live="polite">{routeLabel} açıldı</span>
      <motion.div
        ref={frameRef}
        key={pathname}
        className="route-frame"
        variants={pageVariants}
        initial={reduceMotion ? false : "initial"}
        animate="visible"
        transition={reduceMotion ? { duration: 0 } : pageTransition}
      >
        {children}
      </motion.div>
    </>
  );
}
