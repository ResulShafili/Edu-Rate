export const authSessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export const authSessionCookieSecurity = {
  httpOnly: true,
  sameSite: "lax" as const,
};
