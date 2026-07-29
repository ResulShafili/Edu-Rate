import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAccessState } from "../components/AdminAccessState";
import { ApiExplorer } from "../components/ApiExplorer";
import { resolveAdminAccess } from "../lib/auth/admin-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "API sənədləri — EduRate",
  description: "EduRate MVP REST API üçün OpenAPI sənədləri və canlı sağlamlıq testi.",
  robots: { index: false, follow: false },
};

export default async function ApiDocsPage() {
  const access = await resolveAdminAccess();
  if (access.status === "signed-out") redirect("/auth?returnTo=%2Fapi-docs");
  return access.status === "granted" ? <ApiExplorer /> : <AdminAccessState access={access} />;
}
