const productionOrigin = "https://edu-rate-nu.vercel.app";

export function getCanonicalSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || productionOrigin;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.origin;
  } catch {
    return productionOrigin;
  }
}
