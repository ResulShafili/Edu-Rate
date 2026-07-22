import type { Metadata } from "next";
import { TechnicalPresentation } from "../components/TechnicalPresentation";

export const metadata: Metadata = {
  title: "Texniki təqdimat — EduRate",
  description:
    "EduRate layihəsini rəhbər şəxslərə aydın, biznes yönümlü və texniki dürüst şəkildə təqdim etmək üçün hazır səhifə.",
};

export default function TechnicalPresentationPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <TechnicalPresentation />
    </main>
  );
}
