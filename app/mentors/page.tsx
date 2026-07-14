import type { Metadata } from "next";
import { MentorshipDashboard } from "../components/MentorshipDashboard";

export const metadata: Metadata = {
  title: "Mentorlar — EduRate",
  description: "Sənin məqsədinə və inkişaf yoluna uyğun mentor tap.",
};

export default function MentorsPage() {
  return <main id="main-content" className="route-page" tabIndex={-1}><MentorshipDashboard /></main>;
}
