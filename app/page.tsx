import type { Metadata } from "next";
import { HomeExperience } from "./components/HomeExperience";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <HomeExperience />
    </main>
  );
}
