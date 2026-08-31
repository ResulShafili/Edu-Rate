"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import {
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  LifeBuoy,
  Megaphone,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";

type OrbitNode = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const nodes: OrbitNode[] = [
  { href: "/events", label: "Tədbirlər", icon: CalendarDays },
  { href: "/feed", label: "Elanlar", icon: Megaphone },
  { href: "/clubs", label: "Klublar", icon: Sparkles },
  { href: "/community", label: "İcma", icon: UsersRound },
  { href: "/teachers", label: "Müəllimlər", icon: GraduationCap },
  { href: "/mentors", label: "Mentorlar", icon: HeartHandshake },
  { href: "/support", label: "Dəstək", icon: LifeBuoy },
];

const tiltSpring = { stiffness: 140, damping: 18, mass: 0.5 } as const;

/**
 * İnteraktiv orbital hero. Bölmələr EDU nüvəsinin ətrafında fırlanır, kursora
 * doğru zərif şəkildə əyilir (3D parallaks), üzərinə gələndə dayanır və etiketini
 * açır. Hər node əsl naviqasiya keçididir; reduced-motion rejimində hərəkət dayanır,
 * lakin bütün keçidlər əlçatan qalır.
 */
export function OrbitalHero() {
  const reduceMotion = Boolean(useReducedMotion());
  const stageRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), tiltSpring);
  const rotateY = useSpring(useMotionValue(0), tiltSpring);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      reduceMotion ||
      event.pointerType !== "mouse" ||
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relY = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateY.set(relX * 22);
    rotateX.set(relY * -22);
  }

  function resetTilt() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={stageRef}
      className="orbital-hero"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <span className="orbital-hero__aura" aria-hidden="true" />
      <motion.div
        className="orbital-hero__stage"
        style={reduceMotion ? undefined : { rotateX, rotateY }}
      >
        <span className="orbital-hero__ring orbital-hero__ring--outer" aria-hidden="true" />
        <span className="orbital-hero__ring orbital-hero__ring--inner" aria-hidden="true" />

        <span className="orbital-hero__core" aria-hidden="true">
          <span className="orbital-hero__core-pulse" />
          <span className="orbital-hero__core-label">EDU</span>
        </span>

        <div className="orbital-hero__belt">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const angle = (360 / nodes.length) * index;
            return (
              <div
                key={node.href}
                className="orbital-hero__node"
                style={{ ["--angle" as string]: `${angle}deg` }}
              >
                <span className="orbital-hero__upright">
                  <span className="orbital-hero__spin">
                    <Link
                      href={node.href}
                      className="orbital-hero__planet"
                      aria-label={`${node.label} bölməsinə keç`}
                    >
                      <span className="orbital-hero__planet-dot">
                        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="orbital-hero__planet-label">{node.label}</span>
                    </Link>
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
