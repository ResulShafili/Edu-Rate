import type { Metadata } from "next";
import { TeacherEvaluation } from "../components/TeacherEvaluation";

export const metadata: Metadata = { alternates: { canonical: "/teachers" },
  title: "Müəllimlər — EduRate",
  description: "Müəllimləri bacarıqlarına görə müqayisə et, seç və faydalı rəy paylaş.",
};

export default function TeachersPage() {
  return <main id="main-content" className="route-page" tabIndex={-1}><TeacherEvaluation /></main>;
}
