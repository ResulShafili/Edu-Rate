import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserProfileDashboard } from "../components/UserProfileDashboard";
import { getServerRequestIdentity } from "../lib/auth/request-identity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tələbə profili — EduRate",
  description: "EduRate öyrənmə yolunu, universitet əlaqələrini və son fəaliyyətlərini bir yerdə gör.",
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
