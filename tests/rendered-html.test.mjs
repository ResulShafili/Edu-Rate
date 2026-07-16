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

test("on iki əsas marşrutu Azərbaycan dilində ayrıca render edir", async () => {
  const routes = [
    ["/", /Maraqla gəl./],
    ["/events", /Növbəti yaxşı hekayən/],
    ["/community", /İdeyaların arxasındakı/],
    ["/teachers", /Sənə uyğun müəllimi tap\./],
    ["/mentors", /Mentorunu tap\./],
    ["/support", /Bir az dəstək\./],
    ["/feed", /Kampusdan xəbərdar ol./],
    ["/auth", /Yenidən[\s\S]{0,80}xoş gəldin\./],
    ["/profile", /Profilin səni gözləyir\./],
    ["/clubs", /Öz yerini tap\./],
    ["/admin", /İdarəetmə mərkəzi/],
    ["/clubs/innovasiya-robototexnika", /İnnovasiya və Robototexnika Klubu/],
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
      assert.match(html, /<meta[^>]+name="viewport"[^>]+width=device-width/i);
      assert.match(html, /<title>[^<]*EduRate/i);
      assert.match(html, heading, `${pathname} öz başlığını göstərməlidir`);
      assert.match(html, /aria-label="Əsas naviqasiya"/);
      assert.match(html, /aria-label="Platforma bölmələri"/);
      assert.match(html, /aria-label="Səhifə alətləri"/);
      assert.match(html, /class="platform-left-rail"/);
      assert.doesNotMatch(html, /class="nav-shell"|id="global-mobile-menu"/);
      assert.match(html, /hello@edurate\.community/);
      assert.doesNotMatch(
        html,
        /codex-preview|react-loading-skeleton|Your site is taking shape/i,
      );

      return html;
    }),
  );

  const [home, events, community, teachers, mentors, support, feed, auth, profile, clubs, admin, clubDetail] = renderedRoutes;
  assert.doesNotMatch(home, /Növbəti yaxşı hekayən/);
  assert.doesNotMatch(events, /İdeyaların arxasındakı/);
  assert.doesNotMatch(community, /Sənə uyğun müəllimi tap\./);
  assert.doesNotMatch(teachers, /Mentorunu tap\./);
  assert.doesNotMatch(mentors, /Bir az dəstək\./);
  assert.doesNotMatch(support, /Kampusdan xəbərdar ol./);
  assert.doesNotMatch(feed, /Yenidən xoş gəldin\./);
  assert.doesNotMatch(auth, /Profilin səni gözləyir\./);
  assert.doesNotMatch(profile, /Kampusdan xəbərdar ol\./);
  assert.doesNotMatch(clubs, /Yenidən xoş gəldin\./);
  assert.doesNotMatch(admin, /Öz yerini tap\./);
  assert.doesNotMatch(clubDetail, /Öz yerini tap\./);
});

test("davamlı platforma qabığını və əlçatan marşrut keçidlərini qoruyur", async () => {
  const [
    layout,
    shell,
    navigationRail,
    utilityRail,
    provider,
    transition,
    navigation,
    shellData,
    homeExperience,
    homePage,
    eventsPage,
    communityPage,
    teachersPage,
    mentorsPage,
    supportPage,
    feedPage,
    authPage,
    profilePage,
    clubsPage,
    adminPage,
    clubDetailPage,
  ] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformNavigationRail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformUtilityRail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/PlatformProvider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/RouteTransition.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/navigation.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/platform-shell.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/HomeExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/events/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/community/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/teachers/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mentors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/support/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/feed/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/auth/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/clubs/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/clubs/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /<AuthProvider initialUser=\{initialUser\} signOutHref=\{signOutHref\}>/);
  assert.match(layout, /<PlatformProvider>/);
  assert.match(layout, /<PlatformShell>\s*\{children\}\s*<\/PlatformShell>/);
  assert.match(layout, /<html lang="az">/);
  assert.match(shell, /from "next\/link"/);
  assert.match(shell, /usePathname/);
  assert.match(shell, /aria-controls="platform-mobile-navigation"/);
  assert.match(shell, /aria-controls="platform-mobile-utility-sheet"/);
  assert.match(shell, /<PlatformNavigationRail/);
  assert.match(shell, /mobileOpen=\{navigationOpen\}/);
  assert.match(shell, /onMobileClose=\{closeNavigation\}/);
  assert.match(shell, /<PlatformUtilityRail/);
  assert.match(shell, /mobileOpen=\{toolsOpen\}/);
  assert.match(shell, /onMobileClose=\{closeTools\}/);
  assert.match(shell, /<RouteTransition>\{children\}<\/RouteTransition>/);
  assert.match(shell, /document\.body\.style\.overflow = "hidden"/);
  assert.doesNotMatch(shell, /global-mobile-menu|nav-shell|platform-topbar/);
  assert.match(navigationRail, /isPlatformRouteCurrent/);
  assert.match(navigationRail, /layoutId="platform-left-rail-active"/);
  assert.match(navigationRail, /<aside className="platform-left-rail" aria-label="Əsas naviqasiya">/);
  assert.match(navigationRail, /aria-label="Platforma bölmələri"/);
  assert.match(navigationRail, /id="platform-mobile-navigation"/);
  assert.match(navigationRail, /role="dialog"/);
  assert.match(navigationRail, /aria-modal="true"/);
  assert.match(navigationRail, /onNavigate=\{onMobileClose\}/);
  assert.match(utilityRail, /role="search"/);
  assert.match(utilityRail, /role="tablist"/);
  assert.match(utilityRail, /aria-modal="true"/);
  assert.match(utilityRail, /router\.push\(firstSearchResult\.href\)/);
  assert.match(utilityRail, /events\.slice\(0, 3\)/);
  assert.match(utilityRail, /announcements\.slice\(0, 3\)/);
  assert.match(shellData, /platformSearchItems/);
  assert.match(shellData, /getPlatformRouteContext/);
  assert.doesNotMatch(homeExperience, /dashboard-(?:foundation|left-rail|right-rail)/);
  assert.match(feedPage, /<StudentFeed announcements=\{announcements\} items=\{studentFeedItems\} \/>/);
  assert.match(provider, /createContext/);
  assert.match(provider, /<ChatDock/);
  assert.match(provider, /openConversation/);

  assert.doesNotMatch(transition, /AnimatePresence/);
  assert.doesNotMatch(transition, /mode="wait"/);
  assert.doesNotMatch(transition, /exit=/);
  assert.match(transition, /key=\{pathname\}/);
  assert.match(transition, /useReducedMotion/);
  assert.match(transition, /useLayoutEffect/);
  assert.match(transition, /window\.scrollTo/);
  assert.doesNotMatch(transition, /behavior: "instant"/);
  assert.match(transition, /window\.scrollTo\(0, 0\)/);
  assert.match(transition, /root\.style\.scrollBehavior = "auto"/);
  assert.match(transition, /aria-live="polite"/);
  assert.match(transition, /#main-content/);
  assert.match(transition, /preventScroll: true/);
  assert.doesNotMatch(transition, /opacity:\s*0/);
  assert.match(transition, /\by:/);
  assert.match(transition, /scale:/);
  assert.doesNotMatch(transition, /filter:|boxShadow:|width:|height:/);

  for (const href of ["/events", "/community", "/teachers", "/mentors", "/support", "/feed", "/clubs", "/admin", "/profile", "/auth"]) {
    assert.match(navigation, new RegExp(`href: "${href}"`));
  }

  for (const page of [homePage, eventsPage, communityPage, teachersPage, mentorsPage, supportPage, feedPage, authPage, profilePage, clubsPage, adminPage, clubDetailPage]) {
    assert.match(page, /<main id="main-content" className="route-page" tabIndex=\{-1\}>/);
  }
});

test("müəllimi dörd bacarıq meyarı ilə və klaviatura ilə qiymətləndirir", async () => {
  const [evaluation, criteria, reviewCard, teacherCard, profileDrawer, teacherData, styles, teachersHtml] =
    await Promise.all([
      readFile(new URL("../app/components/TeacherEvaluation.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/CriteriaRating.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/ReviewCard.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/TeacherCard.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/TeacherProfileDrawer.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/data/teachers.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      request("/teachers").then((response) => response.text()),
    ]);

  assert.match(evaluation, /<CriteriaRating/);
  assert.match(evaluation, /defaultCriteriaRatings/);
  assert.match(evaluation, /calculateCriteriaAverage/);
  assert.match(evaluation, /areCriteriaComplete/);
  assert.match(evaluation, /review-confirmation/);
  assert.match(evaluation, /role="status"/);
  assert.match(evaluation, /useState<Teacher\["id"\] \| null>\(null\)/);
  assert.match(evaluation, /<TeacherProfileDrawer/);
  assert.match(evaluation, /disabled=\{reviewChecking\}/);
  assert.match(evaluation, /if \(reviewChecking\) return/);
  assert.match(evaluation, /ratingPanelRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(evaluation, /confirmationTimer\.current = null/);
  assert.match(evaluation, /role="region"/);
  assert.match(evaluation, /aria-labelledby="teacher-rating-title"/);
  assert.doesNotMatch(evaluation, /teachers\[0\]\?\.id|\?\?\s*teachers\[0\]/);
  assert.doesNotMatch(teachersHtml, /id="teacher-rating-panel"/);
  assert.equal((teachersHtml.match(/aria-haspopup="dialog"/g) ?? []).length, 6);

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
  assert.match(teacherCard, /aria-haspopup="dialog"/);
  assert.match(teacherCard, /aria-controls="teacher-profile-dialog"/);
  assert.match(teacherCard, /useReducedMotion/);
  assert.doesNotMatch(teacherCard, /aria-pressed|teacher\.bio|teacher\.city|studentsCount|teacher\.experience/);
  assert.match(profileDrawer, /role="dialog"/);
  assert.match(profileDrawer, /aria-modal="true"/);
  assert.match(profileDrawer, /aria-labelledby="teacher-profile-title"/);
  assert.match(profileDrawer, /keyEvent\.key === "Escape"/);
  assert.match(profileDrawer, /document\.body\.style\.overflow = "hidden"/);
  assert.match(profileDrawer, /previousFocus\?\.focus/);
  assert.match(profileDrawer, /selectionRequestedRef/);
  assert.match(reviewCard, /whileInView/);
  assert.match(reviewCard, /useReducedMotion/);
  for (const component of [teacherCard, profileDrawer]) {
    assert.doesNotMatch(component, /<img\b|from "next\/image"|https?:\/\//);
  }
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

test("universitet şəbəkəsinin auth, profil, lent və elan müqavilələrini qoruyur", async () => {
  const [
    auth,
    authProvider,
    profile,
    feed,
    feedCard,
    announcementsBoard,
    networkData,
    userData,
    navigation,
    layout,
    styles,
  ] = await Promise.all([
    readFile(new URL("../app/components/AuthExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AuthProvider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/UserProfileDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StudentFeed.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FeedCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AnnouncementsBoard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/network.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/user.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/navigation.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /<AuthProvider initialUser=\{initialUser\} signOutHref=\{signOutHref\}>/);
  assert.match(layout, /getChatGPTAuthContext/);
  assert.match(navigation, /href: "\/feed"/);
  assert.match(navigation, /href: "\/profile"/);
  assert.match(navigation, /href: "\/auth"/);

  assert.match(auth, /role="tablist"/);
  assert.match(auth, /role="tab"/);
  assert.match(auth, /role="tabpanel"/);
  assert.match(auth, /aria-selected=\{active\}/);
  assert.match(auth, /autoComplete="email"/);
  assert.match(auth, /current-password/);
  assert.match(auth, /new-password/);
  assert.match(auth, /useReducedMotion/);
  assert.match(auth, /mode="popLayout"/);
  assert.doesNotMatch(auth, /mode="wait"|localStorage|sessionStorage|console\./);
  assert.match(authProvider, /type AuthGateway/);
  assert.match(authProvider, /AUTH_PROVIDER_NOT_CONFIGURED/);
  assert.match(authProvider, /gateway \?\? unavailableAuthGateway/);
  assert.match(authProvider, /if \(!user\) throw new Error\("AUTH_REQUIRED"\)/);
  assert.doesNotMatch(authProvider, /demoAuthGateway|waitForDemoResponse|localStorage|sessionStorage|console\./);

  assert.match(profile, /role="progressbar"/);
  assert.match(profile, /aria-valuenow=\{user\.completion\}/);
  assert.match(profile, /aria-expanded=\{editing\}/);
  assert.match(profile, /whileInView/);
  assert.match(profile, /useReducedMotion/);

  assert.match(feed, /IntersectionObserver/);
  assert.match(feed, /aria-busy=\{isAppending\}/);
  assert.match(feed, /role="feed"/);
  assert.match(feed, /aria-live="polite"/);
  assert.match(feed, /Daha çox göstər/);
  assert.match(feed, /AnimatePresence initial=\{false\} mode="popLayout"/);
  assert.match(feedCard, /layout=\{reducedMotion \? false : "position"\}/);

  for (const label of ["Hamısı", "Rəsmi", "Klublar", "Fakültələr"]) {
    assert.match(networkData, new RegExp(label));
  }
  assert.match(announcementsBoard, /aria-pressed=\{active\}/);
  assert.match(announcementsBoard, /layoutId="active-network-filter"/);
  assert.match(announcementsBoard, /mode="popLayout"/);

  for (const source of [auth, profile, feed, feedCard, announcementsBoard, networkData, userData]) {
    assert.doesNotMatch(source, /<img\b|from "next\/image"|https?:\/\/|\.(?:jpe?g|webp|avif)/i);
  }

  assert.match(styles, /\.auth-section\s*\{/);
  assert.match(styles, /\.profile-section\s*\{/);
  assert.match(styles, /\.nav-user-initials\s*\{/);
  await access(new URL("../public/og-phase6.png", import.meta.url));
});

test("auth sərhədi yalnız Sites kimliyinə etibar edir və konfiqurasiyasız halda bağlı qalır", async () => {
  const [chatgptAuth, authPage, auth, authProvider, profile, userData] = await Promise.all([
    readFile(new URL("../app/chatgpt-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/auth/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AuthExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AuthProvider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/UserProfileDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/user.ts", import.meta.url), "utf8"),
  ]);

  assert.match(chatgptAuth, /requestHeaders\.get\("host"\)/);
  assert.match(chatgptAuth, /isTrustedChatGPTSitesHost/);
  assert.match(chatgptAuth, /hostname\.endsWith\(CHATGPT_SITES_HOST_SUFFIX\)/);
  assert.doesNotMatch(chatgptAuth, /get\("x-forwarded-host"\)/);
  assert.match(authPage, /dynamic = "force-dynamic"/);
  assert.match(authPage, /chatGPTSignInPath\("\/profile"\)/);
  assert.match(auth, /ChatGPT ilə davam et/);
  assert.match(auth, /passwordInput\.value = ""/);
  assert.ok(
    (auth.match(/disabled=\{!credentialAuthAvailable \|\| submitting\}/g) ?? []).length >= 5,
    "konfiqurasiyasız credential sahələri məlumat toplamamalıdır",
  );
  assert.match(auth, /disabled=\{submitting \|\| !credentialAuthAvailable\}/);
  assert.match(authProvider, /AUTH_PROVIDER_NOT_CONFIGURED/);
  assert.match(profile, /<a href=\{signOutHref\} className="profile-signout-button">/);
  assert.match(profile, /\{credentialAuthAvailable && \(/);
  assert.doesNotMatch(userData, /demoUserProfile|createRegisteredProfile|student-aylin/);

  for (const source of [auth, authProvider, profile, userData]) {
    assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|document\.cookie|console\./);
  }

  const untrustedResponse = await request("/profile", {
    headers: {
      host: "edu-rate-nu.vercel.app",
      "oai-authenticated-user-email": "saxta@numune.az",
      "oai-authenticated-user-full-name": "Saxta%20Istifad%C9%99%C3%A7i",
      "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
    },
  });
  assert.equal(untrustedResponse.status, 200);
  const untrustedHtml = await untrustedResponse.text();
  assert.match(untrustedHtml, /Profilin səni gözləyir\./);
  assert.doesNotMatch(untrustedHtml, /saxta@numune\.az|Saxta Istifadəçi/);

  const sitesAnonymousResponse = await request("/auth", {
    headers: { host: "gathered-autumn-26.capkan8204-ocalan.chatgpt.site" },
  });
  assert.equal(sitesAnonymousResponse.status, 200);
  const sitesAnonymousHtml = await sitesAnonymousResponse.text();
  assert.match(sitesAnonymousHtml, /ChatGPT ilə davam et/);
  assert.match(sitesAnonymousHtml, /\/signin-with-chatgpt\?return_to=%2Fprofile/);

  const sitesProfileResponse = await request("/profile", {
    headers: {
      host: "gathered-autumn-26.capkan8204-ocalan.chatgpt.site",
      "oai-authenticated-user-email": "resul@numune.az",
      "oai-authenticated-user-full-name": "Resul%20%C5%9E%C9%99fili",
      "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
    },
  });
  assert.equal(sitesProfileResponse.status, 200);
  const sitesProfileHtml = await sitesProfileResponse.text();
  assert.match(sitesProfileHtml, /Resul Şəfili/);
  assert.match(sitesProfileHtml, /\/signout-with-chatgpt\?return_to=%2F/);
  assert.doesNotMatch(sitesProfileHtml, /Profilə düzəliş et/);
});

test("klub, təşkilat və maraq icmalarını premium və əlçatan qarşılıqlı əlaqələrlə təqdim edir", async () => {
  const [
    clubsExperience,
    clubCard,
    communityCard,
    detail,
    joinButton,
    clubData,
    directoryPage,
    detailPage,
    navigation,
    styles,
    clubsHtml,
    clubDetailHtml,
  ] = await Promise.all([
    readFile(new URL("../app/components/ClubsExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ClubCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/CommunityCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ClubDetailExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MagneticJoinButton.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/clubs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/clubs/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/clubs/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/navigation.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    request("/clubs").then((response) => response.text()),
    request("/clubs/innovasiya-robototexnika").then((response) => response.text()),
  ]);

  assert.match(navigation, /href: "\/clubs"/);
  assert.match(directoryPage, /<ClubsExperience clubs=\{clubs\} communities=\{communities\} \/>/);
  assert.match(detailPage, /params: Promise<\{ slug: string \}>/);
  assert.match(detailPage, /generateStaticParams/);
  assert.match(detailPage, /generateMetadata/);
  assert.match(detailPage, /notFound\(\)/);

  assert.doesNotMatch(clubsExperience, /<main\b/);
  assert.match(clubsExperience, /useState<string \| null>\(null\)/);
  assert.match(clubsExperience, /isDimmed=\{activeCommunity !== null/);
  assert.match(clubCard, /useMotionValue/);
  assert.match(clubCard, /useSpring/);
  assert.match(clubCard, /useTransform/);
  assert.match(clubCard, /event\.pointerType !== "mouse"/);
  assert.match(clubCard, /href=\{`\/clubs\/\$\{club\.slug\}`\}/);
  assert.match(clubCard, /useReducedMotion/);

  assert.match(communityCard, /rotateX/);
  assert.match(communityCard, /rotateY/);
  assert.match(communityCard, /transformPerspective/);
  assert.match(communityCard, /aria-pressed=\{isActive\}/);
  assert.match(communityCard, /onFocusCapture/);
  assert.match(communityCard, /is-dimmed/);
  assert.match(communityCard, /useReducedMotion/);

  assert.match(detail, /useScroll/);
  assert.match(detail, /role="tablist"/);
  assert.match(detail, /role="tab"/);
  assert.match(detail, /role="tabpanel"/);
  assert.match(detail, /aria-selected=\{selected\}/);
  assert.match(detail, /event\.key === "ArrowRight"/);
  assert.match(detail, /event\.key === "ArrowLeft"/);
  assert.match(detail, /event\.key === "Home"/);
  assert.match(detail, /event\.key === "End"/);
  assert.match(detail, /AnimatePresence initial=\{false\} mode="popLayout"/);
  assert.match(detail, /<MagneticJoinButton/);
  assert.match(detail, /member\.initials/);

  assert.match(joinButton, /matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)/);
  assert.match(joinButton, /aria-pressed=\{joined\}/);
  assert.match(joinButton, /aria-live="polite"/);
  assert.match(joinButton, /setJoined\(true\)/);
  assert.match(joinButton, /magnetic-join-button__success-ring/);
  assert.doesNotMatch(joinButton, /localStorage|sessionStorage|indexedDB|document\.cookie/);

  for (const label of ["Haqqında", "Tədbirlər", "Üzvlər", "Tarixçə"]) {
    assert.match(clubData, new RegExp(label));
    assert.match(clubDetailHtml, new RegExp(label));
  }
  assert.equal((clubsHtml.match(/səhifəsinə keç/g) ?? []).length, 6);
  assert.equal((clubsHtml.match(/icmasını vurğula/g) ?? []).length, 8);
  assert.match(clubDetailHtml, /Kluba qoşul/);
  assert.match(clubDetailHtml, /İnnovasiya və Robototexnika Klubu/);

  for (const source of [clubsExperience, clubCard, communityCard, detail, joinButton, clubData]) {
    assert.doesNotMatch(source, /<img\b|from "next\/image"|https?:\/\/|\.(?:jpe?g|webp|avif)/i);
  }
  const memberType = clubData.match(/export type ClubMember = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  assert.doesNotMatch(memberType, /\bname:/);

  assert.match(styles, /\.clubs-hero\s*\{/);
  assert.match(styles, /\.club-directory-card\s*\{/);
  assert.match(styles, /\.community-card-shell\.is-active/);
  assert.match(styles, /\.club-detail-tabs\s*\{/);
  assert.match(styles, /\.magnetic-join-button\s*\{/);
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*\.club-detail-tabs\s*\{[^}]*overflow-x:\s*auto/);
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*\.magnetic-join-button\s*\{[^}]*min-height:\s*48px/);
  assert.match(styles, /@media \(hover: none\)[\s\S]*\.community-card-shell\.is-dimmed\s*\{[^}]*opacity:\s*1/);
  await access(new URL("../public/og-phase7.png", import.meta.url));
});

test("idarəetmə mərkəzini real API sərhədi, əlçatan cədvəllər və yüngül analitika ilə qurur", async () => {
  const [
    dashboard,
    sidebar,
    charts,
    dataTable,
    recordForm,
    skeleton,
    dataControls,
    adminHook,
    tableQueryHook,
    apiClient,
    adminAccess,
    adminSession,
    clientAccessGate,
    adminService,
    adminPage,
    navigation,
    styles,
  ] = await Promise.all([
    readFile(new URL("../app/components/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AdminSidebar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AdminCharts.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AdminDataTable.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AdminRecordFormSheet.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AdminSkeleton.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AdminDataControls.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/hooks/useAdminData.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/hooks/useAdminTableQuery.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/api/client.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/auth/admin-access.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/auth/admin-session.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AdminClientAccessGate.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/services/admin.service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/navigation.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const adminUi = [dashboard, sidebar, charts, dataTable, skeleton].join("\n");

  assert.match(navigation, /href: "\/admin"[\s\S]*number: "08"/);
  assert.match(adminPage, /<AdminDashboard/);
  assert.match(adminPage, /resolveAdminAccess/);
  assert.match(adminPage, /access\.status === "granted"/);
  assert.match(adminPage, /access\.status === "client-check"/);
  assert.match(adminPage, /<AdminClientAccessGate/);
  assert.match(adminAccess, /\/auth\/session/);
  assert.match(adminSession, /role === "admin"/);
  assert.match(adminAccess, /cache: "no-store"/);
  assert.match(adminAccess, /readSessionCookie/);
  assert.match(clientAccessGate, /credentials: "include"/);
  assert.match(clientAccessGate, /cache: "no-store"/);
  assert.match(clientAccessGate, /AbortController/);
  assert.match(clientAccessGate, /controller\.abort\(\)/);
  assert.match(clientAccessGate, /<AdminDashboard/);
  assert.match(clientAccessGate, /<AdminSkeleton scope="gate"/);
  assert.doesNotMatch(
    [adminAccess, adminSession, clientAccessGate].join("\n"),
    /localStorage|sessionStorage|document\.cookie/,
  );
  assert.match(adminUi, /useReducedMotion/);
  assert.match(charts, /from "recharts"/);
  assert.match(charts, /(?:AreaChart|BarChart|LineChart|PieChart)/);
  assert.match(sidebar, /aria-expanded/);
  assert.match(sidebar, /(?:collapsed|collapse|isCollapsed|onToggle)/i);

  assert.match(dataTable, /<table\b/);
  assert.match(dataTable, /<thead\b/);
  assert.match(dataTable, /<th\b/);
  assert.match(dataTable, /motion\.tr/);
  assert.match(dataTable, /(?:delay|stagger)/);
  assert.match(dataTable, /<AdminDataControls/);
  assert.doesNotMatch(dataTable, /useDeferredValue|visibleRows\s*=\s*rows\.filter/);
  assert.match(dataTable, /onCreate/);
  assert.match(dataTable, /onEdit/);
  assert.match(dataTable, /onDelete/);
  assert.match(recordForm, /role="dialog"/);
  assert.match(recordForm, /aria-modal="true"/);
  assert.match(recordForm, /event\.key === "Escape"/);
  assert.match(recordForm, /admin-delete-confirmation/);
  assert.match(styles, /\.admin[^{}]*(?:table|data)[^{]*\{[\s\S]{0,2600}position:\s*sticky/i);

  assert.match(adminHook, /useSWR/);
  assert.match(adminHook, /useSWRMutation/);
  assert.match(adminHook, /mutate/);
  assert.match(adminHook, /keepPreviousData/);
  assert.match(adminHook, /optimisticData/);
  assert.match(adminHook, /rollbackOnError:\s*true/);
  assert.match(adminHook, /revalidateAdminData/);
  assert.match(dashboard, /useAdminUserMutations/);
  assert.match(dashboard, /AdminRecordFormSheet/);
  assert.match(dashboard, /useAdminTableQuery/);
  assert.match(dashboard, /activeCollection\.data\?\.total/);
  assert.match(tableQueryHook, /SEARCH_DEBOUNCE_MS\s*=\s*320/);
  assert.match(tableQueryHook, /window\.setTimeout/);
  assert.match(tableQueryHook, /setPageState\(1\)/);
  assert.match(tableQueryHook, /search:\s*search \|\| undefined/);
  assert.match(tableQueryHook, /status,/);
  assert.match(dataControls, /<select/);
  assert.match(dataControls, /onStatusChange/);
  assert.match(dataControls, /aria-label="Əvvəlki səhifə"/);
  assert.match(dataControls, /aria-label="Növbəti səhifə"/);
  assert.match(dataControls, /totalPages/);
  assert.match(apiClient, /fetch\(/);
  assert.match(apiClient, /NEXT_PUBLIC_API_BASE_URL/);
  assert.match(apiClient, /credentials:\s*"include"/);
  for (const operation of ["create", "update", "delete"]) {
    assert.match(adminService, new RegExp(`\\b${operation}\\b`, "i"));
  }
  assert.match(adminService, /function filterRecords/);
  assert.match(adminService, /query\.get\("search"\)/);
  assert.match(adminService, /query\.get\("status"\)/);
  assert.match(adminService, /function paginate/);
  assert.match(adminService, /total:\s*records\.length/);

  assert.match(skeleton, /skeleton/i);
  assert.match(skeleton, /aria-(?:busy|hidden)/);
  assert.match(styles, /@keyframes\s+admin[^\s{]*(?:shimmer|pulse)|@keyframes\s+(?:admin-)?(?:shimmer|pulse)/i);
  assert.match(styles, /\.admin-record-sheet\s*\{/);
  assert.match(styles, /\.admin-crud-create-button\s*\{/);
  assert.doesNotMatch(adminUi, /spinner|LoaderCircle|animate-spin/i);
  assert.doesNotMatch(adminUi, /<img\b|from "next\/image"|https?:\/\/|\.(?:jpe?g|webp|avif)/i);
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

test("dar mobil ekranlarda kompakt, təhlükəsiz və toxunma yönümlü görünüş saxlayır", async () => {
  const [styles, layout, chat] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ChatDock.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(styles, /@media \(max-width: 767px\)/);
  const compactStart = styles.indexOf("@media (max-width: 480px)");
  const narrowStart = styles.indexOf("@media (max-width: 360px)", compactStart);
  assert.ok(compactStart > -1 && narrowStart > compactStart);
  const compact = styles.slice(compactStart, narrowStart);

  assert.match(compact, /\.hero-stamp\s*{\s*display:\s*none/);
  assert.match(compact, /\.hero-title\s*{[^}]*font-size:\s*clamp\(40px/s);
  assert.match(compact, /\.peers-grid\[aria-busy="true"\]\s*{\s*min-height:\s*0/);
  assert.match(compact, /\.criteria-rating-shell \[role="radiogroup"\]/);
  assert.match(compact, /\.drawer-facts\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(compact, /\.floating-field input,[^}]*font-size:\s*16px/s);
  assert.match(compact, /safe-area-inset-top/);
  assert.match(compact, /safe-area-inset-bottom/);
  assert.doesNotMatch(compact, /min-height:\s*780px|font-size:\s*52px/);

  assert.match(layout, /viewportFit:\s*"cover"/);
  assert.match(chat, /\(min-width: 768px\) and \(pointer: fine\)/);
});
