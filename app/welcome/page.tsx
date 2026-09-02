import type { Metadata } from "next";
import { WelcomeExperience } from "../components/WelcomeExperience";

export const metadata: Metadata = {
  title: "Xoş gəldin — EduRate",
  description: "İlk addımlar: dərs cədvəlini qur, kluba qoşul və kampusda nə baş verdiyini gör.",
  alternates: { canonical: "/welcome" },
};

export default function WelcomePage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <WelcomeExperience />
    </main>
  );
}
