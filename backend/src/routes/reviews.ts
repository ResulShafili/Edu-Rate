import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { createTeacherReview } from "../db/platform.js";
import { ApiError } from "../lib/api-error.js";
import { authenticate } from "../middleware/authenticate.js";

export const reviewsRouter = Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Çox sayda rəy cəhdi edildi." } },
});

const score = z.number().int().min(1).max(5);
const reviewSchema = z.object({
  teacherId: z.string().trim().min(2).max(120),
  course: z.string().trim().min(2).max(180),
  semester: z.string().trim().min(2).max(80),
  text: z.string().trim().min(12).max(1200),
  criteria: z.object({
    clarity: score,
    subjectKnowledge: score,
    objectivity: score,
    communication: score,
  }),
});

const blockedWords = /(?:siktir|qəhbə|orospu|peysər|gijdıllaq|götverən|axmaq|səfeh|beyinsiz|idiot)/iu;
const contactDetails = /(?:https?:\/\/|www\.|\b[^\s@]+@[^\s@]+\.[^\s@]+\b)/iu;

reviewsRouter.post("/", limiter, authenticate, async (request, response) => {
  const input = reviewSchema.parse(request.body);
  if (blockedWords.test(input.text)) {
    throw new ApiError(422, "REVIEW_MODERATION_FAILED", "Rəydə təhqir və ya nalayiq ifadə istifadə etmək olmaz.");
  }
  if (contactDetails.test(input.text)) {
    throw new ApiError(422, "REVIEW_CONTACT_DETAILS", "Rəydə keçid və ya əlaqə məlumatı paylaşmaq olmaz.");
  }
  const review = await createTeacherReview(request.auth!.userId, input);
  response.status(201).json({ data: review });
});
