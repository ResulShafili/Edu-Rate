import type { Metadata } from "next";
import { StudentFeedRemote } from "../components/StudentFeedRemote";

export const metadata: Metadata = {
  title: "Elanlar — EduRate",
  description:
    "Rəsmi elanları, klub yeniliklərini və fakültə xəbərlərini Elanlar bölməsində izlə.",
};

export default function FeedPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <StudentFeedRemote />
    </main>
  );
}
