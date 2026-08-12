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

clubsRouter.post("/", authenticate, requireAdmin, async (request, response) => {
  response.status(201).json({ data: await createClub(clubSchema.parse(request.body)) });
});

clubsRouter.patch("/:clubId", authenticate, requireAdmin, async (request, response) => {
  const clubId = z.string().parse(request.params.clubId);
  const club = await updateClub(clubId, clubSchema.partial().parse(request.body));
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
  response.status(201).json({ data: { joined: true, club } });
});

clubsRouter.delete("/:clubId/memberships", authenticate, async (request, response) => {
  const club = await leaveClub(z.string().parse(request.params.clubId), request.auth!.userId);
  response.json({ data: { joined: false, club } });
});
