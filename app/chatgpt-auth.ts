import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

export type ChatGPTAuthContext = {
  isSitesRequest: boolean;
  user: ChatGPTUser | null;
};

const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";
const CHATGPT_SITES_HOST_SUFFIX = ".chatgpt.site";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  return (await getChatGPTAuthContext()).user;
}

export async function getChatGPTAuthContext(): Promise<ChatGPTAuthContext> {
  const requestHeaders = await headers();
  const isSitesRequest = isTrustedChatGPTSitesHost(requestHeaders.get("host"));

  // The dispatcher identity headers are authoritative only on the platform-owned
  // Sites hostname. In particular, never use x-forwarded-host as a trust signal:
  // a public multi-host runtime may forward a client-controlled value.
  if (!isSitesRequest) {
    return { isSitesRequest: false, user: null };
  }

  const email = normalizeEmail(requestHeaders.get(USER_EMAIL_HEADER));
  if (!email) return { isSitesRequest: true, user: null };

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  const user = {
    displayName: fullName ?? email,
    email,
    fullName,
  };

  return { isSitesRequest: true, user };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function isTrustedChatGPTSitesHost(host: string | null): boolean {
  if (!host || /[\r\n]/.test(host)) return false;

  try {
    const hostname = new URL(`https://${host}`).hostname
      .toLocaleLowerCase("en-US")
      .replace(/\.$/, "");

    return (
      hostname !== "chatgpt.site" &&
      hostname.endsWith(CHATGPT_SITES_HOST_SUFFIX)
    );
  } catch {
    return false;
  }
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value).trim();
    if (!decoded || decoded.length > 160 || /[\r\n\u0000]/.test(decoded)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function normalizeEmail(value: string | null): string | null {
  if (!value) return null;

  const email = value.trim().toLocaleLowerCase("en-US");
  if (
    email.length > 254 ||
    /[\r\n\u0000]/.test(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return null;
  }

  return email;
}
