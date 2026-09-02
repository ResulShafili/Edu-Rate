import type { Metadata } from "next";
import { ScheduleExperience } from "../components/ScheduleExperience";

export const metadata: Metadata = {
  title: "Dərs cədvəli — EduRate",
  description: "Həftəlik dərs cədvəlin və bu gün kampusda baş verənlər bir yerdə.",
  alternates: { canonical: "/schedule" },
};

export default function SchedulePage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <ScheduleExperience />
    </main>
  );
}
