import type { Metadata } from "next";
import { QuestionsExperience } from "../components/QuestionsExperience";

export const metadata: Metadata = {
  title: "Kampus sualları — EduRate",
  description: "Kampus, tədris və yaşayışla bağlı sualları anonim ver, cavabı bilən tələbələrdən öyrən.",
  alternates: { canonical: "/questions" },
};

export default function QuestionsPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <QuestionsExperience />
    </main>
  );
}
