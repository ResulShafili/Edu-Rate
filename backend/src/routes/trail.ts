import { Router } from "express";
import { listMyEventRegistrations } from "../db/business.js";
import { listMyClubMemberships, listTeacherReviews } from "../db/platform.js";
import { countUserContributions } from "../db/questions.js";
import { listTimetable } from "../db/timetable.js";
import { findUserById } from "../db/database.js";
import { ApiError } from "../lib/api-error.js";
import { authenticate } from "../middleware/authenticate.js";

export const trailRouter = Router();
trailRouter.use(authenticate);

/**
 * "Kampus izi" — süni xal deyil, real fəaliyyətin xülasəsi.
 * Hər rəqəm istifadəçinin öz məlumatından hesablanır.
 */
trailRouter.get("/", async (request, response) => {
  const userId = request.auth!.userId;
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");

  const [clubs, events, reviews, contributions, timetable] = await Promise.all([
    listMyClubMemberships(userId),
    listMyEventRegistrations(userId),
    listTeacherReviews({ userId, limit: 200 }),
    countUserContributions(userId),
    listTimetable(userId),
  ]);

  const approvedReviews = reviews.filter((review) => review.status === "approved").length;
  const now = Date.now();
  const attended = events.filter((event) => new Date(event.endAt).getTime() < now).length;
  const upcoming = events.length - attended;

  response.json({
    data: {
      joinedAt: user.createdAt,
      clubs: clubs.length,
      clubNames: clubs.slice(0, 4).map((club) => club.name),
      eventsAttended: attended,
      eventsUpcoming: upcoming,
      reviews: approvedReviews,
      questions: contributions.questions,
      answers: contributions.answers,
      lessons: timetable.length,
    },
  });
});
