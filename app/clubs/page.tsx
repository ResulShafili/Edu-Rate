import type { Metadata } from "next";
import { ClubsExperience } from "../components/ClubsExperience";
import { clubs } from "../data/clubs";

export const metadata: Metadata = {
  title: "Klublar və icmalar — EduRate",
  description:
    "Tələbə klublarını və təşkilatlarını kəşf et; sənə uyğun kampus çevrəsinə qoşul.",
};

export default function ClubsPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <ClubsExperience clubs={clubs} />
    </main>
  );
}
