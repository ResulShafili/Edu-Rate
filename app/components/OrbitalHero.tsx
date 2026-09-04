"use client";

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

/**
 * Orbital hero. Bölmələr EDU nüvəsinin ətrafında zərif fırlanır (yalnız 2D),
 * üzərinə gələndə dayanır və etiketini açır. Hər node əsl naviqasiya keçididir;
 * reduced-motion rejimində hərəkət dayanır, lakin bütün keçidlər əlçatan qalır.
 */
export function OrbitalHero() {
  return (
    <div className="orbital-hero">
      <span className="orbital-hero__aura" aria-hidden="true" />
      <div className="orbital-hero__stage">
        <span className="orbital-hero__ring orbital-hero__ring--outer" aria-hidden="true" />
        <span className="orbital-hero__ring orbital-hero__ring--inner" aria-hidden="true" />

        <span className="orbital-hero__core" aria-hidden="true">
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
      </div>
    </div>
  );
}
