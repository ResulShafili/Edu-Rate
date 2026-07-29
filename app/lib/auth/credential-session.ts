import type { UserProfile } from "../../data/user";

export const credentialSessionCookieName = "edurate_mvp_session";
const maxSessionAgeSeconds = 60 * 60 * 24 * 7;

export type CredentialSession = {
  user: UserProfile;
  issuedAt: number;
  expiresAt: number;
};

export const credentialSessionCookie = {
  name: credentialSessionCookieName,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxSessionAgeSeconds,
  },
};

export function getCredentialSessionCookieOptions(request: Request) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = forwardedProtocol === "https" || new URL(request.url).protocol === "https:";
  return { ...credentialSessionCookie.options, secure };
}

export async function createCredentialSession(user: UserProfile): Promise<string> {
  const now = Math.floor(Date.now() / 1_000);
  const payload: CredentialSession = {
    user,
    issuedAt: now,
    expiresAt: now + maxSessionAgeSeconds,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function readCredentialSession(
  value: string | undefined,
): Promise<CredentialSession | null> {
  if (!value || value.length > 8_000) return null;

  const [encodedPayload, receivedSignature, ...rest] = value.split(".");
  if (!encodedPayload || !receivedSignature || rest.length > 0) return null;

  const expectedSignature = await sign(encodedPayload);
  if (!safeEqual(expectedSignature, receivedSignature)) return null;

  try {
    const decoded = decodeBase64Url(encodedPayload);
    const value = JSON.parse(decoded) as Partial<CredentialSession>;
    if (!isSession(value)) return null;
    if (value.expiresAt <= Math.floor(Date.now() / 1_000)) return null;
    return value;
  } catch {
    return null;
  }
}

export function readCookieValue(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const entry = header
    .split(";")
    .find((value) => value.trim().startsWith(`${name}=`));
  return entry?.split("=").slice(1).join("=").trim();
}

async function sign(value: string): Promise<string> {
  const cryptoApi = globalThis.crypto;
  const key = await cryptoApi.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await cryptoApi.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return encodeBase64UrlBytes(new Uint8Array(signature));
}

function getSessionSecret(): string {
  const configured = process.env.EDURATE_AUTH_SECRET?.trim() ?? process.env.AUTH_SECRET?.trim();
  if (configured && configured.length >= 32) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("EDURATE_AUTH_SECRET production mühitində təyin edilməlidir.");
  }

  return "edurate-local-mvp-secret-change-before-production-2026";
}

function isSession(value: Partial<CredentialSession>): value is CredentialSession {
  const user = value.user;
  return Boolean(
    user &&
    typeof user === "object" &&
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof value.issuedAt === "number" &&
    typeof value.expiresAt === "number",
  );
}

function encodeBase64Url(value: string): string {
  return encodeBase64UrlBytes(new TextEncoder().encode(value));
}

function encodeBase64UrlBytes(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}
