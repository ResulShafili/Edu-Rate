import type { Metadata } from "next";
import { TeacherCompare } from "../../components/TeacherCompare";

export const metadata: Metadata = {
  title: "Hansı müəllimi seçim? — EduRate",
  description: "Müəllimləri dörd pedaqoji meyar üzrə yan-yana müqayisə et və semestr seçimini məlumatlı et.",
  alternates: { canonical: "/teachers/compare" },
};

export default function TeacherComparePage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <TeacherCompare />
    </main>
  );
}
