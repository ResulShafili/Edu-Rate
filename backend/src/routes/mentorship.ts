import { Router } from "express";
import { z } from "zod";
import { mentors } from "../data/catalog.js";
import {
  createMentorshipRequest,
  deleteMentorshipRequest,
  listMentorshipRequests,
  updateMentorshipRequest,
} from "../db/business.js";
import { ApiError } from "../lib/api-error.js";
import { authenticate } from "../middleware/authenticate.js";

export const mentorshipRouter = Router();

const requestSchema = z.object({
  mentorId: z.string().trim().min(2).max(120),
  note: z.string().trim().max(600).default(""),
});
const updateSchema = z.object({ note: z.string().trim().max(600) });

mentorshipRouter.use(authenticate);

mentorshipRouter.get("/", async (request, response) => {
  response.json({ data: await listMentorshipRequests(request.auth!.userId) });
});

mentorshipRouter.post("/", async (request, response) => {
  const input = requestSchema.parse(request.body);
  if (!mentors.some((mentor) => mentor.id === input.mentorId && mentor.available)) {
    throw new ApiError(404, "MENTOR_NOT_FOUND", "Aktiv mentor tapılmadı.");
  }
  response.status(201).json({ data: await createMentorshipRequest(request.auth!.userId, input.mentorId, input.note) });
});

mentorshipRouter.patch("/:requestId", async (request, response) => {
  const requestId = z.string().uuid().parse(request.params.requestId);
  const { note } = updateSchema.parse(request.body);
  const mentorshipRequest = await updateMentorshipRequest(requestId, request.auth!.userId, note);
  if (!mentorshipRequest) throw new ApiError(404, "MENTORSHIP_REQUEST_NOT_FOUND", "Dəyişdirilə bilən müraciət tapılmadı.");
  response.json({ data: mentorshipRequest });
});

mentorshipRouter.delete("/:requestId", async (request, response) => {
  const requestId = z.string().uuid().parse(request.params.requestId);
  const deleted = await deleteMentorshipRequest(requestId, request.auth!.userId);
  if (!deleted) throw new ApiError(404, "MENTORSHIP_REQUEST_NOT_FOUND", "Silinə bilən müraciət tapılmadı.");
  response.status(204).send();
});
