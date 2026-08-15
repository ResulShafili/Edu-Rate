import { NextRequest, NextResponse } from "next/server";
import { buildContentSecurityPolicy } from "./app/lib/security/content-security-policy";

function getRealtimeOrigins() {
  const fallbackApiUrl = "https://edurate-api.onrender.com";

  try {
    const apiUrl = new URL(process.env.EDURATE_API_BASE_URL?.trim() || fallbackApiUrl);
    if (apiUrl.protocol !== "http:" && apiUrl.protocol !== "https:") return [];
    const socketProtocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
    return [apiUrl.origin, `${socketProtocol}//${apiUrl.host}`];
  } catch {
    return [];
  }
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "development",
    getRealtimeOrigins(),
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
