import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { AuthProvider } from "./components/AuthProvider";
import { PlatformProvider } from "./components/PlatformProvider";
import { PlatformShell } from "./components/PlatformShell";
import { createIdentityProfile } from "./data/user";
import { getServerRequestIdentity, isAdminEmail } from "./lib/auth/request-identity";
import "./globals.css";
import "./kuds.css";

const title = "EduRate — Universitet həyatın bir yerdə.";
const description =
  "Tədbirləri, tələbə klublarını, etibarlı icma əlaqələrini, mentorluğu, müəllim qiymətləndirməsini və ağıllı idarəetməni bir araya gətirən öyrənmə platforması.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ??
    incomingHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    incomingHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    applicationName: "EduRate",
    keywords: ["EduRate", "universitet", "tələbə", "tədbirlər", "mentor", "klublar"],
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "az_AZ",
      url: origin,
      images: [
        {
          url: socialImage,
          width: 1728,
          height: 909,
          alt: "EduRate universitet şəbəkəsi",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestIdentity = await getServerRequestIdentity();
  const initialUser = requestIdentity
    ? createIdentityProfile(requestIdentity.displayName, requestIdentity.email)
    : null;
  return (
    <html lang="az">
      <body className="antialiased">
        <AuthProvider
          initialUser={initialUser}
          initialIsAdmin={Boolean(
            requestIdentity &&
              (requestIdentity.role === "admin" || isAdminEmail(requestIdentity.email)),
          )}
        >
          <PlatformProvider>
            <PlatformShell>{children}</PlatformShell>
          </PlatformProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
