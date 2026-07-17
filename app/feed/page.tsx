import type { Metadata } from "next";
import { StudentFeed } from "../components/StudentFeed";
import { announcements, studentFeedItems } from "../data/network";

export const metadata: Metadata = {
  title: "Elanlar — EduRate",
  description:
    "Rəsmi elanları, klub yeniliklərini və fakültə xəbərlərini Elanlar bölməsində izlə.",
};

export default function FeedPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <StudentFeed announcements={announcements} items={studentFeedItems} />
    </main>
  );
}
