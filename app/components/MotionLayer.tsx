"use client";

import { useEffect } from "react";

/**
 * Sayt-boyu yüngül hərəkət qatı.
 *
 *  - sakit, solğun ambient aura (arxa planda, hərəkətsiz);
 *  - sürüşmə göstəricisi (yuxarıdakı incə zolaq).
 *
 * QEYD: əvvəllər burada PC üçün əlavə "canlı" effektlər var idi — kursoru izləyən
 * işıq (halo), kursora dartılan maqnit düymələr, sürüşmə ilə hərəkət edən fon
 * parallaksı və kartların 3D əyilməsi. İstifadəçi bunları azaltmağı istədi, ona
 * görə hamısı çıxarıldı. Beləcə sayt daha sakit, sürətli və premium qalır; yalnız
 * CSS :hover ilə verilən zərif 2D keçidlər saxlanılıb.
 */

export function MotionLayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.setAttribute("data-motion", calm ? "calm" : "alive");

    // --- Sürüşmə göstəricisi (yüngül, rAF ilə tənzimlənir) ---------------
    let scrollFrame = 0;
    function onScrollFrame() {
      scrollFrame = 0;
      const scrollable = root.scrollHeight - window.innerHeight;
      const ratio = scrollable > 8 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      root.style.setProperty("--scroll-progress", String(ratio));
    }
    function scheduleScroll() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(onScrollFrame);
    }
    onScrollFrame();
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
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
