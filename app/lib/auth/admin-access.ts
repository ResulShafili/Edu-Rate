import { headers } from "next/headers";
import {
  parseAdminSessionPayload,
  type AdminPrincipal,
} from "./admin-session";

export type AdminAccess =
  | {
      status: "granted";
      principal: AdminPrincipal;
      source: "api" | "demo";
    }
  | {
      status: "signed-out";
      signInHref: string;
    }
  | {
      status: "forbidden";
    }
  | {
      status: "unavailable";
    }
  | {
      status: "client-check";
      sessionUrl: string;
    };

const ADMIN_SESSION_PATH = "/auth/session";

/**
 * Resolves administrator access on the server. The browser never supplies or
 * persists a trusted role: authorization comes from the REST session endpoint.
 * With no public API configured, the admin module is an explicitly
 * labelled, non-persistent showcase backed only by the existing mock adapter.
 */
export async function resolveAdminAccess(): Promise<AdminAccess> {
  if (!isRemoteAdminMode()) {
    return {
      status: "granted",
      source: "demo",
      principal: {
      displayName: "Nihat Məmmədli",
        email: "demo@edurate.local",
      },
    };
  }

  const publicApiBaseUrl = parseApiBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim(),
  );
  if (!publicApiBaseUrl) {
    return { status: "unavailable" };
  }

  const publicSessionUrl = getAdminSessionUrl(publicApiBaseUrl);
  const requestHeaders = await headers();
  const sessionCookie = readSessionCookie(requestHeaders.get("cookie"));

  if (!sessionCookie) {
    return {
      status: "client-check",
      sessionUrl: publicSessionUrl.toString(),
    };
  }

  const serverApiBaseUrl = getServerApiBaseUrl(publicApiBaseUrl);
  if (!serverApiBaseUrl) return { status: "unavailable" };

  return resolveApiAdminAccess(serverApiBaseUrl, sessionCookie);
}

async function resolveApiAdminAccess(
  apiBaseUrl: URL,
  sessionCookie: string,
): Promise<AdminAccess> {
  try {
    const response = await fetch(
      getAdminSessionUrl(apiBaseUrl),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: sessionCookie,
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (response.status === 401) {
      return { status: "signed-out", signInHref: "/auth" };
    }
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "unavailable" };

    const result = parseAdminSessionPayload(await response.json());
    if (result.status === "invalid") return { status: "unavailable" };
    if (result.status === "forbidden") return result;

    return { ...result, source: "api" };
  } catch {
    return { status: "unavailable" };
  }
}

function isRemoteAdminMode(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim());
}

function getServerApiBaseUrl(publicApiBaseUrl: URL): URL | null {
  const serverOverride = process.env.EDURATE_API_BASE_URL?.trim();
  if (!serverOverride) return publicApiBaseUrl;

  return parseApiBaseUrl(serverOverride);
}

function parseApiBaseUrl(value: string | undefined): URL | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password ||
      (url.protocol === "http:" && !isLoopbackHost(url.hostname))
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function getAdminSessionUrl(apiBaseUrl: URL): URL {
  return new URL(
    `${apiBaseUrl.pathname.replace(/\/$/, "")}${ADMIN_SESSION_PATH}`,
    apiBaseUrl.origin,
  );
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const configuredName = process.env.EDURATE_SESSION_COOKIE_NAME?.trim();
  const cookieName =
    configuredName && /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(configuredName)
      ? configuredName
      : "edurate_session";

  for (const entry of cookieHeader.split(";")) {
    const separatorIndex = entry.indexOf("=");
    if (separatorIndex < 1) continue;

    const name = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();
    if (name === cookieName && value && !/[\r\n\u0000]/.test(value)) {
      return `${cookieName}=${value}`;
    }
  }

  return null;
}
