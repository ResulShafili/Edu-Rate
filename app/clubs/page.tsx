import type { Metadata } from "next";
import { ClubsExperience } from "../components/ClubsExperience";
import { clubs, clubFromApi, type ClubApiRecord } from "../data/clubs";
import { requestRemoteApi } from "../lib/auth/remote-credential";

export const metadata: Metadata = {
  title: "Klublar və icmalar — EduRate",
  description:
    "Tələbə klublarını və təşkilatlarını kəşf et; sənə uyğun kampus çevrəsinə qoşul.",
};

export default async function ClubsPage() {
  const liveClubs=await requestRemoteApi<ClubApiRecord[]>("/api/clubs").then((items)=>items.map(clubFromApi)).catch(()=>[...clubs]);
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <ClubsExperience clubs={liveClubs} />
    </main>
  );
}
