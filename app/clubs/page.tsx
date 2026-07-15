import type { Metadata } from "next";
import { ClubsExperience } from "../components/ClubsExperience";
import { clubs, communities } from "../data/clubs";

export const metadata: Metadata = {
  title: "Klublar və icmalar — EduRate",
  description:
    "Tələbə klublarını, təşkilatları və maraq icmalarını kəşf et; sənə uyğun kampus çevrəsinə qoşul.",
};

export default function ClubsPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <ClubsExperience clubs={clubs} communities={communities} />
    </main>
  );
}
