import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { headers } from "next/headers";
import {
  chatGPTSignOutPath,
  getChatGPTAuthContext,
} from "./chatgpt-auth";
import { AuthProvider } from "./components/AuthProvider";
import { PlatformProvider } from "./components/PlatformProvider";
import { PlatformShell } from "./components/PlatformShell";
import { createIdentityProfile } from "./data/user";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

const title = "EduRate — Birlikdə öyrən, inamla irəli get.";
const description =
  "Tədbirləri, tələbə klublarını, etibarlı icma əlaqələrini, mentorluğu, müəllim qiymətləndirməsini və universitet şəbəkəsini bir araya gətirən öyrənmə platforması.";

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
  const socialImage = `${origin}/og-phase7.png`;

  return {
    title,
    description,
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
          width: 1733,
          height: 907,
          alt: "EduRate — Klubunu tap. İcmanı qur.",
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
  const { user: identity } = await getChatGPTAuthContext();
  const initialUser = identity
    ? createIdentityProfile(identity.displayName, identity.email)
    : null;
  const signOutHref = identity ? chatGPTSignOutPath("/") : null;

  return (
    <html lang="az">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} antialiased`}>
        <AuthProvider initialUser={initialUser} signOutHref={signOutHref}>
          <PlatformProvider>
            <PlatformShell>{children}</PlatformShell>
          </PlatformProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
