import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { headers } from "next/headers";
import { PlatformProvider } from "./components/PlatformProvider";
import { PlatformShell } from "./components/PlatformShell";
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
  "Tədbirləri, etibarlı icma əlaqələrini, mentorluğu və bacarıq əsaslı müəllim qiymətləndirməsini bir araya gətirən öyrənmə platforması.";

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
  const socialImage = `${origin}/og-phase5.png`;

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
          width: 1734,
          height: 907,
          alt: "EduRate — Birlikdə öyrən, inamla irəli get.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} antialiased`}>
        <PlatformProvider>
          <PlatformShell>{children}</PlatformShell>
        </PlatformProvider>
      </body>
    </html>
  );
}
