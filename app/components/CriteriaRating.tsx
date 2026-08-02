"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  useId,
  useRef,
  type KeyboardEvent,
} from "react";
import { formatDecimalScore } from "../lib/number-format";

export type ReviewCriterionKey =
  | "clarity"
  | "subjectKnowledge"
  | "objectivity"
  | "communication";

export type CriterionRating = 0 | 1 | 2 | 3 | 4 | 5;

export type CriteriaRatings = Record<ReviewCriterionKey, CriterionRating>;

export const criteriaLabels: Record<ReviewCriterionKey, string> = {
  clarity: "İzahın aydınlığı",
  subjectKnowledge: "Fənn biliyi",
  objectivity: "Obyektivlik",
  communication: "Ünsiyyət və dəstək",
};

export const defaultCriteriaRatings: Readonly<CriteriaRatings> = Object.freeze({
  clarity: 0,
  subjectKnowledge: 0,
  objectivity: 0,
  communication: 0,
});

const criteriaDescriptions: Record<ReviewCriterionKey, string> = {
  clarity: "Mövzunu anlaşılan şəkildə izah etməsi",
  subjectKnowledge: "Məzmunu dəqiq və dolğun bilməsi",
  objectivity: "Ədalətli və qərəzsiz yanaşması",
  communication: "Dinləmə və cavab vermə üslubu",
};

const criterionKeys = Object.keys(criteriaLabels) as ReviewCriterionKey[];
const ratingOptions = [1, 2, 3, 4, 5] as const;

export function calculateCriteriaAverage(ratings: CriteriaRatings) {
  const selectedRatings = criterionKeys
    .map((key) => ratings[key])
    .filter((rating): rating is Exclude<CriterionRating, 0> => rating > 0);

  if (selectedRatings.length === 0) return 0;
  const total = selectedRatings.reduce((sum, rating) => sum + rating, 0);
  return Number((total / selectedRatings.length).toFixed(1));
}

export function areCriteriaComplete(ratings: CriteriaRatings) {
  return criterionKeys.every((key) => ratings[key] > 0);
}

type CriteriaRatingProps = {
  value: CriteriaRatings;
  onChange: (ratings: CriteriaRatings) => void;
  teacherName?: string;
  disabled?: boolean;
  className?: string;
};

type CriterionRowProps = {
  criterion: ReviewCriterionKey;
  value: CriterionRating;
  onChange: (rating: Exclude<CriterionRating, 0>) => void;
  teacherName?: string;
  disabled: boolean;
  rowId: string;
  reduceMotion: boolean;
};

function getNextRating(key: string, current: number) {
  if (key === "ArrowRight" || key === "ArrowUp") return Math.min(5, current + 1);
  if (key === "ArrowLeft" || key === "ArrowDown") return Math.max(1, current - 1);
  if (key === "Home") return 1;
  if (key === "End") return 5;
  return null;
}

function CriterionRow({
  criterion,
  value,
  onChange,
  teacherName,
  disabled,
  rowId,
  reduceMotion,
}: CriterionRowProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const legendId = `${rowId}-legend`;
  const descriptionId = `${rowId}-description`;
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 440, damping: 27, mass: 0.55 };

  function handleKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    currentRating: Exclude<CriterionRating, 0>,
  ) {
    const nextRating = getNextRating(event.key, currentRating);
    if (nextRating === null) return;

    event.preventDefault();
    const rating = nextRating as Exclude<CriterionRating, 0>;
    onChange(rating);
    buttonRefs.current[rating - 1]?.focus();
  }

  return (
    <fieldset
      className="min-w-0 border-0 border-b border-white/10 p-0 pb-4 last:border-b-0 last:pb-0"
      disabled={disabled}
    >
      <legend
        id={legendId}
        className="p-0 text-sm font-semibold tracking-[-0.01em] text-[var(--paper)]"
      >
        {criteriaLabels[criterion]}
      </legend>

      <div className="mt-1 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p
          id={descriptionId}
          className="m-0 text-xs leading-5 text-[color:rgba(243,241,233,0.58)]"
        >
          {criteriaDescriptions[criterion]}
        </p>

        <div
          className="flex items-center gap-1.5"
          role="radiogroup"
          aria-labelledby={legendId}
          aria-describedby={descriptionId}
        >
          {ratingOptions.map((rating) => {
            const selected = value === rating;
            const buttonLabel = teacherName
              ? `${teacherName} — ${criteriaLabels[criterion]}: ${rating} bal`
              : `${criteriaLabels[criterion]}: ${rating} bal`;

            return (
              <motion.button
                key={rating}
                ref={(node) => {
                  buttonRefs.current[rating - 1] = node;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={buttonLabel}
                tabIndex={selected || (value === 0 && rating === 1) ? 0 : -1}
                disabled={disabled}
                className={`relative grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected
                    ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--ink)]"
                    : "border-white/16 bg-white/[0.045] text-[color:rgba(243,241,233,0.68)]"
                }`}
                animate={
                  selected
                    ? { opacity: 1, scale: 1.08, y: -1 }
                    : { opacity: 0.78, scale: 1, y: 0 }
                }
                whileHover={disabled || reduceMotion ? undefined : { opacity: 1, scale: 1.06, y: -1 }}
                whileTap={disabled || reduceMotion ? undefined : { scale: 0.92 }}
                transition={transition}
                onClick={() => onChange(rating)}
                onKeyDown={(event) => handleKeyboard(event, rating)}
              >
                {rating}
              </motion.button>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

export function CriteriaRating({
  value,
  onChange,
  teacherName,
  disabled = false,
  className = "",
}: CriteriaRatingProps) {
  const id = useId().replace(/:/gu, "");
  const reduceMotion = Boolean(useReducedMotion());
  const average = calculateCriteriaAverage(value);
  const selectedCount = criterionKeys.filter((key) => value[key] > 0).length;

  function updateCriterion(
    criterion: ReviewCriterionKey,
    rating: Exclude<CriterionRating, 0>,
  ) {
    onChange({ ...value, [criterion]: rating });
  }

  return (
    <section
      className={`criteria-rating-shell rounded-[1.4rem] border border-white/10 p-4 sm:p-5 ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--lime)]">
            Meyarlar üzrə
          </p>
          <h3 id={`${id}-title`} className="m-0 text-base font-semibold text-[var(--paper)]">
            Tədris təcrübəsini qiymətləndir
          </h3>
        </div>

        <motion.output
          className="shrink-0 text-right"
          aria-label={average > 0 ? `Orta qiymət: ${formatDecimalScore(average)} bal` : "Qiymət seçilməyib"}
          aria-live="polite"
          animate={{ opacity: average > 0 ? 1 : 0.55, scale: average > 0 ? 1 : 0.96 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 390, damping: 28, mass: 0.6 }
          }
        >
          <strong className="block text-xl leading-none text-[var(--paper)]">
            {average > 0 ? formatDecimalScore(average) : "—"}
          </strong>
          <span className="mt-1 block text-[0.65rem] text-[color:rgba(243,241,233,0.5)]">
            {selectedCount}/4 meyar
          </span>
        </motion.output>
      </div>

      <div className="grid gap-4">
        {criterionKeys.map((criterion) => (
          <CriterionRow
            key={criterion}
            criterion={criterion}
            value={value[criterion]}
            onChange={(rating) => updateCriterion(criterion, rating)}
            teacherName={teacherName}
            disabled={disabled}
            rowId={`${id}-${criterion}`}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}
