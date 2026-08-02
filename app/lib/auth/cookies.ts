export function readCookieValue(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const entry = header
    .split(";")
    .find((value) => value.trim().startsWith(`${name}=`));
  return entry?.split("=").slice(1).join("=").trim();
}
