export function buildContentSecurityPolicy(
  nonce: string,
  isDevelopment: boolean,
  connectOrigins: string[] = [],
) {
  const allowedConnectOrigins = [...new Set(connectOrigins)].filter((origin) =>
    /^(https?|wss?):\/\/[^\s;]+$/i.test(origin),
  );
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src 'self'${allowedConnectOrigins.length ? ` ${allowedConnectOrigins.join(" ")}` : ""}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.map((directive) => `${directive};`).join(" ");
}
