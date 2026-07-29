import "server-only";

import {
  adminDemoClubs,
  adminDemoEvents,
  adminDemoOverview,
  adminDemoUsers,
  adminRoleLabels,
  type AdminClub,
  type AdminClubCreateInput,
  type AdminClubUpdateInput,
  type AdminEvent,
  type AdminEventCreateInput,
  type AdminEventUpdateInput,
  type AdminOverview,
  type AdminPage,
  type AdminRecordBase,
  type AdminUser,
  type AdminUserCreateInput,
  type AdminUserUpdateInput,
} from "../data/admin";
import { ApiError, type ApiMockRequest } from "../lib/api/client";

let users: AdminUser[] = adminDemoUsers.map((item) => ({ ...item }));
let clubs: AdminClub[] = adminDemoClubs.map((item) => ({ ...item }));
let events: AdminEvent[] = adminDemoEvents.map((item) => ({ ...item }));

const initialCounts = {
  users: users.filter((item) => item.status === "Aktiv").length,
  clubs: clubs.length,
  events: events.filter((item) => item.status === "Açıq").length,
};

export function handleAdminMockRequest(request: ApiMockRequest): unknown {
  const segments = request.path.split("/").filter(Boolean).map(decodeURIComponent);
  const [, collection, id] = segments;
  if (segments[0] !== "admin") throw apiFailure(404, "ADMIN_ROUTE_NOT_FOUND", "İdarəetmə marşrutu tapılmadı.");
  if (collection === "overview" && request.method === "GET") return createOverview();
  if (collection === "users") return handleUsers(request, id);
  if (collection === "clubs") return handleClubs(request, id);
  if (collection === "events") return handleEvents(request, id);
  throw apiFailure(404, "ADMIN_ROUTE_NOT_FOUND", "İdarəetmə marşrutu tapılmadı.");
}

function handleUsers(request: ApiMockRequest, id?: string): unknown {
  if (request.method === "GET" && !id) {
    let result = filterRecords(users, request.query);
    const role = request.query.get("role");
    if (role) result = result.filter((item) => item.role === role);
    return paginate(result, request.query);
  }
  if (request.method === "POST" && !id) {
    const input = requireBody<AdminUserCreateInput>(request.body);
    if (!input.name?.trim() || !input.email?.trim() || !input.role || !input.faculty?.trim()) {
      throw apiFailure(400, "INVALID_USER", "İstifadəçi məlumatlarını tam daxil edin.");
    }
    if (users.some((item) => item.email.toLowerCase() === input.email.toLowerCase())) {
      throw apiFailure(409, "EMAIL_ALREADY_EXISTS", "Bu e-poçt ünvanı artıq istifadə olunur.");
    }
    const now = new Date().toISOString();
    const record: AdminUser = {
      kind: "users", id: createId("usr"), name: input.name.trim(), email: input.email.trim().toLowerCase(),
      initials: initials(input.name), role: input.role, university: input.university, faculty: input.faculty,
      connectionCount: 0, joinedAt: now, lastActiveAt: now,
      detail: `${adminRoleLabels[input.role]} · ${input.faculty}`, status: input.status ?? "Gözləmədə",
      metric: "0 əlaqə", updatedAt: now,
    };
    users = [record, ...users];
    return record;
  }
  if (request.method === "PATCH" && id) {
    const current = find(users, id);
    const input = requireBody<AdminUserUpdateInput>(request.body);
    const next = { ...current, ...input, updatedAt: new Date().toISOString() };
    next.initials = initials(next.name);
    next.detail = `${adminRoleLabels[next.role]} · ${next.faculty}`;
    users = replace(users, next);
    return next;
  }
  if (request.method === "DELETE" && id) {
    find(users, id);
    users = users.filter((item) => item.id !== id);
    return undefined;
  }
  return methodNotAllowed();
}

function handleClubs(request: ApiMockRequest, id?: string): unknown {
  if (request.method === "GET" && !id) {
    let result = filterRecords(clubs, request.query);
    const category = request.query.get("category");
    if (category) result = result.filter((item) => item.category === category);
    return paginate(result, request.query);
  }
  if (request.method === "POST" && !id) {
    const input = requireBody<AdminClubCreateInput>(request.body);
    if (!input.name?.trim() || !input.slug?.trim() || !input.category?.trim()) {
      throw apiFailure(400, "INVALID_CLUB", "Klub məlumatlarını tam daxil edin.");
    }
    const now = new Date().toISOString();
    const record: AdminClub = {
      kind: "clubs", id: createId("club"), ...input, name: input.name.trim(), slug: input.slug.trim(),
      memberCount: 0, eventCount: 0, createdAt: now,
      detail: `${input.category} · ${input.coordinatorInitials} tərəfindən idarə olunur`,
      status: input.status ?? "Gözləmədə", metric: "0 üzv", updatedAt: now,
    };
    clubs = [record, ...clubs];
    return record;
  }
  if (request.method === "PATCH" && id) {
    const current = find(clubs, id);
    const input = requireBody<AdminClubUpdateInput>(request.body);
    const next = { ...current, ...input, updatedAt: new Date().toISOString() };
    next.detail = `${next.category} · ${next.coordinatorInitials} tərəfindən idarə olunur`;
    clubs = replace(clubs, next);
    return next;
  }
  if (request.method === "DELETE" && id) {
    find(clubs, id);
    clubs = clubs.filter((item) => item.id !== id);
    return undefined;
  }
  return methodNotAllowed();
}

function handleEvents(request: ApiMockRequest, id?: string): unknown {
  if (request.method === "GET" && !id) {
    let result = filterRecords(events, request.query);
    const category = request.query.get("category");
    const from = request.query.get("from");
    const to = request.query.get("to");
    if (category) result = result.filter((item) => item.category === category);
    if (from) result = result.filter((item) => item.startAt >= from);
    if (to) result = result.filter((item) => item.startAt <= to);
    return paginate(result, request.query);
  }
  if (request.method === "POST" && !id) {
    const input = requireBody<AdminEventCreateInput>(request.body);
    if (!input.name?.trim() || !input.startAt || !input.place?.trim() || input.capacity < 1) {
      throw apiFailure(400, "INVALID_EVENT", "Tədbir məlumatlarını tam və düzgün daxil edin.");
    }
    const now = new Date().toISOString();
    const record: AdminEvent = {
      kind: "events", id: createId("event"), ...input, name: input.name.trim(), attendeeCount: 0,
      detail: eventDetail(input.startAt, input.place), status: input.status ?? "Qaralama",
      metric: `0 / ${input.capacity} yer`, updatedAt: now,
    };
    events = [record, ...events];
    return record;
  }
  if (request.method === "PATCH" && id) {
    const current = find(events, id);
    const input = requireBody<AdminEventUpdateInput>(request.body);
    const next = { ...current, ...input, updatedAt: new Date().toISOString() };
    next.detail = eventDetail(next.startAt, next.place);
    next.metric = `${next.attendeeCount} / ${next.capacity} yer`;
    events = replace(events, next);
    return next;
  }
  if (request.method === "DELETE" && id) {
    find(events, id);
    events = events.filter((item) => item.id !== id);
    return undefined;
  }
  return methodNotAllowed();
}

function createOverview(): AdminOverview {
  const deltas = {
    users: users.filter((item) => item.status === "Aktiv").length - initialCounts.users,
    clubs: clubs.length - initialCounts.clubs,
    events: events.filter((item) => item.status === "Açıq").length - initialCounts.events,
  };
  return {
    ...adminDemoOverview,
    updatedAt: new Date().toISOString(),
    metrics: adminDemoOverview.metrics.map((metric) => {
      if (metric.id === "engagement") return { ...metric };
      const base = Number.parseInt(metric.value.replace(/\D/g, ""), 10) || 0;
      return { ...metric, value: String(Math.max(0, base + deltas[metric.id])).replace(/\B(?=(\d{3})+(?!\d))/g, " ") };
    }),
  };
}

function filterRecords<T extends AdminRecordBase>(records: T[], query: URLSearchParams): T[] {
  const search = query.get("search")?.trim().toLocaleLowerCase("az");
  const status = query.get("status");
  return records.filter((item) => (!search || `${item.name} ${item.detail}`.toLocaleLowerCase("az").includes(search)) && (!status || item.status === status));
}

function paginate<T>(records: T[], query: URLSearchParams): AdminPage<T> {
  const page = clamp(query.get("page"), 1, 10_000, 1);
  const pageSize = clamp(query.get("pageSize"), 1, 100, 10);
  const start = (page - 1) * pageSize;
  return { items: records.slice(start, start + pageSize), total: records.length, page, pageSize };
}

function clamp(value: string | null, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function requireBody<T>(body: unknown): T {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw apiFailure(400, "INVALID_BODY", "Sorğu məlumatları düzgün formatda deyil.");
  return body as T;
}

function find<T extends { id: string }>(records: T[], id: string): T {
  const record = records.find((item) => item.id === id);
  if (!record) throw apiFailure(404, "ADMIN_RECORD_NOT_FOUND", "İdarəetmə qeydi tapılmadı.");
  return record;
}

function replace<T extends { id: string }>(records: T[], next: T): T[] {
  return records.map((item) => item.id === next.id ? next : item);
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("az") ?? "").join("");
}

function eventDetail(startAt: string, place: string): string {
  const date = new Intl.DateTimeFormat("az-AZ", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(startAt));
  return `${date} · ${place}`;
}

function createId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
}

function methodNotAllowed(): never {
  throw apiFailure(405, "METHOD_NOT_ALLOWED", "Bu əməliyyat dəstəklənmir.");
}

function apiFailure(status: number, code: string, message: string): ApiError {
  return new ApiError(message, { status, code });
}
