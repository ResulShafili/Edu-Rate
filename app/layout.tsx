import type { Metadata, Viewport } from "next";
import { AuthProvider } from "./components/AuthProvider";
import { PlatformProvider } from "./components/PlatformProvider";
import { PlatformShell } from "./components/PlatformShell";
import { createIdentityProfile } from "./data/user";
import { getServerRequestIdentity } from "./lib/auth/request-identity";
import { getCanonicalSiteOrigin } from "./lib/site-origin";
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

export function generateMetadata(): Metadata {
  const origin = getCanonicalSiteOrigin();
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
    ? {
        ...createIdentityProfile(requestIdentity.displayName, requestIdentity.email),
        accessRole: requestIdentity.role ?? "student",
        role: requestIdentity.role === "teacher" ? "Müəllim" as const : requestIdentity.role === "mentor" ? "Mentor" as const : requestIdentity.role === "owner_admin" || requestIdentity.role === "admin" || requestIdentity.role === "assistant_admin" ? "Rəhbərlik" as const : "Tələbə" as const,
      }
    : null;
  return (
    <html lang="az" data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider
          initialUser={initialUser}
        >
          <PlatformProvider>
            <PlatformShell>{children}</PlatformShell>
          </PlatformProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
