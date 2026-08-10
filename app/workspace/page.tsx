import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoleWorkspace } from "../components/RoleWorkspace";
import { getServerRequestIdentity } from "../lib/auth/request-identity";

export const metadata: Metadata = { title: "İş paneli — EduRate", description: "Roluna uyğun şəxsi EduRate iş paneli." };

export default async function WorkspacePage() {
  const identity = await getServerRequestIdentity();
  if (!identity) redirect("/auth?returnTo=/workspace");
  if (identity.role === "admin" || identity.role === "assistant_admin") redirect("/admin");
  return <main id="main-content" className="route-page" tabIndex={-1}><RoleWorkspace /></main>;
}
