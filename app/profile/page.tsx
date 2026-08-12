import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserProfileDashboard } from "../components/UserProfileDashboard";
import { getServerRequestIdentity } from "../lib/auth/request-identity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profil — EduRate",
  description: "Hesab, təhsil və platforma fəaliyyəti məlumatlarını idarə et.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const identity = await getServerRequestIdentity();
  if (!identity) redirect("/auth?returnTo=%2Fprofile");
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <UserProfileDashboard />
    </main>
  );
}
