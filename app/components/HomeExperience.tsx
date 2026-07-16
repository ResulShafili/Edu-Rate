"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  MessageCircleMore,
  Search,
  Send,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

const dashboardLinks = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/feed", label: "Lent", icon: MessageCircleMore },
  { href: "/events", label: "Tədbirlər", icon: CalendarDays },
  { href: "/clubs", label: "Klublar", icon: Compass },
  { href: "/community", label: "İcma", icon: UsersRound },
  { href: "/teachers", label: "Müəllimlər", icon: GraduationCap },
  { href: "/mentors", label: "Mentorlar", icon: HeartHandshake },
  { href: "/support", label: "Dəstək", icon: CircleHelp },
] as const;

const quickLinks = [
  { href: "/auth", label: "Daxil ol" },
  { href: "/profile", label: "Profil" },
  { href: "/admin", label: "İdarəetmə" },
] as const;

const heroSlides = [
  {
    kicker: "Yeni semestr",
    title: "Kampus həyatını daha rahat idarə et",
    copy: "Tədbirlər, elanlar, klublar və müəllim rəyləri eyni sakit paneldə toplanır.",
    cta: "Lentə bax",
    href: "/feed",
    accent: "#5e17eb",
  },
  {
    kicker: "Tədbirlər",
    title: "Bu həftə sənə uyğun görüşləri seç",
    copy: "Kiçik qruplar, açıq laboratoriyalar və klub sessiyaları səliqəli axında görünür.",
    cta: "Tədbirləri aç",
    href: "/events",
    accent: "#4f46e5",
  },
  {
    kicker: "Qiymətləndirmə",
    title: "Müəllimi bacarıqlarına görə obyektiv dəyərləndir",
    copy: "Tədris, obyektivlik, izah bacarığı və ünsiyyət ayrı-ayrılıqda ölçülür.",
    cta: "Müəllim seç",
    href: "/teachers",
    accent: "#7c3aed",
  },
] as const;

const feedCategories = ["Hamısı", "Rəsmi", "Klublar", "Fakültələr"] as const;

const feedItems = [
  {
    id: "library-hours",
    category: "Rəsmi",
    source: "Universitet Kitabxanası",
    initials: "UK",
    time: "Bu gün, 10:20",
    title: "Oxu zalının iş saatı imtahan həftəsində uzadıldı",
    body: "Əsas oxu zalı həftəiçi saat 23:00-a qədər açıq olacaq. Sakit zona üçün əvvəlcədən yer seçimi tövsiyə olunur.",
    tags: ["İmtahan", "Kitabxana"],
  },
  {
    id: "robotics-lab",
    category: "Klublar",
    source: "Robototexnika Klubu",
    initials: "RK",
    time: "Bu gün, 12:45",
    title: "Açıq laboratoriya görüşü üçün qeydiyyat başladı",
    body: "Sensorlar, kiçik robotlar və praktiki tapşırıqlarla iki saatlıq rahat tanışlıq sessiyası keçiriləcək.",
    tags: ["Praktika", "Texnologiya"],
  },
  {
    id: "mentor-circle",
    category: "Fakültələr",
    source: "Mühəndislik Fakültəsi",
    initials: "MF",
    time: "Dünən, 18:10",
    title: "Layihə komandaları üçün mentor dairəsi açılır",
    body: "Final layihəsinə hazırlaşan tələbələr təcrübəli məzunlardan qısa, fokuslu geribildirim ala biləcəklər.",
    tags: ["Mentorluq", "Layihə"],
  },
  {
    id: "wellbeing",
    category: "Rəsmi",
    source: "Tələbə Rifahı",
    initials: "TR",
    time: "15 iyul, 09:30",
    title: "Diqqəti qorumaq üçün üç yumşaq fasilə üsulu",
    body: "Məsləhət mərkəzi imtahan dövründə nəfəs, planlama və hərəkət üçün qısa gündəlik rutin paylaşdı.",
    tags: ["Rifah", "Planlama"],
  },
] as const;

const upcomingEvents = [
  { title: "Açıq AI laboratoriyası", date: "18 iyul", meta: "Texnologiya bloku" },
  { title: "Debat klubuna qəbul", date: "20 iyul", meta: "Əsas auditoriya" },
  { title: "Karyera söhbəti", date: "21 iyul", meta: "İqtisadiyyat fakültəsi" },
] as const;

const popularClubs = [
  { name: "Proqramlaşdırma Klubu", members: "840 üzv", tone: "bg-indigo-100 text-indigo-700" },
  { name: "Startup İcması", members: "510 üzv", tone: "bg-violet-100 text-violet-700" },
  { name: "Kitab Klubu", members: "360 üzv", tone: "bg-emerald-100 text-emerald-700" },
] as const;

const announcements = [
  "Fənn seçimi 22 iyul saat 09:00-da açılır.",
  "Tələbə kartlarının yenilənməsi üçün yeni cədvəl yayımlandı.",
  "Müəllim rəylərində təhqir və şəxsi hücum avtomatik yoxlanılır.",
] as const;

function getNextIndex(index: number, direction: 1 | -1) {
  return (index + direction + heroSlides.length) % heroSlides.length;
}

export function HomeExperience() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState<(typeof feedCategories)[number]>("Hamısı");
  const [postValue, setPostValue] = useState("");
  const [posted, setPosted] = useState(false);
  const reduceMotion = useReducedMotion();

  const filteredFeed = useMemo(
    () =>
      activeCategory === "Hamısı"
        ? feedItems
        : feedItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  useEffect(() => {
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => getNextIndex(current, 1));
    }, 6400);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  function moveSlide(direction: 1 | -1) {
    setActiveSlide((current) => getNextIndex(current, direction));
  }

  function submitPost() {
    if (!postValue.trim()) return;
    setPosted(true);
    setPostValue("");
    window.setTimeout(() => setPosted(false), 1800);
  }

  const slide = heroSlides[activeSlide];

  return (
    <section className="dashboard-foundation" aria-labelledby="dashboard-title">
      <aside className="dashboard-left-rail" aria-label="EduRate naviqasiyası">
        <Link href="/" className="dashboard-brand" aria-label="EduRate ana səhifə">
          <span className="dashboard-brand-mark" aria-hidden="true">
            <span />
          </span>
          <strong>EDURATE</strong>
        </Link>

        <nav className="dashboard-nav">
          {dashboardLinks.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/";
            return (
              <motion.div key={item.href} whileHover={reduceMotion ? undefined : { x: 4 }}>
                <Link className={active ? "is-active" : ""} href={item.href} aria-current={active ? "page" : undefined}>
                  <Icon size={17} aria-hidden="true" />
                  <span>{item.label}</span>
                  {active && <motion.i layoutId="dashboard-active-link" />}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="dashboard-quick-links">
          <p>Quick Links</p>
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </aside>

      <div className="dashboard-center">
        <motion.header
          className="dashboard-hero"
          style={{ "--hero-accent": slide.accent } as CSSProperties}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="dashboard-hero-topline">
            <span>
              <Sparkles size={14} aria-hidden="true" />
              {slide.kicker}
            </span>
            <div aria-label="Hero slaydları">
              <button type="button" onClick={() => moveSlide(-1)} aria-label="Əvvəlki slayd">
                <ChevronLeft size={17} />
              </button>
              <button type="button" onClick={() => moveSlide(1)} aria-label="Növbəti slayd">
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.title}
              initial={reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 id="dashboard-title">{slide.title}</h1>
              <p>{slide.copy}</p>
              <Link href={slide.href} className="dashboard-primary-action">
                {slide.cta}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="dashboard-hero-dots" aria-hidden="true">
            {heroSlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={index === activeSlide ? "is-active" : ""}
                onClick={() => setActiveSlide(index)}
                aria-label={`${index + 1}. slayda keç`}
              />
            ))}
          </div>
        </motion.header>

        <motion.section
          className="create-post-panel"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.08 }}
          aria-label="Yeni paylaşım yarat"
        >
          <div className="create-post-avatar" aria-hidden="true">RS</div>
          <label className="sr-only" htmlFor="dashboard-post">Paylaşım mətni</label>
          <textarea
            id="dashboard-post"
            value={postValue}
            onChange={(event) => setPostValue(event.target.value)}
            placeholder="Kampusla bağlı nə paylaşmaq istəyirsən?"
            rows={1}
          />
          <motion.button
            type="button"
            className={posted ? "is-posted" : ""}
            onClick={submitPost}
            disabled={!postValue.trim() && !posted}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          >
            {posted ? <Check size={17} /> : <Send size={17} />}
            <span>{posted ? "Paylaşıldı" : "Paylaş"}</span>
          </motion.button>
        </motion.section>

        <section className="dashboard-feed" aria-labelledby="dashboard-feed-title">
          <header>
            <div>
              <span>Tələbə lenti</span>
              <h2 id="dashboard-feed-title">Bu gün kampusda</h2>
            </div>
            <div className="dashboard-feed-filters" role="group" aria-label="Lenti kateqoriyaya görə süzgəcdən keçir">
              {feedCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={category === activeCategory ? "is-active" : ""}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={category === activeCategory}
                >
                  {category}
                </button>
              ))}
            </div>
          </header>

          <motion.div className="dashboard-feed-list" layout={!reduceMotion}>
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredFeed.map((item, index) => (
                <motion.article
                  key={item.id}
                  layout={reduceMotion ? false : "position"}
                  initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -12, scale: 0.985 }}
                  transition={{
                    type: "spring",
                    stiffness: 310,
                    damping: 30,
                    delay: reduceMotion ? 0 : index * 0.035,
                  }}
                  className="dashboard-post-card"
                >
                  <div className="dashboard-post-meta">
                    <span className="dashboard-post-avatar" aria-hidden="true">{item.initials}</span>
                    <div>
                      <strong>{item.source}</strong>
                      <time>{item.time}</time>
                    </div>
                    <small>{item.category}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <footer>
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </footer>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>

      <aside className="dashboard-right-rail" aria-label="Kampus xülasəsi">
        <div className="dashboard-search" role="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Axtar" aria-label="Platformada axtar" />
        </div>

        <section className="dashboard-widget">
          <h2>
            <CalendarDays size={16} aria-hidden="true" />
            Yaxın tədbirlər
          </h2>
          {upcomingEvents.map((event) => (
            <motion.div key={event.title} className="dashboard-widget-item" whileHover={reduceMotion ? undefined : { x: 4, scale: 1.01 }}>
              <div>
                <strong>{event.title}</strong>
                <span>{event.meta}</span>
              </div>
              <time>{event.date}</time>
            </motion.div>
          ))}
        </section>

        <section className="dashboard-widget">
          <h2>
            <UsersRound size={16} aria-hidden="true" />
            Populyar klublar
          </h2>
          {popularClubs.map((club) => (
            <motion.div key={club.name} className="dashboard-widget-item" whileHover={reduceMotion ? undefined : { x: 4, scale: 1.01 }}>
              <span className={`dashboard-club-dot ${club.tone}`}>
                <BookOpen size={14} aria-hidden="true" />
              </span>
              <div>
                <strong>{club.name}</strong>
                <span>{club.members}</span>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="dashboard-widget dashboard-announcements">
          <h2>
            <Bell size={16} aria-hidden="true" />
            Elanlar
          </h2>
          {announcements.map((item) => (
            <motion.p key={item} whileHover={reduceMotion ? undefined : { x: 4 }}>
              <Star size={13} aria-hidden="true" />
              {item}
            </motion.p>
          ))}
        </section>
      </aside>
    </section>
  );
}
