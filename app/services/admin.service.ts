import {
  adminDemoClubs,
  adminDemoEvents,
  adminDemoOverview,
  adminDemoUsers,
  adminRoleLabels,
  type AdminClub,
  type AdminClubCreateInput,
  type AdminClubQuery,
  type AdminClubUpdateInput,
  type AdminEvent,
  type AdminEventCreateInput,
  type AdminEventQuery,
  type AdminEventUpdateInput,
  type AdminListQuery,
  type AdminOverview,
  type AdminPage,
  type AdminRecordBase,
  type AdminUser,
  type AdminUserCreateInput,
  type AdminUserQuery,
  type AdminUserUpdateInput,
} from "../data/admin";
import {
  ApiError,
  createApiClient,
  type ApiMockRequest,
  type ApiQuery,
} from "../lib/api/client";

export type AdminRequestOptions = {
  signal?: AbortSignal;
};

let demoUsers: AdminUser[] = adminDemoUsers.map((user) => ({ ...user }));
let demoClubs: AdminClub[] = adminDemoClubs.map((club) => ({ ...club }));
let demoEvents: AdminEvent[] = adminDemoEvents.map((event) => ({ ...event }));

const initialDemoSignals = {
  activeUsers: adminDemoUsers.filter((user) => user.status === "Aktiv").length,
  clubs: adminDemoClubs.length,
  openEvents: adminDemoEvents.filter((event) => event.status === "Açıq").length,
};

const overviewMetricBaselines = {
  users: readOverviewMetricValue("users"),
  clubs: readOverviewMetricValue("clubs"),
  events: readOverviewMetricValue("events"),
};

const adminApi = createApiClient({
  baseUrl: "/api",
  mockAdapter: handleAdminMockRequest,
  mockDelayMs: 560,
});

export const adminCrudOperations = ["create", "update", "delete"] as const;

export const adminService = {
  mode: adminApi.mode,

  getOverview(options: AdminRequestOptions = {}) {
    return adminApi.get<AdminOverview>("/admin/overview", options);
  },

  getUsers(query: AdminUserQuery = {}, options: AdminRequestOptions = {}) {
    return adminApi.get<AdminPage<AdminUser>>("/admin/users", {
      ...options,
      query: toUserQuery(query),
    });
  },

  createUser(input: AdminUserCreateInput, options: AdminRequestOptions = {}) {
    return adminApi.post<AdminUser, AdminUserCreateInput>(
      "/admin/users",
      input,
      options,
    );
  },

  updateUser(
    id: string,
    input: AdminUserUpdateInput,
    options: AdminRequestOptions = {},
  ) {
    return adminApi.patch<AdminUser, AdminUserUpdateInput>(
      `/admin/users/${encodeURIComponent(id)}`,
      input,
      options,
    );
  },

  deleteUser(id: string, options: AdminRequestOptions = {}) {
    return adminApi.delete<void>(
      `/admin/users/${encodeURIComponent(id)}`,
      options,
    );
  },

  getClubs(query: AdminClubQuery = {}, options: AdminRequestOptions = {}) {
    return adminApi.get<AdminPage<AdminClub>>("/admin/clubs", {
      ...options,
      query: toClubQuery(query),
    });
  },

  createClub(input: AdminClubCreateInput, options: AdminRequestOptions = {}) {
    return adminApi.post<AdminClub, AdminClubCreateInput>(
      "/admin/clubs",
      input,
      options,
    );
  },

  updateClub(
    id: string,
    input: AdminClubUpdateInput,
    options: AdminRequestOptions = {},
  ) {
    return adminApi.patch<AdminClub, AdminClubUpdateInput>(
      `/admin/clubs/${encodeURIComponent(id)}`,
      input,
      options,
    );
  },

  deleteClub(id: string, options: AdminRequestOptions = {}) {
    return adminApi.delete<void>(
      `/admin/clubs/${encodeURIComponent(id)}`,
      options,
    );
  },

  getEvents(query: AdminEventQuery = {}, options: AdminRequestOptions = {}) {
    return adminApi.get<AdminPage<AdminEvent>>("/admin/events", {
      ...options,
      query: toEventQuery(query),
    });
  },

  createEvent(input: AdminEventCreateInput, options: AdminRequestOptions = {}) {
    return adminApi.post<AdminEvent, AdminEventCreateInput>(
      "/admin/events",
      input,
      options,
    );
  },

  updateEvent(
    id: string,
    input: AdminEventUpdateInput,
    options: AdminRequestOptions = {},
  ) {
    return adminApi.patch<AdminEvent, AdminEventUpdateInput>(
      `/admin/events/${encodeURIComponent(id)}`,
      input,
      options,
    );
  },

  deleteEvent(id: string, options: AdminRequestOptions = {}) {
    return adminApi.delete<void>(
      `/admin/events/${encodeURIComponent(id)}`,
      options,
    );
  },
};

export type AdminService = typeof adminService;

export function resetAdminDemoData(): void {
  demoUsers = adminDemoUsers.map((user) => ({ ...user }));
  demoClubs = adminDemoClubs.map((club) => ({ ...club }));
  demoEvents = adminDemoEvents.map((event) => ({ ...event }));
}

function toBaseQuery(query: AdminListQuery): ApiQuery {
  return {
    search: query.search,
    status: query.status === "all" ? undefined : query.status,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function toUserQuery(query: AdminUserQuery): ApiQuery {
  return {
    ...toBaseQuery(query),
    role: query.role === "all" ? undefined : query.role,
  };
}

function toClubQuery(query: AdminClubQuery): ApiQuery {
  return {
    ...toBaseQuery(query),
    category: query.category,
  };
}

function toEventQuery(query: AdminEventQuery): ApiQuery {
  return {
    ...toBaseQuery(query),
    category: query.category,
    from: query.from,
    to: query.to,
  };
}

export function handleAdminMockRequest(request: ApiMockRequest): unknown {
  const segments = request.path.split("/").filter(Boolean).map(decodeURIComponent);
  const [, collection, id] = segments;

  if (segments[0] !== "admin") {
    throw new ApiError("Demo API marşrutu tapılmadı.", {
      status: 404,
      code: "MOCK_ROUTE_NOT_FOUND",
    });
  }

  if (collection === "overview" && request.method === "GET") {
    return createDemoOverview();
  }

  if (collection === "users") {
    return handleUsersRequest(request, id);
  }

  if (collection === "clubs") {
    return handleClubsRequest(request, id);
  }

  if (collection === "events") {
    return handleEventsRequest(request, id);
  }

  throw new ApiError("Demo API marşrutu tapılmadı.", {
    status: 404,
    code: "MOCK_ROUTE_NOT_FOUND",
  });
}

function createDemoOverview(): AdminOverview {
  const metricDeltas = {
    users:
      demoUsers.filter((user) => user.status === "Aktiv").length -
      initialDemoSignals.activeUsers,
    clubs: demoClubs.length - initialDemoSignals.clubs,
    events:
      demoEvents.filter((event) => event.status === "Açıq").length -
      initialDemoSignals.openEvents,
  };

  return {
    ...adminDemoOverview,
    updatedAt: new Date().toISOString(),
    metrics: adminDemoOverview.metrics.map((metric) => {
      if (metric.id === "engagement") return { ...metric };
      const value = overviewMetricBaselines[metric.id] + metricDeltas[metric.id];
      return { ...metric, value: formatOverviewMetricValue(value) };
    }),
  };
}

function readOverviewMetricValue(
  id: AdminOverview["metrics"][number]["id"],
): number {
  const value = adminDemoOverview.metrics.find((metric) => metric.id === id)?.value ?? "0";
  return Number.parseInt(value.replace(/\D/g, ""), 10) || 0;
}

function formatOverviewMetricValue(value: number): string {
  return `${Math.max(0, Math.trunc(value))}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function handleUsersRequest(request: ApiMockRequest, id?: string): unknown {
  if (request.method === "GET" && !id) {
    let records = filterRecords(demoUsers, request.query);
    const role = request.query.get("role");
    if (role) records = records.filter((record) => record.role === role);
    return paginate(records, request.query);
  }

  if (request.method === "POST" && !id) {
    const input = requireBody<AdminUserCreateInput>(request.body);
    if (demoUsers.some((user) => user.email === input.email)) {
      throw new ApiError("Bu e-poçt ünvanı artıq istifadə olunur.", {
        status: 409,
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    const now = new Date().toISOString();
    const record: AdminUser = {
      kind: "users",
      id: createDemoId("usr"),
      name: input.name,
      email: input.email,
      initials: createInitials(input.name),
      role: input.role,
      university: input.university,
      faculty: input.faculty,
      connectionCount: 0,
      joinedAt: now,
      lastActiveAt: now,
      detail: `${adminRoleLabels[input.role]} · ${input.faculty}`,
      status: input.status ?? "Gözləmədə",
      metric: "0 əlaqə",
      updatedAt: now,
    };
    demoUsers = [record, ...demoUsers];
    return record;
  }

  if (request.method === "PATCH" && id) {
    const input = requireBody<AdminUserUpdateInput>(request.body);
    const current = findRecord(demoUsers, id);
    const next = { ...current, ...input, updatedAt: new Date().toISOString() };
    next.initials = createInitials(next.name);
    next.detail = `${adminRoleLabels[next.role]} · ${next.faculty}`;
    demoUsers = replaceRecord(demoUsers, next);
    return next;
  }

  if (request.method === "DELETE" && id) {
    findRecord(demoUsers, id);
    demoUsers = demoUsers.filter((record) => record.id !== id);
    return undefined;
  }

  return methodNotAllowed();
}

function handleClubsRequest(request: ApiMockRequest, id?: string): unknown {
  if (request.method === "GET" && !id) {
    let records = filterRecords(demoClubs, request.query);
    const category = request.query.get("category");
    if (category) records = records.filter((record) => record.category === category);
    return paginate(records, request.query);
  }

  if (request.method === "POST" && !id) {
    const input = requireBody<AdminClubCreateInput>(request.body);
    const now = new Date().toISOString();
    const record: AdminClub = {
      kind: "clubs",
      id: createDemoId("club"),
      ...input,
      memberCount: 0,
      eventCount: 0,
      createdAt: now,
      detail: `${input.category} · ${input.coordinatorInitials} tərəfindən idarə olunur`,
      status: input.status ?? "Gözləmədə",
      metric: "0 üzv",
      updatedAt: now,
    };
    demoClubs = [record, ...demoClubs];
    return record;
  }

  if (request.method === "PATCH" && id) {
    const input = requireBody<AdminClubUpdateInput>(request.body);
    const current = findRecord(demoClubs, id);
    const next = { ...current, ...input, updatedAt: new Date().toISOString() };
    next.detail = `${next.category} · ${next.coordinatorInitials} tərəfindən idarə olunur`;
    demoClubs = replaceRecord(demoClubs, next);
    return next;
  }

  if (request.method === "DELETE" && id) {
    findRecord(demoClubs, id);
    demoClubs = demoClubs.filter((record) => record.id !== id);
    return undefined;
  }

  return methodNotAllowed();
}

function handleEventsRequest(request: ApiMockRequest, id?: string): unknown {
  if (request.method === "GET" && !id) {
    let records = filterRecords(demoEvents, request.query);
    const category = request.query.get("category");
    const from = request.query.get("from");
    const to = request.query.get("to");
    if (category) records = records.filter((record) => record.category === category);
    if (from) records = records.filter((record) => record.startAt >= from);
    if (to) records = records.filter((record) => record.startAt <= to);
    return paginate(records, request.query);
  }

  if (request.method === "POST" && !id) {
    const input = requireBody<AdminEventCreateInput>(request.body);
    const now = new Date().toISOString();
    const record: AdminEvent = {
      kind: "events",
      id: createDemoId("event"),
      ...input,
      attendeeCount: 0,
      detail: formatEventDetail(input.startAt, input.place),
      status: input.status ?? "Qaralama",
      metric: `${input.capacity} yer`,
      updatedAt: now,
    };
    demoEvents = [record, ...demoEvents];
    return record;
  }

  if (request.method === "PATCH" && id) {
    const input = requireBody<AdminEventUpdateInput>(request.body);
    const current = findRecord(demoEvents, id);
    const next = { ...current, ...input, updatedAt: new Date().toISOString() };
    next.detail = formatEventDetail(next.startAt, next.place);
    next.metric = `${next.attendeeCount} / ${next.capacity} yer`;
    demoEvents = replaceRecord(demoEvents, next);
    return next;
  }

  if (request.method === "DELETE" && id) {
    findRecord(demoEvents, id);
    demoEvents = demoEvents.filter((record) => record.id !== id);
    return undefined;
  }

  return methodNotAllowed();
}

function filterRecords<T extends AdminRecordBase>(
  records: T[],
  query: URLSearchParams,
): T[] {
  const search = query.get("search")?.trim().toLocaleLowerCase("az");
  const status = query.get("status");

  return records.filter((record) => {
    const matchesSearch =
      !search ||
      `${record.name} ${record.detail}`.toLocaleLowerCase("az").includes(search);
    const matchesStatus = !status || record.status === status;
    return matchesSearch && matchesStatus;
  });
}

function paginate<T>(records: T[], query: URLSearchParams): AdminPage<T> {
  const page = clampInteger(query.get("page"), 1, 10_000, 1);
  const pageSize = clampInteger(query.get("pageSize"), 1, 100, 10);
  const start = (page - 1) * pageSize;

  return {
    items: records.slice(start, start + pageSize),
    total: records.length,
    page,
    pageSize,
  };
}

function clampInteger(
  value: string | null,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function requireBody<T>(body: unknown): T {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError("Sorğu məlumatları düzgün formatda deyil.", {
      status: 400,
      code: "INVALID_REQUEST_BODY",
    });
  }
  return body as T;
}

function findRecord<T extends { id: string }>(records: T[], id: string): T {
  const record = records.find((item) => item.id === id);
  if (!record) {
    throw new ApiError("İdarəetmə qeydi tapılmadı.", {
      status: 404,
      code: "ADMIN_RECORD_NOT_FOUND",
    });
  }
  return record;
}

function replaceRecord<T extends { id: string }>(records: T[], next: T): T[] {
  return records.map((record) => (record.id === next.id ? next : record));
}

function createDemoId(prefix: string): string {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  return `${prefix}-${suffix}`;
}

function createInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("az") ?? "")
    .join("");
}

function formatEventDetail(startAt: string, place: string): string {
  const formatted = new Intl.DateTimeFormat("az-AZ", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startAt));
  return `${formatted} · ${place}`;
}

function methodNotAllowed(): never {
  throw new ApiError("Bu demo əməliyyatı dəstəklənmir.", {
    status: 405,
    code: "METHOD_NOT_ALLOWED",
  });
}
