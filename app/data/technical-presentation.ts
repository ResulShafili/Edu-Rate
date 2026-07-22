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
    value: "Tailwind CSS və qlobal dark premium dizayn dili",
    detail: "Sabit rəng palitrası, responsive spacing, sol naviqasiya və vahid komponent davranışı.",
  },
  {
    label: "Hərəkət",
    value: "Framer Motion",
    detail: "Səhifə keçidləri, kart hover-ləri, list reflow-ları və əlçatan azaldılmış hərəkət dəstəyi.",
  },
  {
    label: "API hazırlığı",
    value: "Fetch client, service layer və SWR hook-ları",
    detail: "Node.js + Express backend-ə qoşulmaq üçün hazır sorğu, cache və error strukturu.",
  },
] as const;

export const plannedApiContracts = [
  "GET /auth/session",
  "GET /admin/overview",
  "GET /admin/users",
  "POST /admin/users",
  "PATCH /admin/users/:id",
  "DELETE /admin/users/:id",
  "GET, POST, PATCH, DELETE /admin/clubs",
  "GET, POST, PATCH, DELETE /admin/events",
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
    status: "Qoşulmağa hazır",
    detail: "REST API müqaviləsi düşünülüb, real Express servisləri ayrıca yazılmalıdır.",
  },
  {
    label: "Database",
    status: "Növbəti mərhələ",
    detail: "Production məlumat bazası aktiv deyil; demo məlumatlar təqdimat üçündür.",
  },
  {
    label: "Təhlükəsizlik",
    status: "Serverdə tamamlanmalıdır",
    detail: "Admin rolu, rəy moderasiyası və icazələr backend middleware-də yoxlanmalıdır.",
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
  "EduRate universitet daxilində tələbə təcrübəsini birləşdirən rəqəmsal platformadır. Frontend tərəfi React, Next.js və TypeScript ilə hazırlanıb. Sistem modullar şəklində qurulduğu üçün tədbirlər, elanlar, klublar, mentorluq, müəllim qiymətləndirməsi və admin panel ayrıca inkişaf etdirilə bilir. Hazırda interfeys və əsas istifadəçi axınları hazırdır, API strukturu isə Node.js və Express backend-ə qoşulmaq üçün əvvəlcədən düşünülüb. Növbəti mərhələdə real autentifikasiya, database, admin icazələri və rəy moderasiya sistemi əlavə edilməlidir.";
