export const presentationQuestions = [
  "EduRate hansı problemi həll edir?",
  "Sistem hansı texnologiyalarla qurulub?",
  "Hazırda nə işləyir, nə demo mərhələsindədir?",
  "Növbəti backend və təhlükəsizlik addımları nədir?",
] as const;

export const presentationModules = [
  "Ana səhifə",
  "Tədbirlər",
  "İcma və mesajlaşma",
  "Mentorlar",
  "Müəllim seçimi və qiymətləndirmə",
  "Dəstək sistemi",
  "Elanlar",
  "Klublar",
  "Profil və giriş/qeydiyyat",
  "Admin panel",
] as const;

export const presentationStack = [
  {
    label: "Frontend",
    value: "React, Next.js App Router və TypeScript",
    detail: "Modullu səhifə quruluşu, tip təhlükəsizliyi və gələcək genişlənmə üçün əsas qat.",
  },
  {
    label: "UI sistemi",
    value: "KUDS, Tailwind CSS və vahid komponent sistemi",
    detail: "Qarabağ Universiteti yaşıl palitrası, Poppins tipografiyası, 4–96 px spacing, sol naviqasiya və 72 px header.",
  },
  {
    label: "Hərəkət",
    value: "Framer Motion",
    detail: "Səhifə keçidləri, kart hover-ləri, list reflow-ları və əlçatan azaldılmış hərəkət dəstəyi.",
  },
  {
    label: "API hazırlığı",
    value: "REST Route Handlers, Fetch client və OpenAPI 3.1",
    detail: "Next.js BFF qatı canlı Node.js + Express API-yə bağlıdır və əsas əməliyyatlar PostgreSQL-də saxlanılır.",
  },
] as const;

export const plannedApiContracts = [
  "GET /api/health",
  "POST /api/auth/signup və /api/auth/login",
  "GET /api/auth/session və PATCH /api/auth/profile",
  "GET /api/admin/overview",
  "GET, POST, PATCH, DELETE /api/admin/users",
  "GET, POST, PATCH, DELETE /api/admin/clubs və /api/admin/events",
  "POST, DELETE /api/clubs/:clubId/memberships",
  "GET, POST, PATCH, DELETE /api/events və /api/events/:eventId",
  "GET, POST, PATCH, DELETE /api/mentorship/requests",
  "POST /api/reviews və /api/support/tickets",
  "GET /api/openapi.json",
] as const;

export const reviewCriteria = [
  "İzahın aydınlığı",
  "Fənn biliyi",
  "Obyektivlik",
  "Ünsiyyət və dəstək",
] as const;

export const readinessNotes = [
  {
    label: "Frontend",
    status: "Hazır",
    detail: "Əsas istifadəçi axınları və premium interfeys modulları qurulub.",
  },
  {
    label: "Backend",
    status: "MVP hazır",
    detail: "Giriş, sessiya, profil, tədbir, klub, mentorluq, rəy, dəstək və idarəetmə endpoint-ləri Render-də işləyir.",
  },
  {
    label: "Database",
    status: "Aktiv",
    detail: "Render PostgreSQL production bazası istifadəçi və əsas biznes əməliyyatlarını qalıcı saxlayır.",
  },
  {
    label: "Təhlükəsizlik",
    status: "MVP hazır",
    detail: "Sessiya HttpOnly cookie ilə qorunur, server rəy moderasiyası aparır və admin endpoint-ləri rol ilə məhdudlaşdırılır.",
  },
] as const;

export const presentationChecklist = [
  "Sayt desktop və mobil ölçülərdə açılır.",
  "Sol menyudan bütün bölmələrə keçid işləyir.",
  "Tədbir, klub, mentor və müəllim səhifələri vizual olaraq dağılmır.",
  "Müəllim qiymətləndirməsində meyarlar aydın görünür.",
  "Admin panel verilənlər bazasından canlı məlumatları göstərir.",
  "Build prosesi uğurla tamamlanır.",
] as const;

export const leadershipScript =
  "EduRate Qarabağ Universiteti üçün tələbə təcrübəsini birləşdirən rəqəmsal platformadır. Frontend React, Next.js və TypeScript, backend Node.js və Express, qalıcı məlumat qatı isə PostgreSQL ilə hazırlanıb. Tədbir qeydiyyatı, klub üzvlüyü, mentorluq, müəllim rəyi, dəstək müraciəti və admin idarəetməsi canlı API-yə bağlıdır. Sistem HttpOnly sessiya, server validasiyası, moderasiya və rol əsaslı admin qoruması ilə Sprint 2-nin əsas uçdan-uca axınlarını tamamlayır.";
