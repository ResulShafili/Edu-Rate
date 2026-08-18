import { Router } from "express";
import { z } from "zod";
import {
  createClub,
  deleteClub,
  findClub,
  joinClub,
  leaveClub,
  listClubs,
  listMyClubMemberships,
  updateClub,
} from "../db/platform.js";
import { ApiError } from "../lib/api-error.js";
import { addClubConversationMember, ensureClubConversation, removeClubConversationMember } from "../db/messaging.js";
import { findUserById } from "../db/database.js";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";

export const clubsRouter = Router();

const statusSchema = z.enum(["Aktiv", "Gözləmədə", "Məhdudlaşdırılıb"]);
const clubSchema = z.object({
  name: z.string().trim().min(3).max(140),
  slug: z.string().trim().min(3).max(90).regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(2).max(80),
  coordinatorInitials: z.string().trim().min(2).max(6),
  shortName:z.string().trim().min(2).max(100).optional(),
  tagline:z.string().trim().min(5).max(220).optional(),
  description:z.string().trim().min(10).max(800).optional(),
  about:z.array(z.string().trim().min(10).max(1200)).min(1).max(4).optional(),
  tone:z.enum(["lime","violet","cyan","coral","amber","mint"]).optional(),
  visualMark:z.string().trim().min(1).max(12).optional(),
  meeting:z.object({cadence:z.string().trim().min(2).max(80),day:z.string().trim().min(1).max(80),time:z.string().trim().min(1).max(40),place:z.string().trim().min(2).max(180)}).optional(),
  focusTags:z.array(z.string().trim().min(1).max(50)).min(1).max(8).optional(),
  status: statusSchema.optional(),
});

const clubApplicationSchema = z.object({
  name: z.string().trim().min(3).max(100),
  category: z.string().trim().min(2).max(60),
  tagline: z.string().trim().min(5).max(220),
  about: z.array(z.string().trim().min(10).max(1200)).min(1).max(4),
  meeting: z.object({
    cadence: z.string().trim().min(2).max(80),
    day: z.string().trim().min(1).max(80),
    time: z.string().trim().min(1).max(40),
    place: z.string().trim().min(2).max(180),
  }),
});

clubsRouter.get("/", async (_request, response) => {
  response.json({ data: (await listClubs()).filter((club) => club.status === "Aktiv") });
});

clubsRouter.get("/memberships/me", authenticate, async (request, response) => {
  response.json({ data: await listMyClubMemberships(request.auth!.userId) });
});

clubsRouter.get("/:clubId", async (request, response) => {
  const club = await findClub(z.string().parse(request.params.clubId));
  if (!club || club.status !== "Aktiv") throw new ApiError(404, "CLUB_NOT_FOUND", "Klub tapılmadı.");
  response.json({ data: club });
});

clubsRouter.post("/", authenticate, async (request, response) => {
  const allowedRoles = new Set(["teacher", "mentor", "assistant_admin", "admin"]);
  if (!allowedRoles.has(request.auth!.role)) {
    throw new ApiError(403, "CLUB_CREATOR_REQUIRED", "Klub yaratmaq müəllim, mentor və rəhbərlik hesabları üçün açıqdır.");
  }

  const input = clubApplicationSchema.parse(request.body);
  const creator = await findUserById(request.auth!.userId);
  if (!creator) throw new ApiError(401, "SESSION_USER_NOT_FOUND", "İstifadəçi hesabı tapılmadı.");
  const initials = creator.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az") ?? "").join("") || "ER";
  const baseSlug = input.name
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ğ/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "klub";
  const slug = `${baseSlug.slice(0, 72)}-${Date.now().toString(36).slice(-6)}`;
  const club = await createClub({
    ...input,
    slug,
    coordinatorInitials: initials,
    shortName: input.name,
    description: input.about[0]!.slice(0, 500),
    focusTags: [input.category],
    status: "Gözləmədə",
  }, request.auth!.userId);
  await ensureClubConversation(club);
  response.status(201).json({ data: club });
});

clubsRouter.patch("/:clubId", authenticate, async (request, response) => {
  const clubId = z.string().parse(request.params.clubId);
  const current = await findClub(clubId);
  if (!current) throw new ApiError(404, "CLUB_NOT_FOUND", "Klub tapılmadı.");
  const isLeadership = request.auth!.role === "admin" || request.auth!.role === "assistant_admin";
  if (!isLeadership && current.createdBy !== request.auth!.userId) {
    throw new ApiError(403, "CLUB_OWNER_REQUIRED", "Yalnız klubun yaradıcısı və ya rəhbərlik məlumatları dəyişə bilər.");
  }
  const input = clubSchema.partial().omit({ slug: true, coordinatorInitials: true, status: true }).parse(request.body);
  const club = await updateClub(clubId, input);
  if (!club) throw new ApiError(404, "CLUB_NOT_FOUND", "Klub tapılmadı.");
  response.json({ data: club });
});

clubsRouter.delete("/:clubId", authenticate, requireAdmin, async (request, response) => {
  const deleted = await deleteClub(z.string().parse(request.params.clubId));
  if (!deleted) throw new ApiError(404, "CLUB_NOT_FOUND", "Klub tapılmadı.");
  response.status(204).send();
});

clubsRouter.post("/:clubId/memberships", authenticate, async (request, response) => {
  const club = await joinClub(z.string().parse(request.params.clubId), request.auth!.userId);
  await addClubConversationMember(club, request.auth!.userId);
  response.status(201).json({ data: { joined: true, club } });
});

clubsRouter.delete("/:clubId/memberships", authenticate, async (request, response) => {
  const club = await leaveClub(z.string().parse(request.params.clubId), request.auth!.userId);
  await removeClubConversationMember(club.id, request.auth!.userId);
  response.json({ data: { joined: false, club } });
});
