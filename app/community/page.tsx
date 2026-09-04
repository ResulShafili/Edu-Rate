import type { Metadata } from "next";
import { ConnectionsExperience } from "../components/ConnectionsExperience";

export const metadata: Metadata = { alternates: { canonical: "/community" },
  title: "İcma — EduRate",
  description: "Ortaq maraqları olan öyrənənlər, yaradıcılar və mentorlarla tanış ol.",
};

export default function CommunityPage() {
  return <main id="main-content" className="route-page" tabIndex={-1}><ConnectionsExperience /></main>;
}
