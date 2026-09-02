import type { Metadata } from "next";
import { MarketplaceExperience } from "../components/MarketplaceExperience";

export const metadata: Metadata = {
  title: "Elanlar lövhəsi — EduRate",
  description: "Kitab, texnika, dərs köməyi və yaşayış elanları — tələbədən tələbəyə.",
  alternates: { canonical: "/marketplace" },
};

export default function MarketplacePage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <MarketplaceExperience />
    </main>
  );
}
