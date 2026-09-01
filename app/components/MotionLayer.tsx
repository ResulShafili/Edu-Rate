"use client";

import { useEffect } from "react";

/**
 * Sayt-boyu ambient hərəkət qatı.
 *
 * Səhifə məzmununa toxunmur — marşrut komponentləri onsuz da Framer Motion
 * ilə öz giriş animasiyalarını idarə edir. Bu qat yalnız onların üstünə iki
 * davamlı element əlavə edir:
 *  - arxa planda yavaş hərəkət edən işıq (aura);
 *  - səhifənin yuxarısında sürüşmə göstəricisi.
 *
 * DOM-a heç bir atribut yazmır, ona görə hidratasiya ilə toqquşmur.
 * `prefers-reduced-motion` aktivdirsə aura CSS tərəfindən dayandırılır.
 */
export function MotionLayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.setAttribute(
      "data-motion",
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "calm" : "alive",
    );

    let frame = 0;
    function update() {
      frame = 0;
      const scrollable = root.scrollHeight - window.innerHeight;
      const ratio = scrollable > 8 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      root.style.setProperty("--scroll-progress", String(ratio));
    }
    function schedule() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="motion-aura" aria-hidden="true">
        <span className="motion-aura__blob motion-aura__blob--one" />
        <span className="motion-aura__blob motion-aura__blob--two" />
        <span className="motion-aura__blob motion-aura__blob--three" />
      </div>
      <div className="scroll-progress" aria-hidden="true">
        <span className="scroll-progress__bar" />
      </div>
    </>
  );
}
