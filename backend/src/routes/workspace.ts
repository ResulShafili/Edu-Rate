import { Router } from "express";
import { z } from "zod";
import { decideMentorshipRequest, listEvents, listMentorRequests, listMentorshipRequests, listMyEventRegistrations } from "../db/business.js";
import { findUserById, listUsers } from "../db/database.js";
import { getPlatformCounts, listMyClubMemberships, listTeacherReviews } from "../db/platform.js";
import { ApiError } from "../lib/api-error.js";
import { authenticate } from "../middleware/authenticate.js";

export const workspaceRouter = Router();
workspaceRouter.use(authenticate);

workspaceRouter.get("/", async (request, response) => {
  const user = await findUserById(request.auth!.userId);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");

  if (user.role === "teacher") {
    const reviews = await listTeacherReviews({ teacherId: normalizeRoleId(user.name), limit: 100 });
    const approved = reviews.filter((review) => review.status === "approved");
    const average = approved.length ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length : 0;
    response.json({ data: { role: user.role, title: "Müəllim paneli", focus: user.program, metrics: [
      { label: "Təsdiqlənmiş rəy", value: approved.length },
      { label: "Gözləyən rəy", value: reviews.filter((review) => review.status === "pending").length },
      { label: "Orta qiymət", value: average ? average.toFixed(1) : "—" },
    ], items: reviews.slice(0, 8).map(({ userId: _userId, ...review }) => review) } });
    return;
  }

  if (user.role === "mentor") {
    const requests = await listMentorRequests(normalizeRoleId(user.name));
    const items = await Promise.all(requests.slice(0, 12).map(async (item) => {
      const requester = await findUserById(item.userId);
      return {
        ...item,
        userId: undefined,
        title: requester?.name ?? "Tələbə müraciəti",
        course: requester?.program ?? "Mentorluq",
      };
    }));
    response.json({ data: { role: user.role, title: "Mentor paneli", focus: user.program, metrics: [
      { label: "Yeni müraciət", value: requests.filter((item) => item.status === "pending").length },
      { label: "Qəbul edilib", value: requests.filter((item) => item.status === "accepted").length },
      { label: "Ümumi müraciət", value: requests.length },
    ], items } });
    return;
  }

  if (user.role === "admin" || user.role === "assistant_admin") {
    const [users, events, counts] = await Promise.all([listUsers(10_000), listEvents(), getPlatformCounts()]);
    response.json({ data: { role: user.role, title: "Rəhbərlik paneli", focus: "Platforma idarəetməsi", metrics: [
      { label: "İstifadəçi", value: users.length },
      { label: "Tədbir", value: events.length },
      { label: "Klub", value: counts.clubs },
    ], items: [] } });
    return;
  }

  const [events, clubs, mentorships] = await Promise.all([
    listMyEventRegistrations(user.id), listMyClubMemberships(user.id), listMentorshipRequests(user.id),
  ]);
  response.json({ data: { role: user.role, title: "Tələbə paneli", focus: user.program, metrics: [
    { label: "Tədbir qeydiyyatı", value: events.length },
    { label: "Klub üzvlüyü", value: clubs.length },
    { label: "Mentorluq müraciəti", value: mentorships.length },
  ], items: [
    ...events.slice(0, 4).map((item) => ({ id: item.id, title: item.title, status: "Qeydiyyat aktivdir", type: "Tədbir" })),
    ...clubs.slice(0, 4).map((item) => ({ id: item.id, title: item.name, status: "Klub üzvü", type: "Klub" })),
    ...mentorships.slice(0, 4).map((item) => ({ id: item.id, title: "Mentorluq müraciəti", text: item.note, status: item.status, type: "Mentor" })),
  ] } });
});

workspaceRouter.patch("/mentorship/:id", async (request, response) => {
  if (request.auth!.role !== "mentor") throw new ApiError(403, "MENTOR_REQUIRED", "Bu əməliyyat yalnız mentor üçündür.");
  const user = await findUserById(request.auth!.userId);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  const id = z.string().uuid().parse(request.params.id);
  const { status } = z.object({ status: z.enum(["accepted", "rejected"]) }).strict().parse(request.body);
  const result = await decideMentorshipRequest(id, normalizeRoleId(user.name), status);
  if (!result) throw new ApiError(404, "MENTORSHIP_REQUEST_NOT_FOUND", "Gözləyən mentorluq müraciəti tapılmadı.");
  response.json({ data: result });
});

function normalizeRoleId(value: string) {
  return value.toLocaleLowerCase("az").replace(/[ə]/g, "e").replace(/[ı]/g, "i").replace(/[ş]/g, "s").replace(/[ç]/g, "c").replace(/[ö]/g, "o").replace(/[ü]/g, "u").replace(/[ğ]/g, "g").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
