"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Send, Sparkles, Star } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type UIEvent,
} from "react";
import { teacherReviews, teachers, type Teacher, type TeacherReview } from "../data/teachers";
import { moderateReview } from "../lib/review-moderation";
import {
  areCriteriaComplete,
  calculateCriteriaAverage,
  CriteriaRating,
  defaultCriteriaRatings,
  type CriteriaRatings,
} from "./CriteriaRating";
import { ReviewCard } from "./ReviewCard";
import { TeacherCard } from "./TeacherCard";
import { TeacherProfileDrawer } from "./TeacherProfileDrawer";

const confettiPieces = Array.from({ length: 12 }, (_, index) => index);
const numberFormatter = new Intl.NumberFormat("az-AZ");
const scoreFormatter = new Intl.NumberFormat("az-AZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type ReviewValidationResponse = {
  accepted?: boolean;
  text?: string;
  reason?: string | null;
  suggestion?: string | null;
};

export function TeacherEvaluation() {
  const [selectedId, setSelectedId] = useState<Teacher["id"] | null>(null);
  const [profileTeacher, setProfileTeacher] = useState<Teacher | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState<CriteriaRatings>({ ...defaultCriteriaRatings });
  const [reviewText, setReviewText] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewChecking, setReviewChecking] = useState(false);
  const [reviewError, setReviewError] = useState<ReviewValidationResponse | null>(null);
  const [newReviews, setNewReviews] = useState<TeacherReview[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const ratingPanelRef = useRef<HTMLDivElement>(null);
  const confirmationTimer = useRef<number | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const ratingScrollFrame = useRef<number | null>(null);
  const ratingScrollPending = useRef(false);
  const reduceMotion = useReducedMotion();
  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedId) ?? null;
  const allReviews = [...newReviews, ...teacherReviews];
  const rating = calculateCriteriaAverage(criteriaRatings);
  const localModeration = useMemo(() => moderateReview(reviewText), [reviewText]);
  const visibleModerationIssue = reviewText.trim() && !localModeration.accepted ? localModeration : null;
  const displayedError = reviewError ?? visibleModerationIssue;
  const canSubmit = Boolean(selectedTeacher)
    && areCriteriaComplete(criteriaRatings)
    && reviewText.trim().length >= 12
    && localModeration.accepted
    && !reviewSent
    && !reviewChecking;

  useEffect(() => () => {
    if (confirmationTimer.current) window.clearTimeout(confirmationTimer.current);
    if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current);
    if (ratingScrollFrame.current) window.cancelAnimationFrame(ratingScrollFrame.current);
  }, []);

  const openTeacherProfile = useCallback((teacher: Teacher) => {
    setProfileTeacher(teacher);
  }, []);

  const closeTeacherProfile = useCallback(() => {
    setProfileTeacher(null);
  }, []);

  const scrollToSelectedTeacherRating = useCallback(() => {
    if (!ratingScrollPending.current) return;
    ratingScrollPending.current = false;
    if (ratingScrollFrame.current) window.cancelAnimationFrame(ratingScrollFrame.current);
    ratingScrollFrame.current = window.requestAnimationFrame(() => {
      ratingScrollFrame.current = null;
      ratingPanelRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      ratingPanelRef.current?.focus({ preventScroll: true });
    });
  }, [reduceMotion]);

  function selectTeacher(teacher: Teacher) {
    if (reviewChecking) return;
    const alreadySelected = selectedId === teacher.id;
    if (!alreadySelected) {
      if (confirmationTimer.current) {
        window.clearTimeout(confirmationTimer.current);
        confirmationTimer.current = null;
      }
      setSelectedId(teacher.id);
      setCriteriaRatings({ ...defaultCriteriaRatings });
      setReviewText("");
      setReviewSent(false);
      setReviewError(null);
    }
    ratingScrollPending.current = true;
    closeTeacherProfile();
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
    if (scrollFrame.current) return;
    scrollFrame.current = window.requestAnimationFrame(() => {
      const card = track.querySelector<HTMLElement>(".teacher-card");
      scrollFrame.current = null;
      if (!card) return;
      const next = Math.min(teachers.length - 1, Math.max(0, Math.round(track.scrollLeft / (card.offsetWidth + 14))));
      setActiveIndex((current) => current === next ? current : next);
    });
  }

  function updateReviewText(event: ChangeEvent<HTMLTextAreaElement>) {
    setReviewText(event.target.value);
    setReviewError(null);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !selectedTeacher) return;

    setReviewChecking(true);
    setReviewError(null);

    let validation: ReviewValidationResponse;
    try {
      const response = await fetch("/api/reviews/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reviewText, criteria: criteriaRatings }),
      });
      validation = await response.json() as ReviewValidationResponse;
      if (!response.ok || !validation.accepted) {
        setReviewError({
          reason: validation.reason ?? "Rəy bu formada qəbul edilmədi.",
          suggestion: validation.suggestion ?? "Mətni tədris təcrübəsinə yönəldərək yenidən yoxla.",
        });
        return;
      }
    } catch {
      setReviewError({
        reason: "Rəyi indi yoxlaya bilmədik.",
        suggestion: "Mətnin saxlanılıb. Bağlantını yoxlayıb bir daha göndər.",
      });
      return;
    } finally {
      setReviewChecking(false);
    }

    setNewReviews((current) => [
      {
        id: `review-${selectedTeacher.id}-${Date.now()}`,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        author: "Sən",
        initials: "S",
        rating,
        text: validation.text ?? reviewText.trim(),
        date: "indi",
        course: selectedTeacher.subject,
        accent: selectedTeacher.accent,
        featured: true,
        criteria: { ...criteriaRatings },
      },
      ...current,
    ]);
    setReviewSent(true);

    if (confirmationTimer.current) window.clearTimeout(confirmationTimer.current);
    confirmationTimer.current = window.setTimeout(() => {
      setReviewSent(false);
      setCriteriaRatings({ ...defaultCriteriaRatings });
      setReviewText("");
    }, reduceMotion ? 900 : 2400);
  }

  return (
    <section id="teachers" className="teachers-section route-module-section" aria-labelledby="teachers-title">
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
          <h1 id="teachers-title" className="module-page-title">Müəllimlər</h1>
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
            isRatingTarget={selectedId === teacher.id}
            isProfileOpen={profileTeacher?.id === teacher.id}
            disabled={reviewChecking}
            scrollContainer={trackRef}
            onOpenProfile={openTeacherProfile}
          />
        ))}
        <span className="teachers-track-spacer" aria-hidden="true" />
      </div>

      <TeacherProfileDrawer
        teacher={profileTeacher}
        isRatingTarget={profileTeacher?.id === selectedId}
        selectionDisabled={reviewChecking}
        onClose={closeTeacherProfile}
        onExitComplete={scrollToSelectedTeacherRating}
        onChooseForRating={selectTeacher}
      />

      <AnimatePresence mode="wait" initial={false}>
        {selectedTeacher ? (
        <motion.div
          ref={ratingPanelRef}
          key={selectedTeacher.id}
          id="teacher-rating-panel"
          className="teacher-rating-panel"
          tabIndex={-1}
          role="region"
          aria-labelledby="teacher-rating-title"
          style={{ "--selected-accent": selectedTeacher.accent } as CSSProperties}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.994 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rating-panel-copy">
            <span><Sparkles size={13} /> Təcrübəni qiymətləndir</span>
            <h3 id="teacher-rating-title">{selectedTeacher.name} sənə necə kömək etdi?</h3>
            <p>Dörd peşəkar meyar üzrə səmimi rəyin digər tələbələrin daha doğru seçim etməsinə kömək edir.</p>
            <div className="rating-teacher-chip">
              <i>{selectedTeacher.initials}</i>
              <span><strong>{selectedTeacher.subject}</strong><small>{numberFormatter.format(selectedTeacher.reviewCount)} təsdiqlənmiş rəy</small></span>
            </div>
          </div>

          <form className="rating-form" onSubmit={submitReview}>
            <CriteriaRating
              value={criteriaRatings}
              onChange={(nextRatings) => {
                setCriteriaRatings(nextRatings);
                setReviewError(null);
              }}
              teacherName={selectedTeacher.name}
              disabled={reviewChecking || reviewSent}
              className="criteria-rating"
            />
            <div className={`rating-textarea${reviewText ? " has-value" : ""}${displayedError ? " has-error" : ""}`}>
              <textarea
                id="teacher-review"
                value={reviewText}
                onChange={updateReviewText}
                rows={5}
                minLength={12}
                maxLength={420}
                placeholder=" "
                aria-invalid={Boolean(displayedError)}
                aria-describedby={`teacher-review-guidance${displayedError ? " teacher-review-error" : ""}`}
                required
              />
              <label htmlFor="teacher-review">Dərs təcrübəndən konkret bir məqamı paylaş…</label>
              <span>{reviewText.length} / 420</span>
            </div>
            <p id="teacher-review-guidance" className="review-guidance">
              Şəxsi deyil, tədris təcrübəsini qiymətləndir: nə aydın idi, nəyi yaxşılaşdırmaq olardı?
            </p>
            <AnimatePresence initial={false}>
              {displayedError && (
                <motion.div
                  id="teacher-review-error"
                  className="review-moderation-message"
                  role="alert"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.99 }}
                >
                  <CircleAlert size={16} />
                  <p><strong>{displayedError.reason}</strong><span>{displayedError.suggestion}</span></p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="rating-form-footer">
              <small>{rating === 0 ? "Dörd meyarı tamamla" : `Orta qiymət: ${scoreFormatter.format(rating)} / 5`}</small>
              <motion.button type="submit" disabled={!canSubmit} whileTap={reduceMotion ? undefined : { scale: 0.96 }}>
                {reviewSent ? <Check size={15} /> : reviewChecking ? <i className="review-check-spinner" /> : <Send size={14} />}
                {reviewSent ? "Rəy göndərildi" : reviewChecking ? "Rəy yoxlanılır" : "Rəyi göndər"}
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
                  <span>Təşəkkür edirik — meyarlara əsaslanan, hörmətli fikrin icmaya daha doğru seçim etməyə kömək edir.</span>
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
      ) : (
        <motion.div
          key="rating-empty"
          className="teacher-rating-empty"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Sparkles size={18} aria-hidden="true" />
          <div>
            <span>Hələ müəllim seçilməyib</span>
            <h3>Əvvəl profillə tanış ol.</h3>
            <p>Müəllim kartına toxun, profili nəzərdən keçir və sonra qiymətləndirmək üçün seç.</p>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

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
