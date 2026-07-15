import type { Metadata } from "next";
import { UserProfileDashboard } from "../components/UserProfileDashboard";

export const metadata: Metadata = {
  title: "Tələbə profili — EduRate",
  description: "EduRate öyrənmə yolunu, universitet əlaqələrini və son fəaliyyətlərini bir yerdə gör.",
};

export default function ProfilePage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <UserProfileDashboard />
    </main>
  );
}
