import {
  createIdentityProfile,
  getInitials,
  type UserProfile,
} from "../../data/user";
import { ApiHttpError } from "../api/http";
import { readCookieValue } from "./credential-session";

const defaultApiBaseUrl = "https://edurate-api.onrender.com";
const tokenMaxAgeSeconds = 60 * 60 * 8;

export const remoteCredentialCookieName = "edurate_api_token";

export type RemoteApiUser = {
  id: string;
  name: string;
  email: string;
  university: string;
  faculty: string;
  program?: string;
  year?: string;
  city?: string;
  about?: string;
  role: "student" | "mentor" | "teacher" | "admin";
  createdAt: string;
};

type RemoteEnvelope<T> = { data: T };
type RemoteErrorEnvelope = {
  error?: { code?: string; message?: string; details?: Record<string, string> };
};

export const remoteCredentialCookie = {
  name: remoteCredentialCookieName,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: tokenMaxAgeSeconds,
  },
};

export function getRemoteCredentialCookieOptions(request: Request) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = forwardedProtocol === "https" || new URL(request.url).protocol === "https:";
  return { ...remoteCredentialCookie.options, secure };
}

export function readRemoteCredentialToken(request: Request): string | undefined {
  return readCookieValue(request.headers.get("cookie"), remoteCredentialCookieName);
}

export async function requestRemoteApi<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
  } = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  let response: Response;
  try {
    response = await fetch(`${getRemoteApiBaseUrl()}${normalizePath(path)}`, {
      method: options.method ?? "GET",
      headers,
      cache: "no-store",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(65_000),
    });
  } catch {
    throw new ApiHttpError(
      503,
      "API_SERVICE_UNAVAILABLE",
      "EduRate xidməti ilə əlaqə yaratmaq mümkün olmadı. Bir qədər sonra yenidən yoxla.",
    );
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as
    | RemoteEnvelope<T>
    | RemoteErrorEnvelope
    | null;

  if (!response.ok) {
    const remoteError = payload && "error" in payload ? payload.error : undefined;
    throw new ApiHttpError(
      response.status,
      remoteError?.code ?? "REMOTE_API_ERROR",
      remoteError?.message ?? "Əməliyyat tamamlanmadı.",
      remoteError?.details,
    );
  }

  if (!payload || !("data" in payload)) {
    throw new ApiHttpError(502, "INVALID_REMOTE_RESPONSE", "EduRate xidməti etibarlı cavab qaytarmadı.");
  }

  return payload.data;
}

export async function getRemoteSession(token: string) {
  return requestRemoteApi<{ user: RemoteApiUser }>("/api/auth/session", { token });
}

export function mapRemoteUserToProfile(user: RemoteApiUser): UserProfile {
  const base = createIdentityProfile(user.name, user.email);
  const profile = {
    ...base,
    id: user.id,
    name: user.name,
    initials: getInitials(user.name),
    university: user.university,
    faculty: user.faculty,
    program: user.program || "İxtisas məlumatı əlavə edilməyib",
    year: user.year || "Kurs məlumatı əlavə edilməyib",
    city: user.city || "Azərbaycan",
    about: user.about || "EduRate icmasına xoş gəlmisən.",
  };

  const completed = [
    profile.name,
    profile.university,
    profile.faculty,
    profile.program,
    profile.year,
    profile.about,
  ].filter((value) => value.trim().length > 0).length;

  return { ...profile, completion: Math.round((completed / 6) * 100) };
}

function getRemoteApiBaseUrl() {
  const value = process.env.EDURATE_API_BASE_URL?.trim() || defaultApiBaseUrl;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return value.replace(/\/+$/, "");
  } catch {
    throw new ApiHttpError(500, "INVALID_API_CONFIG", "Backend API ünvanı düzgün qurulmayıb.");
  }
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}
