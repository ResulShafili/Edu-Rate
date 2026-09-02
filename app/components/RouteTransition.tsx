"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type RouteTransitionProps = {
  children: ReactNode;
};

// Masaüstü: dərinlik hissi üçün 3D yellənmə. Mobil: yüngül fade + sürüşmə,
// 3D olmadan — zəif cihazlarda keçid daha axıcı olsun.
const desktopVariants = {
  initial: { opacity: 0, y: 26, rotateX: 9, scale: 0.985 },
  visible: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
};

const mobileVariants = {
  initial: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const desktopTransition = { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const };
const mobileTransition = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (max-width: 768px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const variants = isMobile ? mobileVariants : desktopVariants;
  const transition = isMobile ? mobileTransition : desktopTransition;

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
    <motion.div
        ref={frameRef}
        key={pathname}
        className="route-frame"
        style={reduceMotion || isMobile ? undefined : { transformPerspective: 1400, transformOrigin: "50% 0%" }}
        variants={variants}
        initial={reduceMotion ? false : "initial"}
        animate="visible"
        transition={reduceMotion ? { duration: 0 } : transition}
      >
        {children}
      </motion.div>
  );
}
