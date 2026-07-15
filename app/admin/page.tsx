import type { Metadata } from "next";
import { AdminAccessState } from "../components/AdminAccessState";
import { AdminClientAccessGate } from "../components/AdminClientAccessGate";
import { AdminDashboard } from "../components/AdminDashboard";
import { resolveAdminAccess } from "../lib/auth/admin-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İdarəetmə mərkəzi — EduRate",
  description:
    "EduRate istifadəçilərini, klublarını, tədbirlərini və platforma göstəricilərini vahid idarəetmə mərkəzindən izlə.",
};

export default async function AdminPage() {
  const access = await resolveAdminAccess();

  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      {access.status === "granted" ? (
        <AdminDashboard
          administrator={access.principal}
          demoMode={access.source === "demo"}
        />
      ) : access.status === "client-check" ? (
        <AdminClientAccessGate sessionUrl={access.sessionUrl} />
      ) : (
        <AdminAccessState access={access} />
      )}
    </main>
  );
}
