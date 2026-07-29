import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsExperience } from "../components/SettingsExperience";
import { getServerRequestIdentity } from "../lib/auth/request-identity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parametrlər — EduRate",
  description: "EduRate bildiriş və hesab seçimlərini idarə et.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const identity = await getServerRequestIdentity();
  if (!identity) redirect("/auth?returnTo=%2Fsettings");
  return <main id="main-content" className="route-page" tabIndex={-1}><SettingsExperience /></main>;
}
