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
  assistantUpdateUserRole,
  adminUpdateUser,
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  type UserRecord,
} from "../db/database.js";
import {
  createClub,
  deleteClub,
  getPlatformCounts,
  listTeacherReviews,
  listClubs,
  updateTeacherReviewStatus,
  updateClub,
  type ClubRecord,
} from "../db/platform.js";
import { ApiError } from "../lib/api-error.js";
import { hashPassword } from "../lib/auth.js";
import { authenticate, requireAdmin, requirePrimaryAdmin } from "../middleware/authenticate.js";
import { ensureProfessionalProfileForUser } from "../db/professionals.js";
import { listAudit, writeAudit } from "../db/audit.js";
import { createAnnouncement, deleteAnnouncement, listAdminAnnouncements, updateAnnouncement } from "../db/network.js";

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

const userStatus = z.enum(["Aktiv", "Gözləmədə", "Məhdudlaşdırılıb"]);
const userRole = z.enum(["student", "mentor", "teacher", "assistant_admin", "admin"]);
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
const announcementSchema=z.object({category:z.enum(["official","faculties","clubs","scholarship","events"]),title:z.string().trim().min(3).max(180),summary:z.string().trim().min(10).max(800),source:z.string().trim().min(2).max(140),sourceInitials:z.string().trim().min(1).max(8),tone:z.enum(["lime","lilac","blue","coral","mint","gold"]),startsAt:z.string().datetime({offset:true}),expiresAt:z.string().datetime({offset:true}),priority:z.boolean().default(false),status:z.enum(["draft","published"]).default("draft")});

adminRouter.get("/overview", async (_request, response) => {
  const [users, events, platform, audit] = await Promise.all([listUsers(10_000), listEvents(false), getPlatformCounts(), listAudit(6)]);
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
      recentActivity: audit.length ? audit.map((item)=>({id:item.id,title:item.action,description:`${item.actor} · ${item.entityType}`,timeLabel:"audit",occurredAt:item.occurredAt,tone:"lime"})) : [
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

adminRouter.post("/users", requirePrimaryAdmin, async (request, response) => {
  const input = userSchema.parse(request.body);
  const user = await createUser({ ...input, passwordHash: await hashPassword(randomBytes(24).toString("base64url")) });
  response.status(201).json({ data: toAdminUser(user) });
});

adminRouter.patch("/users/:id", async (request, response) => {
  const id = z.string().parse(request.params.id);

  if (request.auth!.role === "assistant_admin") {
    const input = z.object({ role: userRole }).strict().parse(request.body);
    if (input.role === "admin" || input.role === "assistant_admin") {
      throw new ApiError(
        403,
        "ROLE_ESCALATION_FORBIDDEN",
        "Admin köməkçisi administrator rütbəsi verə bilməz.",
      );
    }
    const target = await findUserById(id);
    if (!target) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
    if (target.role === "admin" || target.role === "assistant_admin") {
      throw new ApiError(
        403,
        "PRIVILEGED_USER_MODIFICATION_FORBIDDEN",
        "Admin köməkçisi administrator hesablarını və öz hesabını dəyişə bilməz.",
      );
    }
    const user = await assistantUpdateUserRole(id, input.role);
    if (!user) {
      throw new ApiError(
        409,
        "USER_ROLE_CHANGED",
        "İstifadəçinin rolu dəyişib. Siyahını yeniləyib təkrar yoxlayın.",
      );
    }
    await ensureProfessionalProfileForUser(user);
    await writeAudit(request.auth!.userId,"İstifadəçi rolu dəyişdirildi","user",id,{role:input.role});
    response.json({ data: toAdminUser(user) });
    return;
  }

  const patch = userSchema.partial().parse(request.body);
  if (
    id === request.auth!.userId &&
    ((patch.role !== undefined && patch.role !== "admin") ||
      (patch.status !== undefined && patch.status !== "Aktiv"))
  ) {
    throw new ApiError(
      409,
      "SELF_ADMIN_LOCKOUT_FORBIDDEN",
      "Aktiv admin öz rolunu və ya statusunu məhdudlaşdıra bilməz.",
    );
  }
  const user = await adminUpdateUser(id, patch);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  await ensureProfessionalProfileForUser(user);
  await writeAudit(request.auth!.userId,"İstifadəçi yeniləndi","user",id,{role:patch.role,status:patch.status});
  response.json({ data: toAdminUser(user) });
});

adminRouter.delete("/users/:id", requirePrimaryAdmin, async (request, response) => {
  const id = z.string().parse(request.params.id);
  if (id === request.auth!.userId) throw new ApiError(409, "SELF_DELETE_FORBIDDEN", "Aktiv admin hesabını silmək olmaz.");
  if (!(await deleteUser(id))) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  await writeAudit(request.auth!.userId,"İstifadəçi silindi","user",id);
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
  const events = (await listEvents(false)).map((event) => toAdminEvent(event));
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
  const mergedAdmin = {
    name: patch.name ?? current.title,
    category: patch.category ?? current.category,
    organizer: patch.organizer ?? current.organizer,
    startAt: patch.startAt ?? current.startAt,
    capacity: patch.capacity ?? current.capacity,
    place: patch.place ?? current.location,
    status: patch.status,
  };
  const generated = toEventInput(mergedAdmin);
  const event = await updateEvent(id, {
    ...current,
    title: generated.title,
    category: generated.category,
    organizer: generated.organizer,
    location: generated.location,
    capacity: generated.capacity,
    startAt: generated.startAt,
    endAt: patch.startAt ? generated.endAt : current.endAt,
    registrationDeadline: patch.startAt ? generated.registrationDeadline : current.registrationDeadline,
    adminStatus: patch.status ?? current.adminStatus,
  });
  response.json({ data: toAdminEvent(event!, patch.status) });
});

adminRouter.delete("/events/:id", async (request, response) => {
  if (!(await deleteEvent(z.string().parse(request.params.id)))) throw new ApiError(404, "EVENT_NOT_FOUND", "Tədbir tapılmadı.");
  response.status(204).send();
});

adminRouter.get("/announcements",async(_request,response)=>response.json({data:await listAdminAnnouncements()}));
adminRouter.post("/announcements",async(request,response)=>{const item=await createAnnouncement(announcementSchema.parse(request.body));await writeAudit(request.auth!.userId,"Elan yaradıldı","announcement",String(item.id));response.status(201).json({data:item});});
adminRouter.patch("/announcements/:id",async(request,response)=>{const id=z.string().parse(request.params.id);const item=await updateAnnouncement(id,announcementSchema.partial().parse(request.body));if(!item)throw new ApiError(404,"ANNOUNCEMENT_NOT_FOUND","Elan tapılmadı.");await writeAudit(request.auth!.userId,"Elan yeniləndi","announcement",id);response.json({data:item});});
adminRouter.delete("/announcements/:id",async(request,response)=>{const id=z.string().parse(request.params.id);if(!await deleteAnnouncement(id))throw new ApiError(404,"ANNOUNCEMENT_NOT_FOUND","Elan tapılmadı.");await writeAudit(request.auth!.userId,"Elan silindi","announcement",id);response.status(204).send();});

adminRouter.get("/reviews", async (request, response) => {
  const query = z.object({
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
    teacherId: z.string().trim().min(2).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }).parse(request.query);
  const reviews = await listTeacherReviews(query);
  response.json({ data: reviews });
});

adminRouter.patch("/reviews/:id", async (request, response) => {
  const id = z.string().uuid().parse(request.params.id);
  const { status } = z.object({ status: z.enum(["approved", "rejected"]) }).strict().parse(request.body);
  const review = await updateTeacherReviewStatus(id, status);
  if (!review) throw new ApiError(404, "REVIEW_NOT_FOUND", "Rəy tapılmadı.");
  response.json({ data: review });
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
