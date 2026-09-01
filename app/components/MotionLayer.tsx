"use client";

import { useEffect } from "react";

/**
 * Sayt-boyu hərəkət qatı.
 *
 *  - ambient aura: arxa planda yavaş sürüşən işıq;
 *  - sürüşmə göstəricisi: yuxarıda incə aksent xətti;
 *  - kursor işığı: göstəricini izləyən yumşaq halo;
 *  - 3D tilt: kursorun altındakı kart əsl perspektivlə əyilir.
 *
 * Tilt üçün elementin `transform`-una TOXUNMURUQ — müstəqil `rotate`/
 * `translate` CSS xüsusiyyətləri istifadə olunur, ona görə marşrutların
 * Framer Motion animasiyaları ilə toqquşmur. Yalnız custom property
 * yazılır, React-in idarə etdiyi atributlara müdaxilə yoxdur.
 */

const TILT_SELECTOR = [
  ".event-card",
  ".club-directory-card",
  ".peer-card",
  ".mentor-card",
  ".teacher-card",
  ".review-card",
  ".community-card-shell",
  ".announcement-card",
  ".club-member-card",
  ".kuds-quick-card",
  ".profile-stat-card",
].join(",");

const MAX_TILT = 15;

export function MotionLayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.setAttribute("data-motion", calm ? "calm" : "alive");

    // --- Sürüşmə göstəricisi -------------------------------------------
    let progressFrame = 0;
    function updateProgress() {
      progressFrame = 0;
      const scrollable = root.scrollHeight - window.innerHeight;
      const ratio = scrollable > 8 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      root.style.setProperty("--scroll-progress", String(ratio));
    }
    function scheduleProgress() {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(updateProgress);
    }
    updateProgress();
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress, { passive: true });

    if (calm) {
      return () => {
        window.removeEventListener("scroll", scheduleProgress);
        window.removeEventListener("resize", scheduleProgress);
        if (progressFrame) window.cancelAnimationFrame(progressFrame);
      };
    }

    // --- Kursor işığı + 3D tilt ----------------------------------------
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let tilted: HTMLElement | null = null;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    function clearTilt() {
      if (!tilted) return;
      tilted.style.removeProperty("--tilt-ax");
      tilted.style.removeProperty("--tilt-ay");
      tilted.style.removeProperty("--tilt-angle");
      tilted.style.removeProperty("--glare-x");
      tilted.style.removeProperty("--glare-y");
      tilted.removeAttribute("data-tilting");
      tilted = null;
    }

    function applyPointer() {
      pointerFrame = 0;
      root.style.setProperty("--cursor-x", `${pointerX}px`);
      root.style.setProperty("--cursor-y", `${pointerY}px`);
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !fine.matches) return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyPointer);

      const card = (event.target as Element | null)?.closest?.(TILT_SELECTOR) as HTMLElement | null;
      if (!card) {
        clearTilt();
        return;
      }
      if (card !== tilted) {
        clearTilt();
        tilted = card;
        card.dataset.tilting = "true";
      }

      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      // Kursordan uzaqlaşdıqca artan bucaq; ox vektoru hərəkət istiqamətinə dik.
      const angle = Math.min(1, Math.hypot(px, py) * 2) * MAX_TILT;
      card.style.setProperty("--tilt-ax", String(py));
      card.style.setProperty("--tilt-ay", String(-px));
      card.style.setProperty("--tilt-angle", `${angle}deg`);
      card.style.setProperty("--glare-x", `${(px + 0.5) * 100}%`);
      card.style.setProperty("--glare-y", `${(py + 0.5) * 100}%`);
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", clearTilt, { passive: true });
    window.addEventListener("blur", clearTilt);

    return () => {
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      window.removeEventListener("blur", clearTilt);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", clearTilt);
      if (progressFrame) window.cancelAnimationFrame(progressFrame);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      clearTilt();
    };
  }, []);

  return (
    <>
      <div className="motion-aura" aria-hidden="true">
        <span className="motion-aura__blob motion-aura__blob--one" />
        <span className="motion-aura__blob motion-aura__blob--two" />
        <span className="motion-aura__blob motion-aura__blob--three" />
      </div>
      <div className="cursor-halo" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true">
        <span className="scroll-progress__bar" />
      </div>
    </>
  );
}
