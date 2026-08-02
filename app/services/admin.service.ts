import type {
  AdminClub,
  AdminClubCreateInput,
  AdminClubQuery,
  AdminClubUpdateInput,
  AdminEvent,
  AdminEventCreateInput,
  AdminEventQuery,
  AdminEventUpdateInput,
  AdminListQuery,
  AdminOverview,
  AdminPage,
  AdminUser,
  AdminUserCreateInput,
  AdminUserQuery,
  AdminUserUpdateInput,
} from "../data/admin";
import { createApiClient, type ApiQuery } from "../lib/api/client";

export type AdminRequestOptions = { signal?: AbortSignal };

// Admin data is requested through the protected BFF route and persisted by the Express API.
const adminApi = createApiClient({ baseUrl: "/api" });

export const adminCrudOperations = ["create", "update", "delete"] as const;

export const adminService = {
  mode: adminApi.mode,
  getOverview(options: AdminRequestOptions = {}) {
    return adminApi.get<AdminOverview>("/admin/overview", options);
  },
  getUsers(query: AdminUserQuery = {}, options: AdminRequestOptions = {}) {
    return adminApi.get<AdminPage<AdminUser>>("/admin/users", { ...options, query: toUserQuery(query) });
  },
  createUser(input: AdminUserCreateInput, options: AdminRequestOptions = {}) {
    return adminApi.post<AdminUser, AdminUserCreateInput>("/admin/users", input, options);
  },
  updateUser(id: string, input: AdminUserUpdateInput, options: AdminRequestOptions = {}) {
    return adminApi.patch<AdminUser, AdminUserUpdateInput>(`/admin/users/${encodeURIComponent(id)}`, input, options);
  },
  deleteUser(id: string, options: AdminRequestOptions = {}) {
    return adminApi.delete<void>(`/admin/users/${encodeURIComponent(id)}`, options);
  },
  getClubs(query: AdminClubQuery = {}, options: AdminRequestOptions = {}) {
    return adminApi.get<AdminPage<AdminClub>>("/admin/clubs", { ...options, query: toClubQuery(query) });
  },
  createClub(input: AdminClubCreateInput, options: AdminRequestOptions = {}) {
    return adminApi.post<AdminClub, AdminClubCreateInput>("/admin/clubs", input, options);
  },
  updateClub(id: string, input: AdminClubUpdateInput, options: AdminRequestOptions = {}) {
    return adminApi.patch<AdminClub, AdminClubUpdateInput>(`/admin/clubs/${encodeURIComponent(id)}`, input, options);
  },
  deleteClub(id: string, options: AdminRequestOptions = {}) {
    return adminApi.delete<void>(`/admin/clubs/${encodeURIComponent(id)}`, options);
  },
  getEvents(query: AdminEventQuery = {}, options: AdminRequestOptions = {}) {
    return adminApi.get<AdminPage<AdminEvent>>("/admin/events", { ...options, query: toEventQuery(query) });
  },
  createEvent(input: AdminEventCreateInput, options: AdminRequestOptions = {}) {
    return adminApi.post<AdminEvent, AdminEventCreateInput>("/admin/events", input, options);
  },
  updateEvent(id: string, input: AdminEventUpdateInput, options: AdminRequestOptions = {}) {
    return adminApi.patch<AdminEvent, AdminEventUpdateInput>(`/admin/events/${encodeURIComponent(id)}`, input, options);
  },
  deleteEvent(id: string, options: AdminRequestOptions = {}) {
    return adminApi.delete<void>(`/admin/events/${encodeURIComponent(id)}`, options);
  },
};

export type AdminService = typeof adminService;

function toBaseQuery(query: AdminListQuery): ApiQuery {
  return { search: query.search, status: query.status === "all" ? undefined : query.status, page: query.page, pageSize: query.pageSize };
}

function toUserQuery(query: AdminUserQuery): ApiQuery {
  return { ...toBaseQuery(query), role: query.role === "all" ? undefined : query.role };
}

function toClubQuery(query: AdminClubQuery): ApiQuery {
  return { ...toBaseQuery(query), category: query.category };
}

function toEventQuery(query: AdminEventQuery): ApiQuery {
  return { ...toBaseQuery(query), category: query.category, from: query.from, to: query.to };
}
