import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import {
  createEvent,
  deleteEvent,
  findEventById,
  listEvents,
  updateEvent,
  type EventCategory,
  type EventRecord,
} from "../db/business.js";
import {
  adminUpdateUser,
  createUser,
  deleteUser,
  listUsers,
  type UserRecord,
} from "../db/database.js";
import {
  createClub,
  deleteClub,
  getPlatformCounts,
  listClubs,
  updateClub,
  type ClubRecord,
} from "../db/platform.js";
import { ApiError } from "../lib/api-error.js";
import { hashPassword } from "../lib/auth.js";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

const userStatus = z.enum(["Aktiv", "Gözləmədə", "Məhdudlaşdırılıb"]);
const userRole = z.enum(["student", "mentor", "teacher", "admin"]);
const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  role: userRole,
  university: z.string().trim().min(2).max(180),
  faculty: z.string().trim().min(2).max(180),
  status: userStatus.optional(),
});
const clubSchema = z.object({
  name: z.string().trim().min(3).max(140),
  slug: z.string().trim().min(3).max(90).regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(2).max(80),
  coordinatorInitials: z.string().trim().min(2).max(6),
  status: userStatus.optional(),
});
const eventSchema = z.object({
  name: z.string().trim().min(3).max(140),
  category: z.string().trim().min(2).max(80),
  organizer: z.string().trim().min(2).max(180),
  startAt: z.string().datetime({ offset: true }),
  capacity: z.number().int().min(1).max(10_000),
  place: z.string().trim().min(2).max(180),
  status: z.enum(["Açıq", "Qaralama", "Tamamlanıb"]).optional(),
});

adminRouter.get("/overview", async (_request, response) => {
  const [users, events, platform] = await Promise.all([listUsers(10_000), listEvents(), getPlatformCounts()]);
  const activeUsers = users.filter((user) => user.status === "Aktiv").length;
  const openEvents = events.filter((event) => new Date(event.endAt).getTime() > Date.now()).length;
  const engagement = users.length ? Math.min(99, Math.round(((platform.memberships + platform.reviews) / users.length) * 100)) : 0;
  response.json({
    data: {
      updatedAt: new Date().toISOString(),
      metrics: [
        { id: "users", label: "Aktiv istifadəçi", value: String(activeUsers), change: `${users.length} ümumi`, trend: "up" },
        { id: "clubs", label: "Tələbə klubu", value: String(platform.clubs), change: `${platform.memberships} üzvlük`, trend: "up" },
        { id: "events", label: "Açıq tədbir", value: String(openEvents), change: `${events.length} ümumi`, trend: "steady" },
        { id: "engagement", label: "İştirak göstəricisi", value: `${engagement}%`, change: `${platform.reviews} rəy`, trend: "up" },
      ],
      activity: buildActivity(users.length, platform.clubs, events.length),
      distribution: buildDistribution(await listClubs()),
      recentActivity: [
        { id: "live-users", title: "İstifadəçi bazası aktivdir", description: `${users.length} hesab real verilənlər bazasında saxlanılır.`, timeLabel: "indi", occurredAt: new Date().toISOString(), tone: "lime" },
        { id: "live-clubs", title: "Klub üzvlükləri işləyir", description: `${platform.memberships} aktiv klub üzvlüyü mövcuddur.`, timeLabel: "indi", occurredAt: new Date().toISOString(), tone: "blue" },
        { id: "live-moderation", title: "Rəy moderasiyası aktivdir", description: `${platform.reviews} rəy moderasiya növbəsindədir.`, timeLabel: "indi", occurredAt: new Date().toISOString(), tone: "violet" },
      ],
    },
  });
});

adminRouter.get("/users", async (request, response) => {
  const users = (await listUsers(10_000)).map(toAdminUser);
  response.json({ data: paginate(filterRows(users, request.query), request.query) });
});

adminRouter.post("/users", async (request, response) => {
  const input = userSchema.parse(request.body);
  const user = await createUser({ ...input, passwordHash: await hashPassword(randomBytes(24).toString("base64url")) });
  response.status(201).json({ data: toAdminUser(user) });
});

adminRouter.patch("/users/:id", async (request, response) => {
  const id = z.string().parse(request.params.id);
  const user = await adminUpdateUser(id, userSchema.partial().parse(request.body));
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  response.json({ data: toAdminUser(user) });
});

adminRouter.delete("/users/:id", async (request, response) => {
  const id = z.string().parse(request.params.id);
  if (id === request.auth!.userId) throw new ApiError(409, "SELF_DELETE_FORBIDDEN", "Aktiv admin hesabını silmək olmaz.");
  if (!(await deleteUser(id))) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  response.status(204).send();
});

adminRouter.get("/clubs", async (request, response) => {
  const clubs = (await listClubs()).map(toAdminClub);
  response.json({ data: paginate(filterRows(clubs, request.query), request.query) });
});

adminRouter.post("/clubs", async (request, response) => {
  response.status(201).json({ data: toAdminClub(await createClub(clubSchema.parse(request.body))) });
});

adminRouter.patch("/clubs/:id", async (request, response) => {
  const club = await updateClub(z.string().parse(request.params.id), clubSchema.partial().parse(request.body));
  if (!club) throw new ApiError(404, "CLUB_NOT_FOUND", "Klub tapılmadı.");
  response.json({ data: toAdminClub(club) });
});

adminRouter.delete("/clubs/:id", async (request, response) => {
  if (!(await deleteClub(z.string().parse(request.params.id)))) throw new ApiError(404, "CLUB_NOT_FOUND", "Klub tapılmadı.");
  response.status(204).send();
});

adminRouter.get("/events", async (request, response) => {
  const events = (await listEvents()).map((event) => toAdminEvent(event));
  response.json({ data: paginate(filterRows(events, request.query), request.query) });
});

adminRouter.post("/events", async (request, response) => {
  const input = eventSchema.parse(request.body);
  const event = await createEvent(toEventInput(input), request.auth!.userId);
  response.status(201).json({ data: toAdminEvent(event, input.status) });
});

adminRouter.patch("/events/:id", async (request, response) => {
  const id = z.string().parse(request.params.id);
  const current = await findEventById(id);
  if (!current) throw new ApiError(404, "EVENT_NOT_FOUND", "Tədbir tapılmadı.");
  const patch = eventSchema.partial().parse(request.body);
  const merged = {
    name: patch.name ?? current.title,
    category: patch.category ?? current.category,
    organizer: patch.organizer ?? current.organizer,
    startAt: patch.startAt ?? current.startAt,
    capacity: patch.capacity ?? current.capacity,
    place: patch.place ?? current.location,
    status: patch.status,
  };
  const event = await updateEvent(id, toEventInput(merged));
  response.json({ data: toAdminEvent(event!, patch.status) });
});

adminRouter.delete("/events/:id", async (request, response) => {
  if (!(await deleteEvent(z.string().parse(request.params.id)))) throw new ApiError(404, "EVENT_NOT_FOUND", "Tədbir tapılmadı.");
  response.status(204).send();
});

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az")).join("");
}

function toAdminUser(user: UserRecord) {
  return {
    kind: "users", id: user.id, name: user.name, email: user.email, initials: initials(user.name), role: user.role,
    university: user.university, faculty: user.faculty, connectionCount: 0, joinedAt: user.createdAt,
    lastActiveAt: user.updatedAt, detail: `${user.role} · ${user.faculty}`, status: user.status,
    metric: "Real hesab", updatedAt: user.updatedAt,
  };
}

function toAdminClub(club: ClubRecord) {
  return {
    kind: "clubs", ...club, name: club.name, detail: `${club.category} · ${club.memberCount} üzv`,
    metric: `${club.eventCount} tədbir`, updatedAt: club.updatedAt,
  };
}

function eventStatus(event: EventRecord) {
  if (event.adminStatus) return event.adminStatus;
  return new Date(event.endAt).getTime() < Date.now() ? "Tamamlanıb" : "Açıq";
}

function toAdminEvent(event: EventRecord, status?: "Açıq" | "Qaralama" | "Tamamlanıb") {
  const attendeeCount = Math.max(0, event.capacity - event.availableSpots);
  return {
    kind: "events", id: event.id, name: event.title, category: event.category, organizer: event.organizer,
    startAt: event.startAt, attendeeCount, capacity: event.capacity, place: event.location,
    detail: `${event.category} · ${event.organizer}`, status: status ?? eventStatus(event),
    metric: `${attendeeCount}/${event.capacity} iştirakçı`, updatedAt: event.updatedAt,
  };
}

function normalizeCategory(value: string): EventCategory {
  const category = value.toLocaleLowerCase("az");
  if (category.includes("tex") || category.includes("tech")) return "Technology";
  if (category.includes("mədəni") || category.includes("culture") || category.includes("yarad")) return "Culture";
  if (category.includes("sağ") || category.includes("well") || category.includes("sosial")) return "Wellness";
  return "Design";
}

function toEventInput(input: { name: string; category: string; organizer: string; startAt: string; capacity: number; place: string; status?: "Açıq" | "Qaralama" | "Tamamlanıb" }) {
  const start = new Date(input.startAt);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const deadline = new Date(start.getTime() - 60 * 60 * 1000);
  return {
    title: input.name, category: normalizeCategory(input.category),
    description: `${input.name} üçün tələbə yönümlü açıq tədbir proqramı.`,
    longDescription: `${input.organizer} tərəfindən təşkil olunan tədbirdə iştirakçılar mövzu üzrə öyrənir, fikir mübadiləsi aparır və praktiki təcrübə qazanırlar.`,
    location: input.place, city: "Xankəndi", organizer: input.organizer,
    startAt: start.toISOString(), endAt: end.toISOString(), registrationDeadline: deadline.toISOString(),
    speakers: [], capacity: input.capacity, accent: "#c8ff4d", glow: "rgba(200, 255, 77, 0.28)",
    ...(input.status ? { adminStatus: input.status } : {}),
  };
}

function filterRows<T extends { name: string; status: string; category?: string; role?: string }>(rows: T[], query: Record<string, unknown>) {
  const search = String(query.search ?? "").trim().toLocaleLowerCase("az");
  return rows.filter((row) => {
    if (search && !row.name.toLocaleLowerCase("az").includes(search)) return false;
    if (query.status && row.status !== query.status) return false;
    if (query.category && row.category !== query.category) return false;
    if (query.role && row.role !== query.role) return false;
    return true;
  });
}

function paginate<T>(items: T[], query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
}

function buildActivity(users: number, clubs: number, events: number) {
  const labels = ["Mar", "Apr", "May", "İyn", "İyl", "Avq"];
  return labels.map((label, index) => ({ label, users: Math.max(0, users - (5 - index) * Math.ceil(users / 12)), clubs: Math.max(0, clubs - (5 - index)), events: Math.max(0, events - (5 - index)) }));
}

function buildDistribution(clubs: ClubRecord[]) {
  const colors = ["#c8ff4d", "#77b8ff", "#b9a7ff", "#ff9e7a", "#7ce8c3"];
  const grouped = new Map<string, number>();
  clubs.forEach((club) => grouped.set(club.category, (grouped.get(club.category) ?? 0) + 1));
  return [...grouped.entries()].map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));
}
