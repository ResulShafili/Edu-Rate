import { accountRoutes, platformRoutes } from "./navigation";

export type PlatformShortcut = {
  href: string;
  label: string;
  description: string;
};

export type PlatformRouteContext = {
  label: string;
  title: string;
  description: string;
  metric: string;
  shortcuts: readonly PlatformShortcut[];
};

const homeContext: PlatformRouteContext = {
  label: "Ana səhifə",
  title: "Platformanın mərkəzi",
  description: "EduRate-in bütün imkanlarına sakit və sürətli başlanğıc nöqtəsi.",
  metric: "9 əsas istiqamət",
  shortcuts: [
    { href: "/events", label: "Tədbirləri kəşf et", description: "Yeni görüş və təcrübələrə bax." },
    { href: "/community", label: "İcmanı aç", description: "Ortaq maraqları olan insanları tap." },
    { href: "/teachers", label: "Müəllim seç", description: "Meyarlar üzrə rəyləri müqayisə et." },
  ],
};

const routeContexts: Record<string, PlatformRouteContext> = {
  "/events": {
    label: "Tədbirlər",
    title: "Tədbir alətləri",
    description: "Kateqoriyaları süzgəcdən keçir və uyğun görüşün detallarını aç.",
    metric: "6 seçilmiş tədbir",
    shortcuts: [
      { href: "/events#events", label: "Tədbir kataloqu", description: "Bütün kateqoriyaları bir yerdə gör." },
      { href: "/feed", label: "Kampus yenilikləri", description: "Elan və xəbərləri izlə." },
    ],
  },
  "/community": {
    label: "İcma",
    title: "İcma alətləri",
    description: "Tələbələri maraq sahəsinə görə kəşf et, əlaqə qur və söhbətə başla.",
    metric: "2 418 aktiv üzv",
    shortcuts: [
      { href: "/community#peers", label: "İcma kataloqu", description: "Uyğun insanları və maraqları gör." },
      { href: "/clubs", label: "Klublara bax", description: "Daimi kampus icmalarını kəşf et." },
    ],
  },
  "/teachers": {
    label: "Müəllimlər",
    title: "Müəllim alətləri",
    description: "Müəllimi seç, bacarıqlar üzrə qiymətləndir və əsaslandırılmış rəy yaz.",
    metric: "4 obyektiv meyar",
    shortcuts: [
      { href: "/teachers#available-teachers-track", label: "Müəllimləri müqayisə et", description: "Mövcud müəllim kartlarını nəzərdən keçir." },
      { href: "/teachers#teacher-rating-panel", label: "Qiymətləndirmə paneli", description: "Seçilmiş müəllim üçün rəy göndər." },
    ],
  },
  "/mentors": {
    label: "Mentorlar",
    title: "Mentorluq alətləri",
    description: "Təcrübə sahəsini və uyğun vaxtı yoxla, sonra mentorluq sorğusu göndər.",
    metric: "6 təcrübəli mentor",
    shortcuts: [
      { href: "/mentors#mentors", label: "Mentorları tap", description: "Profil və uyğunluq məlumatlarını aç." },
      { href: "/support", label: "Dəstəyə müraciət et", description: "Əlavə kömək üçün dəstək mərkəzinə keç." },
    ],
  },
  "/support": {
    label: "Dəstək",
    title: "Dəstək alətləri",
    description: "Tez-tez verilən suallara bax və ehtiyac olarsa müraciət yarat.",
    metric: "1 iş günü ərzində cavab",
    shortcuts: [
      { href: "/support#support", label: "Tez-tez verilən suallar", description: "Hazır cavabları sürətlə tap." },
      { href: "/support#ticket-name", label: "Müraciət göndər", description: "Dəstək komandası üçün sorğu yarat." },
    ],
  },
  "/feed": {
    label: "Elanlar",
    title: "Elanlar alətləri",
    description: "Rəsmi elanları, klub yeniliklərini və fakültə xəbərlərini izlə.",
    metric: "Gündəlik yenilənən şəbəkə",
    shortcuts: [
      { href: "/feed#announcements-title", label: "Vacib elanlar", description: "Ən yeni rəsmi məlumatlara bax." },
      { href: "/feed#student-feed-stream-title", label: "Tələbə yenilikləri", description: "Paylaşım və xəbərlərə davam et." },
    ],
  },
  "/clubs": {
    label: "Klublar",
    title: "Klub alətləri",
    description: "Tələbə klublarını və təşkilatlarını bir kataloqda kəşf et.",
    metric: "6 tələbə klubu",
    shortcuts: [
      { href: "/clubs#clubs-list-title", label: "Klub kataloqu", description: "Bütün tələbə klublarına bax." },
    ],
  },
  "/admin": {
    label: "İdarəetmə",
    title: "İdarəetmə alətləri",
    description: "Platforma göstəricilərinə, cədvəllərə və idarəetmə axınlarına keç.",
    metric: "Canlı analitika · çevik nəzarət",
    shortcuts: [
      { href: "/admin#admin-overview", label: "Ümumi göstəricilər", description: "Platformanın cari vəziyyətini izlə." },
      { href: "/admin#admin-data", label: "Məlumat cədvəlləri", description: "İstifadəçi, klub və tədbirləri idarə et." },
    ],
  },
  "/profile": {
    label: "Profilim",
    title: "Profil alətləri",
    description: "Şəxsi məlumatlarını, maraqlarını və son fəaliyyətini bir yerdə gör.",
    metric: "Şəxsi öyrənmə məkanı",
    shortcuts: [
      { href: "/profile#profile-title", label: "Profil xülasəsi", description: "Şəxsi məlumat və fəaliyyətə bax." },
      { href: "/support", label: "Hesab dəstəyi", description: "Hesab ilə bağlı kömək al." },
    ],
  },
  "/settings": {
    label: "Parametrlər",
    title: "Hesab seçimləri",
    description: "Bildiriş seçimlərini və şəxsi təcrübəni idarə et.",
    metric: "Cihazda yadda saxlanılır",
    shortcuts: [
      { href: "/settings#settings-title", label: "Bildiriş seçimləri", description: "Vacib yenilik və xatırlatmaları idarə et." },
      { href: "/privacy", label: "Məxfilik", description: "Məlumat istifadəsi prinsiplərinə bax." },
    ],
  },
  "/privacy": {
    label: "Məxfilik",
    title: "Məxfilik məlumatları",
    description: "Şəxsi məlumatların istifadəsi ilə tanış ol.",
    metric: "Aydın məlumat siyasəti",
    shortcuts: [],
  },
  "/terms": {
    label: "İstifadə şərtləri",
    title: "Platforma qaydaları",
    description: "Təhlükəsiz və hörmətli istifadə qaydalarını oxu.",
    metric: "İcma qaydaları",
    shortcuts: [],
  },
  "/auth": {
    label: "Daxil ol",
    title: "Hesab alətləri",
    description: "EduRate hesabına təhlükəsiz daxil ol və ya yeni profil yarat.",
    metric: "Təhlükəsiz giriş",
    shortcuts: [
      { href: "/auth#auth-title", label: "Giriş paneli", description: "Hesabına daxil olmağa davam et." },
      { href: "/support", label: "Giriş dəstəyi", description: "Problem yaranarsa cavab tap." },
    ],
  },
};

export const platformSearchItems = [
  {
    href: "/",
    label: "Ana səhifə",
    description: "EduRate platformasının ümumi görünüşü",
    keywords: "ana panel başlanğıc platforma",
  },
  ...platformRoutes.map((route) => ({
    href: route.href,
    label: route.label,
    description: route.description,
    keywords: `${route.label} ${route.title} ${route.description}`,
  })),
  ...accountRoutes.map((route) => ({
    href: route.href,
    label: route.label,
    description: route.href === "/profile"
      ? "Şəxsi məlumat və fəaliyyət"
      : route.href === "/settings"
        ? "Bildiriş və hesab seçimləri"
        : "Giriş və qeydiyyat",
    keywords: route.href === "/profile"
      ? "profil hesab məlumat"
      : route.href === "/settings"
        ? "parametrlər bildiriş seçim"
        : "daxil ol qeydiyyat hesab",
  })),
] as const;

export function isPlatformRouteCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPlatformRouteContext(pathname: string): PlatformRouteContext {
  if (pathname === "/") return homeContext;

  const matchingPath = Object.keys(routeContexts)
    .sort((a, b) => b.length - a.length)
    .find((href) => pathname === href || pathname.startsWith(`${href}/`));

  return matchingPath ? routeContexts[matchingPath] : homeContext;
}
