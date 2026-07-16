import type { Metadata } from "next";
import { HomeExperience } from "../components/HomeExperience";

export const metadata: Metadata = {
  title: "Tələbə lenti — EduRate",
  description:
    "Rəsmi elanları, klub yeniliklərini və fakültə xəbərlərini sakit, aydın bir tələbə panelində izlə.",
};

export default function FeedPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <HomeExperience />
    </main>
  );
}
