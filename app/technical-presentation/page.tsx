import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAccessState } from "../components/AdminAccessState";
import { TechnicalPresentation } from "../components/TechnicalPresentation";
import { resolveAdminAccess } from "../lib/auth/admin-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Texniki təqdimat — EduRate",
  description:
    "EduRate layihəsini rəhbər şəxslərə aydın, biznes yönümlü və texniki dürüst şəkildə təqdim etmək üçün hazır səhifə.",
  robots: { index: false, follow: false },
};

export default async function TechnicalPresentationPage() {
  const access = await resolveAdminAccess();
  if (access.status === "signed-out") redirect("/auth?returnTo=%2Ftechnical-presentation");

  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      {access.status === "granted" ? <TechnicalPresentation /> : <AdminAccessState access={access} />}
    </main>
  );
}
