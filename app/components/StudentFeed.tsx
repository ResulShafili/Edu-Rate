"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, LoaderCircle, Sparkles } from "lucide-react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import type {
  AnnouncementItem,
  NetworkFilter,
  StudentFeedItem,
} from "../data/network";
import { networkFilterLabels } from "../data/network";
import { AnnouncementsBoard } from "./AnnouncementsBoard";
import { FeedCard } from "./FeedCard";

type StudentFeedProps = {
  announcements: readonly AnnouncementItem[];
  items: readonly StudentFeedItem[];
};

const PAGE_SIZE = 5;

export function StudentFeed({ announcements, items }: StudentFeedProps) {
  const [activeFilter, setActiveFilter] = useState<NetworkFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isAppending, setIsAppending] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const appendFrameRef = useRef<number | null>(null);
  const reduceMotionPreference = useReducedMotion();
  const reducedMotion = Boolean(reduceMotionPreference);

  const filteredItems = items.filter(
    (item) => activeFilter === "all" || item.category === activeFilter,
  );
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleItems.length < filteredItems.length;

  function loadMore() {
    if (isAppending || !hasMore) return;

    setIsAppending(true);
    startTransition(() => {
      setVisibleCount((current) =>
        Math.min(current + PAGE_SIZE, filteredItems.length),
      );
    });

    appendFrameRef.current = window.requestAnimationFrame(() => {
      setIsAppending(false);
      appendFrameRef.current = null;
    });
  }

  const loadMoreFromObserver = useEffectEvent(loadMore);

  useEffect(() => {
    return () => {
      if (appendFrameRef.current !== null) {
        window.cancelAnimationFrame(appendFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isAppending || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        loadMoreFromObserver();
      },
      { rootMargin: "280px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isAppending, visibleCount]);

  function changeFilter(filter: NetworkFilter) {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section
      className="feed-section relative z-[2] min-h-[80svh] rounded-t-[38px] bg-[var(--paper)] px-[clamp(18px,5.2vw,84px)] pb-[clamp(96px,10vw,150px)] pt-[clamp(108px,10vw,140px)] text-[var(--ink)] max-[480px]:rounded-t-[22px] max-[480px]:pb-[calc(88px+env(safe-area-inset-bottom))] max-[480px]:pt-[82px]"
      aria-labelledby="student-feed-title"
    >
      <motion.header
        className="student-feed-heading mx-auto grid w-full max-w-[1320px] grid-cols-[minmax(0,1fr)_minmax(240px,0.38fr)] items-end gap-10 border-b border-black/[0.15] pb-12 max-[767px]:grid-cols-1 max-[767px]:gap-5 max-[767px]:pb-8"
        initial={reducedMotion ? false : { opacity: 0.76, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: 0.68, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div>
          <span className="mb-5 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0d0e0d]/[0.48]">
            <Sparkles size={13} aria-hidden="true" />
            06 / Universitet həyatı
          </span>
          <h1
            id="student-feed-title"
            className="m-0 text-[clamp(46px,6.5vw,96px)] font-medium leading-[0.91] tracking-[-0.068em] max-[480px]:text-[clamp(38px,11.4vw,48px)] max-[480px]:leading-[0.94]"
          >
            Kampusdan xəbərdar ol.<br />
            <em className="[font-family:var(--font-instrument-serif),Georgia,serif] font-normal tracking-[-0.045em] text-[var(--violet)]">
              Öz axarınla.
            </em>
          </h1>
        </div>
        <p className="m-0 max-w-[340px] text-[13px] leading-[1.72] text-[#0d0e0d]/[0.56] max-[480px]:text-[12px] max-[480px]:leading-[1.62]">
          Rəsmi elanlar, klub yenilikləri və fakültə xəbərləri bir sakit lentdə — yalnız ehtiyacın olan qədər.
        </p>
      </motion.header>

      <div className="feed-layout mx-auto mt-12 w-full max-w-[1040px] max-[480px]:mt-8">
        <AnnouncementsBoard
          items={announcements}
          activeFilter={activeFilter}
          onFilterChange={changeFilter}
          reducedMotion={reducedMotion}
        />

        <section
          className="student-feed-stream mt-[clamp(72px,8vw,108px)]"
          aria-labelledby="student-feed-stream-title"
        >
          <header className="feed-stream-heading mb-7 flex items-end justify-between gap-5 border-b border-black/[0.12] pb-5">
            <div>
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#0d0e0d]/[0.42]">
                {networkFilterLabels[activeFilter]}
              </span>
              <h2
                id="student-feed-stream-title"
                className="text-[clamp(29px,4vw,42px)] font-medium leading-none tracking-[-0.05em]"
              >
                Tələbə lenti
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.11em] text-[#0d0e0d]/40">
              {filteredItems.length} paylaşım
            </span>
          </header>

          <p className="sr-only" role="status" aria-live="polite">
            {networkFilterLabels[activeFilter]} kateqoriyasında {filteredItems.length} lent elementi göstərilir.
          </p>

          <motion.div
            id="student-feed-list"
            className="feed-list grid gap-3 sm:gap-4"
            role="feed"
            aria-label={`${networkFilterLabels[activeFilter]} tələbə lenti`}
            aria-busy={isAppending}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {visibleItems.map((item, index) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  position={index + 1}
                  total={filteredItems.length}
                  reducedMotion={reducedMotion}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          <div
            ref={sentinelRef}
            className="feed-loading-sentinel mt-7 grid min-h-20 place-items-center"
          >
            {hasMore ? (
              <button
                type="button"
                className="feed-load-more inline-flex min-h-11 items-center gap-2 rounded-full border border-black/[0.14] bg-white/[0.45] px-5 text-[10px] font-semibold text-[#0d0e0d]/[0.68] transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-black/[0.24] hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6750d2] disabled:cursor-wait disabled:opacity-[0.55]"
                onClick={loadMore}
                disabled={isAppending}
                aria-controls="student-feed-list"
              >
                {isAppending ? (
                  <LoaderCircle
                    size={14}
                    className={reducedMotion ? "" : "animate-spin"}
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDown size={14} aria-hidden="true" />
                )}
                {isAppending ? "Lent genişlənir" : "Daha çox göstər"}
              </button>
            ) : (
              <p className="feed-end-state m-0 text-center text-[10px] leading-[1.6] tracking-[0.04em] text-[#0d0e0d]/[0.42]">
                Bu kateqoriyadakı bütün yenilikləri gördün.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
