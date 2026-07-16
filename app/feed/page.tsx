import type { Metadata } from "next";
import { StudentFeed } from "../components/StudentFeed";
import { announcements, studentFeedItems } from "../data/network";

export const metadata: Metadata = {
  title: "Tələbə lenti — EduRate",
  description:
    "Rəsmi elanları, klub yeniliklərini və fakültə xəbərlərini sakit, aydın bir tələbə lentində izlə.",
};

export default function FeedPage() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <StudentFeed announcements={announcements} items={studentFeedItems} />
    </main>
  );
}
