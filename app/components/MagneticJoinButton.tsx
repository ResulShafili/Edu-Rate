"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useEffect, useState, type PointerEvent } from "react";
import { useAuth } from "./AuthProvider";

const magneticSpring = {
  stiffness: 270,
  damping: 20,
  mass: 0.45,
} as const;

type MagneticJoinButtonProps = {
  clubId: string;
  clubName: string;
  onJoin?: () => void;
};

export function MagneticJoinButton({ clubId, clubName, onJoin }: MagneticJoinButtonProps) {
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);
  const [loadedMembershipKey, setLoadedMembershipKey] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const reduceMotion = Boolean(useReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, magneticSpring);
  const y = useSpring(pointerY, magneticSpring);
  const isJoined = Boolean(user && joined);
  const membershipKey = user ? `${user.id}:${clubId}` : null;
  const membershipLoading = Boolean(membershipKey && loadedMembershipKey !== membershipKey);

  useEffect(() => {
    if (!user || !membershipKey) return;
    let cancelled = false;
    const controller = new AbortController();
    void fetch("/api/clubs/memberships", { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error("Üzvlük vəziyyəti yoxlanmadı.")))
      .then((payload: { data?: Array<{ slug?: string }> } | null) => {
        if (!cancelled && payload?.data) setJoined(payload.data.some((club) => club.slug === clubId));
      })
      .catch((cause) => { if (!cancelled && cause instanceof Error && cause.name !== "AbortError") setError(cause.message); })
      .finally(() => { if (!cancelled) setLoadedMembershipKey(membershipKey); });
    return () => { cancelled = true; controller.abort(); };
  }, [clubId, membershipKey, user]);

  function resetPosition() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (
      reduceMotion ||
      event.pointerType !== "mouse" ||
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - (bounds.left + bounds.width / 2);
    const offsetY = event.clientY - (bounds.top + bounds.height / 2);

    pointerX.set(Math.max(-13, Math.min(13, offsetX * 0.18)));
    pointerY.set(Math.max(-10, Math.min(10, offsetY * 0.18)));
  }

  async function handleJoin() {
    resetPosition();
    setError("");
    if (!user) {
      window.location.assign(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (membershipLoading) return;
    setPending(true);
    try {
      const response = await fetch(`/api/clubs/${encodeURIComponent(clubId)}/memberships`, { method: isJoined ? "DELETE" : "POST" });
      const payload = await response.json() as { data?: { joined?: boolean }; error?: { code?: string; message?: string } };
      if (!response.ok) {
        if (payload.error?.code === "ALREADY_MEMBER") { setJoined(true); return; }
        throw new Error(payload.error?.message ?? "Əməliyyat tamamlanmadı.");
      }
      setJoined(payload.data?.joined ?? !isJoined);
      if (!isJoined) onJoin?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Əməliyyat tamamlanmadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="club-join-action">
      <motion.button
      type="button"
      className={`magnetic-join-button${isJoined ? " is-joined" : ""}`}
      style={reduceMotion ? undefined : { x, y }}
      aria-label={isJoined ? `${clubName} klubuna qoşuldun` : `${clubName} klubuna qoşul`}
      aria-pressed={isJoined}
      aria-busy={pending}
      aria-describedby={error ? "club-join-error" : undefined}
      disabled={pending || membershipLoading}
      onClick={() => void handleJoin()}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onPointerCancel={resetPosition}
      onBlur={resetPosition}
      whileTap={reduceMotion || isJoined ? undefined : { scale: 0.96 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <span className="magnetic-join-button__glow" aria-hidden="true" />
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={isJoined ? "joined" : "join"}
          className="magnetic-join-button__content"
          initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.9 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : isJoined
                ? { opacity: 1, y: 0, scale: [0.9, 1.12, 1] }
                : { opacity: 1, y: 0, scale: 1 }
          }
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          {isJoined ? <Check size={17} strokeWidth={2.4} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {membershipLoading ? "Yoxlanılır…" : pending ? "Gözlə…" : isJoined ? "Kluba qoşuldun" : "Kluba qoşul"}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence>
        {isJoined && !reduceMotion && (
          <motion.span
            className="magnetic-join-button__success-ring"
            aria-hidden="true"
            initial={{ opacity: 0.72, scale: 0.56 }}
            animate={{ opacity: 0, scale: 1.42 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      </motion.button>
      {isJoined ? <small className="club-join-action__status" role="status">Bu klubun üzvüsən.</small> : null}
      <AnimatePresence>
        {error && (
          <motion.small
            id="club-join-error"
            className="club-join-action__error"
            role="alert"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {error}
          </motion.small>
        )}
      </AnimatePresence>
    </div>
  );
}
