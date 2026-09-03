"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

type RouteTransitionProps = {
  children: ReactNode;
};

// YALNIZ opasite ilə keçid — heç bir transform (y/scale/rotate/perspective) YOX.
//
// Səbəb: wrapper-də qalan istənilən transform onun daxilindəki `position: fixed`
// modal/drawer-lər üçün yeni "containing block" yaradır və onları viewport əvəzinə
// bütün səhifə hündürlüyünə uzadır — X düyməsi əlçatmaz olur, pəncərə həddindən
// uzun görünür, məzmun kənara daşır (PC və mobil, əksər ekranlar). Sadə fade bu
// problemi tamamilə aradan qaldırır və daha yığcam, sakit təəssürat verir.
const variants = {
  initial: { opacity: 0 },
  visible: { opacity: 1 },
};

export function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

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
      variants={variants}
      initial={reduceMotion ? false : "initial"}
      animate="visible"
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
