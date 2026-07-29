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
  robots: { index: false, follow: false },
};

type AuthPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const auth = await getChatGPTAuthContext();
  if (auth.user) redirect("/profile");

  const query = await searchParams;
  const initialMode = query.mode === "register" ? "register" : "login";
  const requestedReturnTo = typeof query.returnTo === "string" ? query.returnTo : "/profile";
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/profile";

  const chatGPTSignInHref = auth.isSitesRequest
    ? chatGPTSignInPath(returnTo)
    : null;

  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <AuthExperience chatGPTSignInHref={chatGPTSignInHref} initialMode={initialMode} returnTo={returnTo} />
    </main>
  );
}
