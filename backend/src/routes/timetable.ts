import { Router } from "express";
import { z } from "zod";
import {
  createTimetableEntry,
  deleteTimetableEntry,
  listTimetable,
  updateTimetableEntry,
  TIMETABLE_TONES,
} from "../db/timetable.js";
import { ApiError } from "../lib/api-error.js";
import { authenticate } from "../middleware/authenticate.js";

export const timetableRouter = Router();
timetableRouter.use(authenticate);

const entrySchema = z.object({
  subject: z.string().trim().min(2).max(120),
  teacher: z.string().trim().max(120).default(""),
  room: z.string().trim().max(80).default(""),
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  startMinute: z.coerce.number().int().min(0).max(1439),
  endMinute: z.coerce.number().int().min(1).max(1440),
  tone: z.enum(TIMETABLE_TONES).default("mint"),
}).strict().refine((value) => value.endMinute > value.startMinute, {
  path: ["endMinute"],
  message: "Bitmə vaxtı başlama vaxtından sonra olmalıdır.",
});

timetableRouter.get("/", async (request, response) => {
  response.json({ data: await listTimetable(request.auth!.userId) });
});

timetableRouter.post("/", async (request, response) => {
  const input = entrySchema.parse(request.body);
  response.status(201).json({ data: await createTimetableEntry(request.auth!.userId, input) });
});

timetableRouter.patch("/:id", async (request, response) => {
  const id = z.string().uuid().parse(request.params.id);
  const patch = entrySchema.partial().parse(request.body);
  if (patch.startMinute !== undefined && patch.endMinute !== undefined && patch.endMinute <= patch.startMinute) {
    throw new ApiError(422, "INVALID_TIME_RANGE", "Bitmə vaxtı başlama vaxtından sonra olmalıdır.");
  }
  const entry = await updateTimetableEntry(request.auth!.userId, id, patch);
  if (!entry) throw new ApiError(404, "TIMETABLE_ENTRY_NOT_FOUND", "Cədvəl qeydi tapılmadı.");
  response.json({ data: entry });
});

timetableRouter.delete("/:id", async (request, response) => {
  const id = z.string().uuid().parse(request.params.id);
  if (!(await deleteTimetableEntry(request.auth!.userId, id))) {
    throw new ApiError(404, "TIMETABLE_ENTRY_NOT_FOUND", "Cədvəl qeydi tapılmadı.");
  }
  response.status(204).send();
});
