import type { Metadata } from "next";
import { EventsExperience } from "../components/EventsExperience";

export const metadata: Metadata = { alternates: { canonical: "/events" },
  title: "Tədbirlər — EduRate",
  description: "EduRate icmasının seçilmiş öyrənmə və yaradıcılıq tədbirlərini kəşf et.",
};

export default function EventsPage() {
  return <main id="main-content" className="route-page" tabIndex={-1}><EventsExperience /></main>;
}
