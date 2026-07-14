import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

let workerPromise;

function getWorker() {
  workerPromise ??= import(
    new URL(
      `../dist/server/index.js?test=${process.pid}-${Date.now()}`,
      import.meta.url,
    ).href
  ).then(({ default: worker }) => worker);

  return workerPromise;
}

async function request(pathname, init = {}) {
  const worker = await getWorker();

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      ...init,
      headers: {
        accept: pathname.startsWith("/api/")
          ? "application/json"
          : "text/html",
        host: "localhost",
        ...init.headers,
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("altı əsas marşrutu Azərbaycan dilində ayrıca render edir", async () => {
  const routes = [
    ["/", /Maraqla gəl\./],
    ["/events", /Növbəti yaxşı hekayən/],
    ["/community", /İdeyaların arxasındakı/],
    ["/teachers", /Sənə uyğun müəllimi tap\./],
    ["/mentors", /Mentorunu tap\./],
    ["/support", /Bir az dəstək\./],
  ];

  const renderedRoutes = await Promise.all(
    routes.map(async ([pathname, heading]) => {
      const response = await request(pathname);
      assert.equal(response.status, 200, `${pathname} marşrutu açılmalıdır`);
      assert.match(
        response.headers.get("content-type") ?? "",
        /^text\/html\b/i,
      );

      const html = await response.text();
      assert.match(html, /<html[^>]+lang="az"/i);
      assert.match(html, /<title>[^<]*EduRate/i);
      assert.match(html, heading, `${pathname} öz başlığını göstərməlidir`);
      assert.match(html, /aria-label="Əsas naviqasiya"/);
      assert.match(html, /hello@edurate\.community/);
      assert.doesNotMatch(
        html,
        /codex-preview|react-loading-skeleton|Your site is taking shape/i,
      );

      return html;
    }),
  );

  const [home, events, community, teachers, mentors, support] = renderedRoutes;
  assert.doesNotMatch(home, /Növbəti yaxşı hekayən/);
  assert.doesNotMatch(events, /İdeyaların arxasındakı/);
  assert.doesNotMatch(community, /Sənə uyğun müəllimi tap\./);
  assert.doesNotMatch(teachers, /Mentorunu tap\./);
  assert.doesNotMatch(mentors, /Bir az dəstək\./);
  assert.doesNotMatch(support, /Maraqla gəl\./);
});

test("davamlı platforma qabığını və əlçatan marşrut keçidlərini qoruyur", async () => {
  const [
    layout,
    shell,
    provider,
    transition,
    navigation,
    homePage,
    eventsPage,
    communityPage,
    teachersPage,
    mentorsPage,
    supportPage,
  ] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformProvider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/RouteTransition.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/navigation.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/events/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/community/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/teachers/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mentors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/support/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /<PlatformProvider>/);
  assert.match(layout, /<PlatformShell>\s*\{children\}\s*<\/PlatformShell>/);
  assert.match(layout, /<html lang="az">/);
  assert.match(shell, /from "next\/link"/);
  assert.match(shell, /usePathname/);
  assert.match(shell, /aria-current=\{current \? "page" : undefined\}/);
  assert.match(shell, /aria-controls="global-mobile-menu"/);
  assert.match(shell, /<RouteTransition>\{children\}<\/RouteTransition>/);
  assert.match(provider, /createContext/);
  assert.match(provider, /<ChatDock/);
  assert.match(provider, /openConversation/);

  assert.match(transition, /<AnimatePresence mode="wait" initial=\{false\}>/);
  assert.match(transition, /key=\{pathname\}/);
  assert.match(transition, /useReducedMotion/);
  assert.match(transition, /aria-live="polite"/);
  assert.match(transition, /#main-content/);
  assert.match(transition, /preventScroll: true/);
  assert.match(transition, /opacity/);
  assert.match(transition, /\by:/);
  assert.match(transition, /scale:/);
  assert.doesNotMatch(transition, /filter:|boxShadow:|width:|height:/);

  for (const href of ["/events", "/community", "/teachers", "/mentors", "/support"]) {
    assert.match(navigation, new RegExp(`href: "${href}"`));
  }

  for (const page of [homePage, eventsPage, communityPage, teachersPage, mentorsPage, supportPage]) {
    assert.match(page, /<main id="main-content" className="route-page" tabIndex=\{-1\}>/);
  }
});

test("müəllimi dörd bacarıq meyarı ilə və klaviatura ilə qiymətləndirir", async () => {
  const [evaluation, criteria, reviewCard, teacherCard, teacherData, styles] =
    await Promise.all([
      readFile(new URL("../app/components/TeacherEvaluation.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/CriteriaRating.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/ReviewCard.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/TeacherCard.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/data/teachers.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    ]);

  assert.match(evaluation, /<CriteriaRating/);
  assert.match(evaluation, /defaultCriteriaRatings/);
  assert.match(evaluation, /calculateCriteriaAverage/);
  assert.match(evaluation, /areCriteriaComplete/);
  assert.match(evaluation, /review-confirmation/);
  assert.match(evaluation, /role="status"/);

  for (const key of ["clarity", "subjectKnowledge", "objectivity", "communication"]) {
    assert.match(criteria, new RegExp(`\\b${key}\\b`));
  }
  for (const label of ["İzahın aydınlığı", "Fənn biliyi", "Obyektivlik", "Ünsiyyət"]) {
    assert.match(criteria, new RegExp(label));
  }
  assert.match(criteria, /role="radiogroup"/);
  assert.match(criteria, /role="radio"/);
  assert.match(criteria, /aria-checked=\{selected\}/);
  assert.match(criteria, /key === "Home"/);
  assert.match(criteria, /key === "End"/);
  assert.match(criteria, /ArrowRight/);
  assert.match(criteria, /ArrowLeft/);
  assert.match(criteria, /useReducedMotion/);
  assert.match(criteria, /aria-live="polite"/);
  assert.doesNotMatch(criteria, /filter:|boxShadow:|width:|height:/);

  assert.match(teacherCard, /role="listitem"/);
  assert.match(teacherCard, /aria-pressed=\{selected\}/);
  assert.match(teacherCard, /useReducedMotion/);
  assert.match(reviewCard, /whileInView/);
  assert.match(reviewCard, /useReducedMotion/);
  assert.doesNotMatch(teacherCard, /<img\b|from "next\/image"/);
  assert.doesNotMatch(teacherData, /https?:\/\/|\.(?:jpe?g|webp|avif)/i);
  assert.match(styles, /url\("\/teacher-roster-phase4\.webp"\)/);
  assert.match(styles, /scroll-snap-type:\s*x proximity/);
  assert.match(styles, /\.reviews-masonry\s*\{/);

  await Promise.all([
    access(new URL("../public/teacher-roster-phase4.png", import.meta.url)),
    access(new URL("../public/teacher-roster-phase4.webp", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});

test("hörmətli rəy qaydalarını həm brauzerdə, həm də API sərhədində tətbiq edir", async () => {
  const [evaluation, moderation, endpoint] = await Promise.all([
    readFile(new URL("../app/components/TeacherEvaluation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/review-moderation.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/reviews/validate/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(evaluation, /moderateReview/);
  assert.match(evaluation, /\/api\/reviews\/validate/);
  assert.match(evaluation, /role="alert"/);
  assert.match(evaluation, /Şəxsi deyil, tədris təcrübəsini/);

  assert.match(moderation, /normalizeReviewText/);
  assert.match(moderation, /"profanity"/);
  assert.match(moderation, /"direct-insult"/);
  assert.match(moderation, /"url"/);
  assert.match(moderation, /"spam"/);
  assert.match(moderation, /"excessive-repetition"/);
  assert.match(moderation, /reason:/);
  assert.match(moderation, /suggestion:/);
  assert.match(endpoint, /moderateReview/);
  assert.match(endpoint, /Cache-Control/);
  assert.match(endpoint, /no-store/);

  const acceptedResponse = await request("/api/reviews/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: "İzah aydın idi və nümunələr mövzunu anlamağıma kömək etdi.",
      criteria: {
        clarity: 5,
        subjectKnowledge: 5,
        objectivity: 4,
        communication: 5,
      },
    }),
  });
  assert.equal(acceptedResponse.status, 200);
  const accepted = await acceptedResponse.json();
  assert.equal(accepted.accepted, true);
  assert.match(accepted.text, /İzah aydın idi/);

  const rejectedResponse = await request("/api/reviews/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: "Bu müəllim axmaqdır və heç nə bilmir.",
      criteria: {
        clarity: 1,
        subjectKnowledge: 1,
        objectivity: 1,
        communication: 1,
      },
    }),
  });
  assert.equal(rejectedResponse.status, 422);
  const rejected = await rejectedResponse.json();
  assert.equal(rejected.accepted, false);
  assert.ok(rejected.issues.some((issue) => issue.code === "direct-insult"));
  assert.equal(typeof rejected.reason, "string");
  assert.equal(typeof rejected.suggestion, "string");
});

test("əvvəlki modulların əsas əlçatanlıq müqavilələrini saxlayır", async () => {
  const [directory, chat, mentorship, support] = await Promise.all([
    readFile(new URL("../app/components/PeerDirectory.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ChatDock.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MentorshipDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SupportCenter.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(directory, /aria-busy/);
  assert.match(directory, /İcma kataloqu yüklənir/);
  assert.match(chat, /role="log"/);
  assert.match(chat, /TypingIndicator/);
  assert.match(chat, /aria-controls="chat-settings-panel"/);
  assert.match(mentorship, /aria-expanded=\{expanded\}/);
  assert.match(mentorship, /aria-controls=\{detailsId\}/);
  assert.match(mentorship, /aria-live="polite"/);
  assert.match(support, /aria-expanded=\{open\}/);
  assert.match(support, /aria-controls=\{answerId\}/);
  assert.match(support, /role="progressbar"/);
  assert.match(support, /<label htmlFor="ticket-name">Adın<\/label>/);
});
