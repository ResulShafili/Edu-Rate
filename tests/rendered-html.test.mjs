import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

process.env.EDURATE_AUTH_SECRET = "edurate-test-secret-that-is-longer-than-thirty-two-characters";

let workerPromise;
function getWorker() {
  workerPromise ??= import(new URL(`../dist/server/index.js?test=${process.pid}-${Date.now()}`, import.meta.url).href)
    .then(({ default: worker }) => worker);
  return workerPromise;
}

async function request(pathname, init = {}) {
  const worker = await getWorker();
  return worker.fetch(new Request(`http://localhost${pathname}`, {
    ...init,
    redirect: init.redirect ?? "manual",
    headers: { accept: pathname.startsWith("/api/") ? "application/json" : "text/html", host: "localhost", ...init.headers },
  }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("ictimai marşrutlar Azərbaycan dilində və vahid qabıqda açılır", async () => {
  const routes = [
    ["/", /Universitet həyatın bir yerdə/],
    ["/events", />Tədbirlər<\/h1>/],
    ["/community", />İcma<\/h1>/],
    ["/teachers", />Müəllimlər<\/h1>/],
    ["/mentors", />Mentorlar<\/h1>/],
    ["/support", />Dəstək<\/h1>/],
    ["/feed", />Elanlar<\/h1>/],
    ["/clubs", /Klublar və icmalar/],
  ];
  for (const [pathname, content] of routes) {
    const response = await request(pathname);
    assert.equal(response.status, 200, `${pathname} açılmalıdır`);
    const html = await response.text();
    assert.match(html, /<html[^>]+lang="az"/i);
    assert.match(html, /class="platform-left-rail"/);
    assert.match(html, /Əsas məzmuna keç/);
    assert.match(html, content);
    assert.doesNotMatch(html, /platform-rail-link[^>]*>[\s\S]{0,300}<small>0[1-9]<\/small>|Texniki təqdimat|API sənədləri/);
  }
});

test("qorunan səhifə və API-lər anonim istifadəçiyə açılmır", async () => {
  for (const pathname of ["/profile", "/settings", "/admin"]) {
    const response = await request(pathname);
    assert.ok([302, 303, 307, 308].includes(response.status), `${pathname} girişə yönləndirməlidir`);
    assert.match(response.headers.get("location") ?? "", /\/auth\?returnTo=/);
  }
  const adminApi = await request("/api/admin/overview");
  assert.equal(adminApi.status, 401);
  const reviewApi = await request("/api/reviews/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "İzah aydın idi.", criteria: { clarity: 5, subjectKnowledge: 5, objectivity: 5, communication: 5 }, teacherId: "leyla-memmedova", course: "Riyaziyyat", semester: "2026-payız" }),
  });
  assert.equal(reviewApi.status, 401);
});

test("texniki təqdimat production interfeysindən gizlidir", async () => {
  const response = await request("/technical-presentation");
  assert.equal(response.status, 404);
  const source = await readFile(new URL("../app/data/navigation.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /href:\s*"\/(?:technical-presentation|api-docs)"/);
});

test("naviqasiya, mobil fokus və axtarış qısa yolu əlçatandır", async () => {
  const [shell, rail, utility, header] = await Promise.all([
    readFile(new URL("../app/components/PlatformShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformNavigationRail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformUtilityRail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformHeader.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(shell, /document\.body\.style\.overflow = "hidden"/);
  assert.match(shell, /event\.key === "Tab"/);
  assert.match(shell, /event\.key !== "Escape"/);
  assert.match(shell, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(rail, /role="dialog"/);
  assert.match(rail, /aria-modal="true"/);
  assert.match(utility, /ArrowDown/);
  assert.match(utility, /platform-desktop-utility-panel/);
  assert.match(header, /useSyncExternalStore/);
  assert.match(header, /⌘ K/);
  assert.match(header, /Ctrl K/);
});

test("əsas modullar real vəziyyətlər və funksional filtrlər verir", async () => {
  const [events, teachers, support, announcements, adminService] = await Promise.all([
    readFile(new URL("../app/components/EventsExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TeacherEvaluation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SupportCenter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AnnouncementsBoard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/services/admin.service.ts", import.meta.url), "utf8"),
  ]);
  assert.match(events, /type="search"/);
  assert.match(events, /type="date"/);
  assert.match(events, /upcoming/);
  assert.match(events, /past/);
  assert.match(teachers, /teacher-directory-filters/);
  assert.match(teachers, /reviewLimit/);
  assert.match(teachers, /useAuth/);
  assert.match(support, /\/api\/support\/tickets/);
  assert.doesNotMatch(support, /progressbar|\{progress\}%/);
  assert.match(announcements, /announcement-priority-grid/);
  assert.match(announcements, /announcement-archive/);
  assert.doesNotMatch(adminService, /adminDemoUsers|mockAdapter|handleAdminMockRequest/);
});

test("qeydiyyatdan profilə əsas istifadəçi axını işləyir", async () => {
  const email = `test-${Date.now()}@example.edu.az`;
  const signup = await request("/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-proto": "https" },
    body: JSON.stringify({ name: "Aysu Məmmədli", email, password: "Etibarli123!", university: "Qarabağ Universiteti", faculty: "İnformasiya texnologiyaları" }),
  });
  assert.equal(signup.status, 201);
  const cookie = signup.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);

  const session = await request("/api/auth/session", { headers: { cookie } });
  assert.equal(session.status, 200);
  const payload = await session.json();
  assert.equal(payload.data.user.email, email);

  const profile = await request("/profile", { headers: { cookie } });
  assert.equal(profile.status, 200);
  assert.match(await profile.text(), /Aysu Məmmədli/);
});
