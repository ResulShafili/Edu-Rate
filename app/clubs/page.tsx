import type { Metadata } from "next";
import { ClubsExperience } from "../components/ClubsExperience";
import { clubFromApi, type ClubApiRecord } from "../data/clubs";
import { requestRemoteApi } from "../lib/auth/remote-credential";

export const metadata: Metadata = {
  title: "Klublar və icmalar — EduRate",
  description:
    "Tələbə klublarını və təşkilatlarını kəşf et; sənə uyğun kampus çevrəsinə qoşul.",
};

export default async function ClubsPage() {
  const result=await requestRemoteApi<ClubApiRecord[]>("/api/clubs").then((items)=>({clubs:items.map(clubFromApi),failed:false})).catch(()=>({clubs:[],failed:true}));
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <ClubsExperience clubs={result.clubs} failed={result.failed} />
    </main>
  );
}
