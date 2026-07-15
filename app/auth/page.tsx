import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  chatGPTSignInPath,
  getChatGPTAuthContext,
} from "../chatgpt-auth";
import { AuthExperience } from "../components/AuthExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daxil ol və qeydiyyat — EduRate",
  description: "EduRate universitet şəbəkəsinə daxil ol və şəxsi tələbə profilini yarat.",
};

export default async function AuthPage() {
  const auth = await getChatGPTAuthContext();
  if (auth.user) redirect("/profile");

  const chatGPTSignInHref = auth.isSitesRequest
    ? chatGPTSignInPath("/profile")
    : null;

  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <AuthExperience chatGPTSignInHref={chatGPTSignInHref} />
    </main>
  );
}
