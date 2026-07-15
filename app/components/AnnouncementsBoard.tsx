"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Megaphone, SlidersHorizontal } from "lucide-react";
import type {
  AnnouncementItem,
  NetworkFilter,
  NetworkTone,
} from "../data/network";
import { networkFilterLabels, networkFilters } from "../data/network";

type AnnouncementsBoardProps = {
  items: readonly AnnouncementItem[];
  activeFilter: NetworkFilter;
  onFilterChange: (filter: NetworkFilter) => void;
  reducedMotion: boolean;
};

const announcementToneClasses: Record<
  NetworkTone,
  { marker: string; date: string; initials: string }
> = {
  lime: {
    marker: "bg-[#c8ff4d]",
    date: "bg-[#c8ff4d]/25 text-[#496500]",
    initials: "bg-[#c8ff4d]",
  },
  lilac: {
    marker: "bg-[#b9a7ff]",
    date: "bg-[#b9a7ff]/25 text-[#5540b8]",
    initials: "bg-[#b9a7ff]",
  },
  blue: {
    marker: "bg-[#77b8ff]",
    date: "bg-[#77b8ff]/25 text-[#185f9f]",
    initials: "bg-[#77b8ff]",
  },
  coral: {
    marker: "bg-[#ff9e7a]",
    date: "bg-[#ff9e7a]/25 text-[#9d4026]",
    initials: "bg-[#ff9e7a]",
  },
  mint: {
    marker: "bg-[#7de5d1]",
    date: "bg-[#7de5d1]/25 text-[#176c5f]",
    initials: "bg-[#7de5d1]",
  },
  gold: {
    marker: "bg-[#f7d56f]",
    date: "bg-[#f7d56f]/25 text-[#81640a]",
    initials: "bg-[#f7d56f]",
  },
};

export function AnnouncementsBoard({
  items,
  activeFilter,
  onFilterChange,
  reducedMotion,
}: AnnouncementsBoardProps) {
  const visibleAnnouncements = items.filter(
    (item) => activeFilter === "all" || item.category === activeFilter,
  );

  return (
    <section
      className="announcements-board"
      aria-labelledby="announcements-title"
    >
      <header className="announcements-board-heading mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0d0e0d]/[0.46]">
            <Megaphone size={13} aria-hidden="true" />
            Universitet şəbəkəsi
          </span>
          <h2
            id="announcements-title"
            className="text-[clamp(31px,5vw,46px)] font-medium leading-none tracking-[-0.055em] text-[#0d0e0d]"
          >
            Vacib elanlar
          </h2>
        </div>
        <p className="max-w-[330px] text-[11px] leading-[1.65] text-[#0d0e0d]/[0.52] sm:text-right">
          Kampusdakı əsas yenilikləri bir baxışda gör, sonra lentdə sənə uyğun mövzulara davam et.
        </p>
      </header>

      <div className="announcement-filter-bar sticky top-[calc(80px+env(safe-area-inset-top))] z-30 mb-6 flex items-center gap-3 rounded-[18px] border border-white/50 bg-[#f3f1e9]/[0.88] p-2 shadow-[0_14px_42px_rgba(13,14,13,0.10)] backdrop-blur-xl md:top-[106px]">
        <span
          className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0d0e0d] text-[#f3f1e9] sm:grid"
          aria-hidden="true"
        >
          <SlidersHorizontal size={15} />
        </span>

        <div
          className="announcement-filters flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Elanları və tələbə lentini kateqoriyaya görə süzgəcdən keçir"
        >
          {networkFilters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                className={`relative min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-[10px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750d2] ${active ? "text-[#f3f1e9]" : "text-[#0d0e0d]/[0.58] hover:text-[#0d0e0d]"}`}
                onClick={() => onFilterChange(filter)}
                aria-pressed={active}
                aria-controls="announcements-list student-feed-list"
              >
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#0d0e0d]"
                    layoutId="active-network-filter"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-[1]">
                  {networkFilterLabels[filter]}
                </span>
              </button>
            );
          })}
        </div>

        <span className="hidden shrink-0 pr-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#0d0e0d]/[0.42] md:block">
          {visibleAnnouncements.length} elan
        </span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {networkFilterLabels[activeFilter]} kateqoriyasında {visibleAnnouncements.length} elan göstərilir.
      </p>

      <motion.div
        id="announcements-list"
        className="announcements-list grid grid-flow-col auto-cols-[min(84vw,330px)] gap-3 overflow-x-auto pb-3 [scrollbar-width:none] snap-x snap-proximity md:grid-flow-row md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        layout={!reducedMotion}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visibleAnnouncements.map((item, index) => {
            const tone = announcementToneClasses[item.tone];
            const titleId = `announcement-${item.id}-title`;
            return (
              <motion.article
                key={item.id}
                layout={reducedMotion ? false : "position"}
                className="announcement-card relative min-h-[260px] snap-start overflow-hidden rounded-[20px] border border-black/10 bg-white/[0.48] p-5 pb-20 shadow-[0_16px_50px_rgba(13,14,13,0.045)]"
                initial={reducedMotion ? false : { opacity: 0.64, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.985 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 300,
                        damping: 29,
                        mass: 0.7,
                        delay: Math.min(index, 2) * 0.045,
                      }
                }
                aria-labelledby={titleId}
              >
                <span
                  className={`absolute left-0 top-5 h-11 w-[3px] rounded-r-full ${tone.marker}`}
                  aria-hidden="true"
                />

                <div className="announcement-card-meta flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[9px] font-bold uppercase tracking-[0.08em] ${tone.date}`}
                  >
                    <CalendarDays size={12} aria-hidden="true" />
                    {item.dateLabel}
                  </span>
                  <time
                    dateTime={item.publishedAt}
                    className="text-[9px] tracking-[0.04em] text-[#0d0e0d]/[0.38]"
                  >
                    {item.timeLabel}
                  </time>
                </div>

                <h3
                  id={titleId}
                  className="mt-6 text-[22px] font-medium leading-[1.04] tracking-[-0.045em] text-[#0d0e0d]"
                >
                  {item.title}
                </h3>
                <p className="mt-3 text-[11px] leading-[1.65] text-[#0d0e0d]/[0.54]">
                  {item.summary}
                </p>

                <footer className="absolute inset-x-5 bottom-5 flex items-center gap-2 border-t border-black/[0.08] pt-3">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[8px] font-bold text-[#0d0e0d] ${tone.initials}`}
                    aria-hidden="true"
                  >
                    {item.sourceInitials}
                  </span>
                  <span className="truncate text-[9px] font-semibold text-[#0d0e0d]/[0.52]">
                    {item.source}
                  </span>
                </footer>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
