"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Radio, UsersRound } from "lucide-react";
import { useRef, type PointerEvent } from "react";
import type { Community } from "../data/clubs";

type CommunityCardProps = {
  community: Community;
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onActivate: (slug: string) => void;
  onDeactivate: (slug: string) => void;
};

const tiltSpring = {
  stiffness: 190,
  damping: 24,
  mass: 0.62,
} as const;

function clampPointer(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function CommunityCard({
  community,
  index,
  isActive,
  isDimmed,
  onActivate,
  onDeactivate,
}: CommunityCardProps) {
  const reducedMotion = useReducedMotion();
  const boundsRef = useRef<DOMRect | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(pointerY, [-1, 1], [6.5, -6.5]),
    tiltSpring,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-1, 1], [-7.5, 7.5]),
    tiltSpring,
  );
  const visualX = useSpring(
    useTransform(pointerX, [-1, 1], [-9, 9]),
    tiltSpring,
  );
  const visualY = useSpring(
    useTransform(pointerY, [-1, 1], [-7, 7]),
    tiltSpring,
  );

  function updateTilt(event: PointerEvent<HTMLElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;

    const bounds = boundsRef.current ?? event.currentTarget.getBoundingClientRect();
    boundsRef.current = bounds;
    pointerX.set(clampPointer(((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    pointerY.set(clampPointer(((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
  }

  function resetTilt() {
    boundsRef.current = null;
    pointerX.set(0);
    pointerY.set(0);
  }

  function deactivate() {
    resetTilt();
    onDeactivate(community.slug);
  }

  function handlePointerLeave(event: PointerEvent<HTMLElement>) {
    resetTilt();
    if (!event.currentTarget.contains(event.currentTarget.ownerDocument.activeElement)) {
      onDeactivate(community.slug);
    }
  }

  return (
    <motion.article
      id={`community-${community.slug}`}
      className={`community-card-shell${isActive ? " is-active" : ""}${
        isDimmed ? " is-dimmed" : ""
      }`}
      data-tone={community.tone}
      initial={reducedMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: 0.58,
              delay: Math.min(index * 0.045, 0.24),
              ease: [0.22, 1, 0.36, 1],
            }
      }
      style={
        reducedMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 1100 }
      }
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          boundsRef.current = event.currentTarget.getBoundingClientRect();
          onActivate(community.slug);
        }
      }}
      onPointerMove={updateTilt}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => onActivate(community.slug)}
      onBlurCapture={deactivate}
    >
      <button
        type="button"
        className="community-card-button"
        aria-pressed={isActive}
        aria-label={`${community.name} icmasını vurğula`}
        onClick={() => {
          if (isActive) {
            onDeactivate(community.slug);
            return;
          }

          onActivate(community.slug);
        }}
      >
        <motion.span
          className="community-card-visual"
          style={reducedMotion ? undefined : { x: visualX, y: visualY }}
          aria-hidden="true"
        >
          <span className="community-card-visual-grid" />
          <span className="community-card-visual-ring community-card-visual-ring-one" />
          <span className="community-card-visual-ring community-card-visual-ring-two" />
          <span className="community-card-visual-glow" />
          <span className="community-card-visual-mark">{community.visualMark}</span>
        </motion.span>

        <span className="community-card-content">
          <span className="community-card-topline">
            <span className="community-card-eyebrow">{community.eyebrow}</span>
            <span className="community-card-arrow" aria-hidden="true">
              <ArrowUpRight size={18} strokeWidth={1.7} />
            </span>
          </span>

          <span className="community-card-copy">
            <strong>{community.name}</strong>
            <em>{community.tagline}</em>
            <span>{community.description}</span>
          </span>

          <span className="community-card-meta">
            <span>
              <UsersRound size={14} strokeWidth={1.7} aria-hidden="true" />
              {community.memberCount.toLocaleString("az-AZ")} üzv
            </span>
            <span>
              <Radio size={14} strokeWidth={1.7} aria-hidden="true" />
              {community.activityLabel}
            </span>
          </span>

          <span className="community-card-tags" aria-hidden="true">
            {community.focusTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </span>
        </span>
      </button>
    </motion.article>
  );
}
