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
    detail: "MVP endpoint-ləri işləkdir; eyni kontrakt Node.js + Express və davamlı database qatına daşına bilər.",
  },
] as const;

export const plannedApiContracts = [
  "GET /api/health",
  "POST /api/auth/signup və /api/auth/login",
  "GET /api/auth/session və PATCH /api/auth/profile",
  "GET /api/admin/overview",
  "GET, POST, PATCH, DELETE /api/admin/users",
  "GET, POST, PATCH, DELETE /api/admin/clubs və /api/admin/events",
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
    detail: "Giriş, sessiya, profil, idarəetmə və OpenAPI endpoint-ləri işlək demo yaddaş anbarı ilə təqdim edilir.",
  },
  {
    label: "Database",
    status: "Növbəti mərhələ",
    detail: "Davamlı production məlumat bazası aktiv deyil; sprint MVP-də məlumatlar demo yaddaş anbarında saxlanır.",
  },
  {
    label: "Təhlükəsizlik",
    status: "Qismən hazır",
    detail: "Sessiya HttpOnly cookie ilə yaradılır, rəy moderasiyası API-də yoxlanır; admin rol və database icazələri növbəti mərhələdir.",
  },
] as const;

export const presentationChecklist = [
  "Sayt desktop və mobil ölçülərdə açılır.",
  "Sol menyudan bütün bölmələrə keçid işləyir.",
  "Tədbir, klub, mentor və müəllim səhifələri vizual olaraq dağılmır.",
  "Müəllim qiymətləndirməsində meyarlar aydın görünür.",
  "Admin panel demo məlumatları göstərir.",
  "Build prosesi uğurla tamamlanır.",
] as const;

export const leadershipScript =
  "EduRate Qarabağ Universiteti üçün tələbə təcrübəsini birləşdirən rəqəmsal platformadır. Frontend React, Next.js və TypeScript ilə, interfeys isə universitetin vahid KUDS dizayn sistemi ilə hazırlanıb. Tədbirlər, elanlar, klublar, mentorluq, müəllim qiymətləndirməsi və admin panel ayrı modullar kimi inkişaf etdirilir. Sprint MVP-də giriş, sessiya, profil, idarəetmə və OpenAPI endpoint-ləri işləkdir. Növbəti mərhələdə davamlı database, rol əsaslı admin icazələri və Express backend-in daimi servis qatı əlavə ediləcək.";
