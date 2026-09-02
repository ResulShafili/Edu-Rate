"use client";

import { useEffect } from "react";

/**
 * Sayt-boyu hərəkət qatı.
 *
 *  - ambient aura + parallaks: arxa plan sürüşmə ilə fərqli sürətlə hərəkət edir;
 *  - sürüşmə göstəricisi;
 *  - kursor işığı;
 *  - 3D tilt: kursorun altındakı kart əsl perspektivlə əyilir;
 *  - maqnit düymələr: düymə kursora doğru çəkilir.
 *
 * Elementin `transform`-una toxunmuruq — müstəqil `rotate`/`translate` CSS
 * xüsusiyyətləri işlədilir, ona görə marşrutların Framer Motion animasiyaları
 * ilə toqquşmur.
 *
 * TİTRƏMƏNİN QARŞISI: effekt elementi yerindən tərpətdiyi üçün kursor sərhəddə
 * olanda hit-test yanıb-sönə bilər (kart əyilir → kursor çıxır → effekt sönür →
 * kart qayıdır → yenidən tutulur). Ona görə element tutulan anda ölçüsü
 * yaddaşa alınır və həm bucaq hesabı, həm də "çıxdı" yoxlaması yalnız həmin
 * sabit düzbucaqlıya əsaslanır — geri-əlaqə döngəsi tamamilə qırılır.
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

const MAGNET_SELECTOR = [
  ".kuds-primary-button",
  ".reserve-button",
  ".auth-submit",
  ".profile-save-button",
  ".rating-submit",
  ".ticket-submit",
  ".event-create-trigger",
  ".announcement-submit-trigger",
].join(",");

const MAX_TILT = 15;
const MAGNET_PULL = 0.32;
const MAGNET_LIMIT = 14;
/** Sərhəddə yanıb-sönməni dayandıran ehtiyat zolaq. */
const EXIT_MARGIN = 10;

type Held = { element: HTMLElement; rect: DOMRect };

export function MotionLayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.setAttribute("data-motion", calm ? "calm" : "alive");

    // Mobil/toxunma: parallaks CSS-i söndürülüb, ona görə --scroll-y-i hər
    // frame-də yazmaq mənasız stil-recalc yaradar. Yalnız masaüstündə yazırıq.
    const parallax = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)");

    // --- Sürüşmə: göstərici + parallaks ---------------------------------
    let scrollFrame = 0;
    function onScrollFrame() {
      scrollFrame = 0;
      const scrollable = root.scrollHeight - window.innerHeight;
      const ratio = scrollable > 8 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      root.style.setProperty("--scroll-progress", String(ratio));
      if (parallax.matches) root.style.setProperty("--scroll-y", `${window.scrollY}px`);
    }
    function scheduleScroll() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(onScrollFrame);
    }
    onScrollFrame();
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });

    if (calm) {
      return () => {
        window.removeEventListener("scroll", scheduleScroll);
        window.removeEventListener("resize", scheduleScroll);
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      };
    }

    // --- Kursor, tilt və maqnit -----------------------------------------
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let tilt: Held | null = null;
    let magnet: Held | null = null;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    function outside(rect: DOMRect, x: number, y: number) {
      return (
        x < rect.left - EXIT_MARGIN ||
        x > rect.right + EXIT_MARGIN ||
        y < rect.top - EXIT_MARGIN ||
        y > rect.bottom + EXIT_MARGIN
      );
    }

    function releaseTilt() {
      if (!tilt) return;
      const { element } = tilt;
      element.style.removeProperty("--tilt-ax");
      element.style.removeProperty("--tilt-ay");
      element.style.removeProperty("--tilt-angle");
      element.style.removeProperty("--glare-x");
      element.style.removeProperty("--glare-y");
      element.removeAttribute("data-tilting");
      tilt = null;
    }

    function releaseMagnet() {
      if (!magnet) return;
      const { element } = magnet;
      element.style.removeProperty("--mag-x");
      element.style.removeProperty("--mag-y");
      element.removeAttribute("data-magnetic");
      magnet = null;
    }

    function paintCursor() {
      pointerFrame = 0;
      root.style.setProperty("--cursor-x", `${pointerX}px`);
      root.style.setProperty("--cursor-y", `${pointerY}px`);
    }

    function updateTilt(x: number, y: number, target: Element | null) {
      // Tutulmuş kart varsa, YALNIZ yaddaşdakı sabit düzbucaqlıya baxırıq.
      if (tilt) {
        if (outside(tilt.rect, x, y)) releaseTilt();
        else return applyTilt(tilt, x, y);
      }
      const candidate = target?.closest?.(TILT_SELECTOR) as HTMLElement | null;
      if (!candidate) return;
      const rect = candidate.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      candidate.dataset.tilting = "true";
      tilt = { element: candidate, rect };
      applyTilt(tilt, x, y);
    }

    function applyTilt(held: Held, x: number, y: number) {
      const { element, rect } = held;
      const px = (x - rect.left) / rect.width - 0.5;
      const py = (y - rect.top) / rect.height - 0.5;
      const angle = Math.min(1, Math.hypot(px, py) * 2) * MAX_TILT;
      element.style.setProperty("--tilt-ax", String(py));
      element.style.setProperty("--tilt-ay", String(-px));
      element.style.setProperty("--tilt-angle", `${angle}deg`);
      element.style.setProperty("--glare-x", `${(px + 0.5) * 100}%`);
      element.style.setProperty("--glare-y", `${(py + 0.5) * 100}%`);
    }

    function updateMagnet(x: number, y: number, target: Element | null) {
      if (magnet) {
        if (outside(magnet.rect, x, y)) releaseMagnet();
        else return applyMagnet(magnet, x, y);
      }
      const candidate = target?.closest?.(MAGNET_SELECTOR) as HTMLElement | null;
      if (!candidate) return;
      const rect = candidate.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      candidate.dataset.magnetic = "true";
      magnet = { element: candidate, rect };
      applyMagnet(magnet, x, y);
    }

    function applyMagnet(held: Held, x: number, y: number) {
      const { element, rect } = held;
      const dx = x - (rect.left + rect.width / 2);
      const dy = y - (rect.top + rect.height / 2);
      const clamp = (value: number) => Math.max(-MAGNET_LIMIT, Math.min(MAGNET_LIMIT, value * MAGNET_PULL));
      element.style.setProperty("--mag-x", `${clamp(dx)}px`);
      element.style.setProperty("--mag-y", `${clamp(dy)}px`);
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !fine.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintCursor);
      const target = event.target as Element | null;
      updateTilt(pointerX, pointerY, target);
      updateMagnet(pointerX, pointerY, target);
    }

    function releaseAll() {
      releaseTilt();
      releaseMagnet();
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", releaseAll, { passive: true });
    // Sürüşəndə yaddaşdakı ölçülər köhnəlir — buraxırıq.
    window.addEventListener("scroll", releaseAll, { passive: true });
    window.addEventListener("blur", releaseAll);

    return () => {
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      window.removeEventListener("scroll", releaseAll);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", releaseAll);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      releaseAll();
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
