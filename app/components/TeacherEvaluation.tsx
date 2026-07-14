"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Send, Sparkles, Star } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type UIEvent,
} from "react";
import { teacherReviews, teachers, type Teacher, type TeacherReview } from "../data/teachers";
import { ReviewCard } from "./ReviewCard";
import { SpringRating } from "./SpringRating";
import { TeacherCard } from "./TeacherCard";

const confettiPieces = Array.from({ length: 12 }, (_, index) => index);
const numberFormatter = new Intl.NumberFormat("az-AZ");

export function TeacherEvaluation() {
  const [selectedId, setSelectedId] = useState(teachers[0]?.id ?? "");
  const [activeIndex, setActiveIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [newReviews, setNewReviews] = useState<TeacherReview[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const confirmationTimer = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedId) ?? teachers[0];
  const allReviews = [...newReviews, ...teacherReviews];
  const canSubmit = rating > 0 && reviewText.trim().length >= 12 && !reviewSent;

  useEffect(() => () => {
    if (confirmationTimer.current) window.clearTimeout(confirmationTimer.current);
  }, []);

  function selectTeacher(teacher: Teacher) {
    setSelectedId(teacher.id);
    setRating(0);
    setReviewText("");
    setReviewSent(false);
    document.getElementById("teacher-rating-panel")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }

  function moveCarousel(direction: -1 | 1) {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".teacher-card");
    if (!track || !card) return;
    const gap = 14;
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: reduceMotion ? "auto" : "smooth" });
  }

  function updateActiveCard(event: UIEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    const card = track.querySelector<HTMLElement>(".teacher-card");
    if (!card) return;
    const next = Math.min(teachers.length - 1, Math.max(0, Math.round(track.scrollLeft / (card.offsetWidth + 14))));
    setActiveIndex(next);
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !selectedTeacher) return;

    setNewReviews((current) => [
      {
        id: `review-${selectedTeacher.id}-${Date.now()}`,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        author: "Sən",
        initials: "S",
        rating,
        text: reviewText.trim(),
        date: "indi",
        course: selectedTeacher.subject,
        accent: selectedTeacher.accent,
        featured: true,
      },
      ...current,
    ]);
    setReviewSent(true);

    if (confirmationTimer.current) window.clearTimeout(confirmationTimer.current);
    confirmationTimer.current = window.setTimeout(() => {
      setReviewSent(false);
      setRating(0);
      setReviewText("");
    }, reduceMotion ? 900 : 2400);
  }

  return (
    <section id="teachers" className="teachers-section" aria-labelledby="teachers-title">
      <div className="teachers-grid-texture" aria-hidden="true" />
      <motion.div
        className="teachers-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <span className="teachers-kicker">03 / Müəllim seçimi</span>
          <h2 id="teachers-title">Sənə uyğun müəllimi tap.<br /><em>Öyrənmə yolun dəyişsin.</em></h2>
        </div>
        <div className="teachers-heading-aside">
          <p>Təcrübəsi, yanaşması və uyğun vaxtları sənə uyğun olan müəllimlə inamla irəlilə.</p>
          <div className="teacher-carousel-controls">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Əvvəlki müəllim" aria-controls="available-teachers-track">
              <ArrowLeft size={17} />
            </button>
            <span><strong>{String(activeIndex + 1).padStart(2, "0")}</strong> / {String(teachers.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Növbəti müəllim" aria-controls="available-teachers-track">
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </motion.div>

      <div
        id="available-teachers-track"
        ref={trackRef}
        className="teachers-track"
        role="list"
        aria-label="Hazırda müsait müəllimlər"
        onScroll={updateActiveCard}
      >
        {teachers.map((teacher, index) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            index={index}
            selected={selectedId === teacher.id}
            scrollContainer={trackRef}
            onSelect={selectTeacher}
          />
        ))}
        <span className="teachers-track-spacer" aria-hidden="true" />
      </div>

      {selectedTeacher && (
        <motion.div
          id="teacher-rating-panel"
          className="teacher-rating-panel"
          layout
          style={{ "--selected-accent": selectedTeacher.accent } as CSSProperties}
        >
          <div className="rating-panel-copy">
            <span><Sparkles size={13} /> Təcrübəni qiymətləndir</span>
            <h3>{selectedTeacher.name} sənə necə kömək etdi?</h3>
            <p>Səmimi rəyin digər tələbələrin özlərinə uyğun müəllimi seçməsinə kömək edir.</p>
            <div className="rating-teacher-chip">
              <i>{selectedTeacher.initials}</i>
              <span><strong>{selectedTeacher.subject}</strong><small>{numberFormatter.format(selectedTeacher.reviewCount)} təsdiqlənmiş rəy</small></span>
            </div>
          </div>

          <form className="rating-form" onSubmit={submitReview}>
            <fieldset>
              <legend>Ümumi qiymətləndirmə</legend>
              <SpringRating teacherName={selectedTeacher.name} value={rating} onChange={setRating} />
            </fieldset>
            <div className={`rating-textarea${reviewText ? " has-value" : ""}`}>
              <textarea
                id="teacher-review"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                rows={5}
                minLength={12}
                maxLength={420}
                placeholder=" "
                required
              />
              <label htmlFor="teacher-review">Müəllimin sənə necə kömək etdiyini paylaş…</label>
              <span>{reviewText.length} / 420</span>
            </div>
            <div className="rating-form-footer">
              <small>{rating === 0 ? "Əvvəlcə qiymət seç" : `${rating} ulduz seçildi`}</small>
              <motion.button type="submit" disabled={!canSubmit} whileTap={reduceMotion ? undefined : { scale: 0.96 }}>
                {reviewSent ? <Check size={15} /> : <Send size={14} />}
                {reviewSent ? "Rəy göndərildi" : "Rəyi göndər"}
              </motion.button>
            </div>

            <AnimatePresence>
              {reviewSent && (
                <motion.div
                  className="review-confirmation"
                  role="status"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.78 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 280, damping: 19 }}
                >
                  <motion.i
                    initial={reduceMotion ? false : { scale: 0, rotate: -18 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.08 }}
                  >
                    <Check size={25} />
                  </motion.i>
                  <strong>Rəyin göndərildi</strong>
                  <span>Təşəkkür edirik — paylaşdığın fikir icmaya daha doğru seçim etməyə kömək edir.</span>
                  {!reduceMotion && (
                    <b className="review-success-ring" aria-hidden="true" />
                  )}
                  {!reduceMotion && (
                    <div className="review-confetti" aria-hidden="true">
                      {confettiPieces.map((piece) => <i key={piece} style={{ "--piece": piece } as CSSProperties} />)}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      )}

      <div className="reviews-heading">
        <div>
          <span className="teachers-kicker">İcmanın rəyləri</span>
          <h3>Real təcrübə.<br /><em>Daha aydın seçim.</em></h3>
        </div>
        <p><Star size={14} fill="currentColor" /> Son 30 gündə {numberFormatter.format(teacherReviews.length + 182)} yeni qiymətləndirmə</p>
      </div>

      <div className="reviews-masonry" aria-label="Müəllimlər haqqında rəylər">
        {allReviews.map((review, index) => <ReviewCard key={review.id} review={review} index={index} />)}
      </div>
    </section>
  );
}
