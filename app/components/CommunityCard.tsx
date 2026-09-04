"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Radio, UsersRound } from "lucide-react";
import type { PointerEvent } from "react";
import type { Community } from "../data/clubs";

type CommunityCardProps = {
  community: Community;
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onActivate: (slug: string) => void;
  onDeactivate: (slug: string) => void;
};

export function CommunityCard({
  community,
  index,
  isActive,
  isDimmed,
  onActivate,
  onDeactivate,
}: CommunityCardProps) {
  const reducedMotion = useReducedMotion();

  function handlePointerLeave(event: PointerEvent<HTMLElement>) {
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
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: 0.5,
              delay: Math.min(index * 0.045, 0.24),
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onActivate(community.slug);
      }}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => onActivate(community.slug)}
      onBlurCapture={() => onDeactivate(community.slug)}
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
        <span className="community-card-visual" aria-hidden="true">
          <span className="community-card-visual-grid" />
          <span className="community-card-visual-ring community-card-visual-ring-one" />
          <span className="community-card-visual-ring community-card-visual-ring-two" />
          <span className="community-card-visual-glow" />
          <span className="community-card-visual-mark">{community.visualMark}</span>
        </span>

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
