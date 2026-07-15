"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { platformRoutes } from "../data/navigation";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function HomeExperience() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 180]);
  const rightOrbY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.86], [1, 0.25]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0.975]);

  return (
    <>
      <motion.section
        ref={heroRef}
        className="hero-section"
        style={{ opacity: heroOpacity, scale: heroScale }}
        aria-labelledby="home-title"
      >
        <motion.div className="hero-orb hero-orb-left" style={{ y: orbY }} aria-hidden="true" />
        <motion.div className="hero-orb hero-orb-right" style={{ y: rightOrbY }} aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <motion.div
          className="hero-eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          <Sparkles size={14} />
          EduRate · Vahid öyrənmə məkanı
        </motion.div>

        <motion.h1
          id="home-title"
          className="hero-title"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.1, delayChildren: 0.2 } },
          }}
        >
          <span className="title-line"><motion.span variants={reveal}>Maraqla gəl.</motion.span></span>
          <span className="title-line title-line-accent"><motion.span variants={reveal}>Birlikdə öyrən.</motion.span></span>
          <span className="title-line title-line-last"><motion.span variants={reveal}>İnamla <em>irəli get.</em></motion.span></span>
        </motion.h1>

        <motion.div
          className="hero-bottom"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.78, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <p>EduRate tədbirləri, icmanı, klubları, müəllimləri, mentorluğu, universitet şəbəkəsini və idarəetməni bir sakit, düşünülmüş təcrübədə birləşdirir.</p>
          <Link href="/events" className="scroll-cue home-journey-link">
            <span>Öyrənmə yoluna başla</span>
            <i><ArrowUpRight size={16} /></i>
          </Link>
        </motion.div>

        <motion.div
          className="hero-stamp"
          initial={reduceMotion ? false : { opacity: 0, rotate: -10, scale: 0.82 }}
          animate={{ opacity: 1, rotate: 5, scale: 1 }}
          transition={{ type: "spring", delay: 0.92, stiffness: 110, damping: 14 }}
          aria-hidden="true"
        >
          <span>08</span>
          <small>istiqamət</small>
        </motion.div>
      </motion.section>

      <section className="platform-map-section" aria-labelledby="platform-map-title">
        <motion.div
          className="platform-map-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <span className="section-kicker">Platformanı kəşf et</span>
            <h2 id="platform-map-title">Sənin öyrənmə yolun.<br /><em>Bir yerdə.</em></h2>
          </div>
          <p>Diqqətini yayındırmadan, ehtiyacın olan hissəyə birbaşa keç.</p>
        </motion.div>

        <ol className="module-map-grid">
          {platformRoutes.map((route, index) => (
            <motion.li
              key={route.href}
              className={index < 2 ? "is-featured" : index === platformRoutes.length - 1 ? "is-network" : ""}
              style={{ "--module-accent": route.accent } as CSSProperties}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: index * 0.055, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={route.href}>
                <span className="module-map-number">{route.number}</span>
                <div>
                  <small>{route.label}</small>
                  <h3>{route.title}</h3>
                  <p>{route.description}</p>
                </div>
                <footer>
                  <span>{route.metric}</span>
                  <i aria-hidden="true"><ArrowUpRight size={16} /></i>
                </footer>
              </Link>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="manifesto-section home-manifesto">
        <motion.div
          className="manifesto-orb"
          aria-hidden="true"
          whileInView={reduceMotion ? undefined : { x: [0, 22, 0], y: [0, -18, 0] }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 4.8, ease: "easeInOut" }}
        />
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8 }}
        >
          Bir platforma.<br />Hər addımda <em>yanında.</em>
        </motion.p>
        <span>Seçimdən söhbətə, rəydən mentorluğa qədər bütün yol eyni aydın və etibarlı dil ilə qurulub.</span>
      </section>
    </>
  );
}
