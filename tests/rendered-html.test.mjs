import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
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

test("EduRate təcrübəsini Azərbaycan dilində serverdə render edir", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]+lang="az"/i);
  assert.match(html, /<title>EduRate/i);
  assert.match(html, /Maraqla gəl\./);
  assert.match(html, /Növbəti yaxşı hekayən/);
  assert.match(html, /İdeyaların arxasındakı/);
  assert.match(html, /Sənə uyğun müəllimi tap\./);
  assert.match(html, /Leyla Məmmədova/);
  assert.match(html, /Real təcrübə\./);
  assert.match(html, /Mentorunu tap\./);
  assert.match(html, /Bir az dəstək\./);
  assert.match(html, /Adın/);
  assert.doesNotMatch(
    html,
    /Come for the|Find your next|Meet the people|peer directory|Open conversation with|Find a mentor|Request mentorship|Submit a ticket|Your name|Email address|What can we help with\?|Tell us what happened/i,
  );
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("Phase 4 müəllim seçimi və qiymətləndirməni ayrıca, əlçatan modul kimi saxlayır", async () => {
  const [
    page,
    layout,
    experience,
    connections,
    guidance,
    teacherEvaluation,
    teacherCard,
    springRating,
    reviewCard,
    styles,
    packageJson,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/EventExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ConnectionsExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/GuidanceExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TeacherEvaluation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TeacherCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SpringRating.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ReviewCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<EventExperience\s*\/>/);
  assert.match(layout, /<html lang="az">/);
  assert.match(layout, /subsets: \["latin", "latin-ext"\]/);
  assert.match(layout, /\/og\.png/);
  assert.match(experience, /import \{ TeacherEvaluation \} from "\.\/TeacherEvaluation"/);

  const connectionsPosition = experience.indexOf("<ConnectionsExperience />");
  const teachersPosition = experience.indexOf("<TeacherEvaluation />");
  const guidancePosition = experience.indexOf("<GuidanceExperience />");
  assert.ok(connectionsPosition >= 0, "İcma modulu əsas səhifədə olmalıdır");
  assert.ok(teachersPosition > connectionsPosition, "Müəllim modulu icmadan sonra gəlməlidir");
  assert.ok(guidancePosition > teachersPosition, "Mentorluq və dəstək müəllim modulundan sonra gəlməlidir");
  assert.doesNotMatch(guidance, /TeacherEvaluation/);
  assert.match(connections, /<PeerDirectory/);
  assert.match(connections, /<ChatDock/);

  assert.match(teacherEvaluation, /export function TeacherEvaluation/);
  assert.match(teacherEvaluation, /<TeacherCard/);
  assert.match(teacherEvaluation, /<SpringRating/);
  assert.match(teacherEvaluation, /<ReviewCard/);
  assert.match(teacherEvaluation, /id="available-teachers-track"/);
  assert.match(teacherEvaluation, /aria-controls="available-teachers-track"/);
  assert.match(teacherEvaluation, /role="list"/);
  assert.match(teacherEvaluation, /aria-label="Hazırda müsait müəllimlər"/);
  assert.match(teacherEvaluation, /<fieldset>/);
  assert.match(teacherEvaluation, /<legend>Ümumi qiymətləndirmə<\/legend>/);
  assert.match(teacherEvaluation, /useReducedMotion/);
  assert.match(teacherEvaluation, /review-confirmation/);
  assert.match(teacherEvaluation, /role="status"/);

  assert.match(teacherCard, /export function TeacherCard/);
  assert.match(teacherCard, /useScroll/);
  assert.match(teacherCard, /scrollXProgress/);
  assert.match(teacherCard, /useTransform/);
  assert.match(teacherCard, /useReducedMotion/);
  assert.match(teacherCard, /role="listitem"/);
  assert.match(teacherCard, /aria-pressed=\{selected\}/);

  assert.match(springRating, /export function SpringRating/);
  assert.match(springRating, /role="radiogroup"/);
  assert.match(springRating, /role="radio"/);
  assert.match(springRating, /aria-checked=\{value === rating\}/);
  assert.match(springRating, /useSpring/);
  assert.match(springRating, /useReducedMotion/);
  assert.match(springRating, /event\.key === "Home"/);
  assert.match(springRating, /event\.key === "End"/);

  assert.match(reviewCard, /export function ReviewCard/);
  assert.match(reviewCard, /whileInView/);
  assert.match(reviewCard, /useReducedMotion/);
  assert.match(styles, /\.teachers-track\s*\{/);
  assert.match(styles, /scroll-snap-type:\s*x proximity/);
  assert.match(styles, /\.teacher-card[^}]*scroll-snap-align:\s*start/s);
  assert.match(styles, /url\("\/teacher-roster-phase4\.png"\)/);
  assert.match(styles, /\.reviews-masonry\s*\{/);
  assert.match(styles, /columns:\s*3 290px/);
  assert.match(styles, /break-inside:\s*avoid/);
  assert.match(packageJson, /"name": "edurate"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/teacher-roster-phase4.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});

test("əvvəlki mərhələlərin əlçatanlıq müqavilələrini Azərbaycan dilində qoruyur", async () => {
  const [directory, chat, guidance, mentorship, support] = await Promise.all([
    readFile(new URL("../app/components/PeerDirectory.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ChatDock.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/GuidanceExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MentorshipDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SupportCenter.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(directory, /aria-busy/);
  assert.match(directory, /peer-card-/);
  assert.match(directory, /İcma kataloqu yüklənir/);
  assert.match(chat, /role="log"/);
  assert.match(chat, /TypingIndicator/);
  assert.match(chat, /aria-controls="chat-settings-panel"/);
  assert.match(chat, /aria-label="Söhbət tənzimləmələri"/);
  assert.match(guidance, /<MentorshipDashboard\s*\/>/);
  assert.match(guidance, /<SupportCenter\s*\/>/);
  assert.match(mentorship, /aria-expanded=\{expanded\}/);
  assert.match(mentorship, /aria-controls=\{detailsId\}/);
  assert.match(mentorship, /aria-live="polite"/);
  assert.match(mentorship, /Mentorluq üçün müraciət et/);
  assert.match(support, /<h3>/);
  assert.match(support, /aria-expanded=\{open\}/);
  assert.match(support, /aria-controls=\{answerId\}/);
  assert.match(support, /role="region"/);
  assert.match(support, /role="progressbar"/);
  assert.match(support, /<label htmlFor="ticket-name">Adın<\/label>/);
  assert.match(support, /<label htmlFor="ticket-email">E-poçt ünvanın<\/label>/);
  assert.match(support, /<label htmlFor="ticket-topic">Sənə nə ilə kömək edə bilərik\?<\/label>/);
  assert.match(support, /<label htmlFor="ticket-message">Nə baş verdiyini bizə yaz<\/label>/);
});
