export const platformRoutes = [
  {
    href: "/events",
    label: "Tədbirlər",
    number: "01",
    title: "Yeni təcrübələr kəşf et",
    description: "Kiçik qruplar, böyük ideyalar və düşünülmüş görüşlər.",
    metric: "6 seçilmiş tədbir",
    accent: "#c8ff4d",
  },
  {
    href: "/community",
    label: "İcma",
    number: "02",
    title: "Doğru insanlarla tanış ol",
    description: "Ortaq maraqlardan başlayan səmimi və məqsədli əlaqələr.",
    metric: "2 418 aktiv üzv",
    accent: "#77b8ff",
  },
  {
    href: "/teachers",
    label: "Müəllimlər",
    number: "03",
    title: "Müəllimini inamla seç",
    description: "Bacarıqlara əsaslanan şəffaf qiymətləndirmə və real rəylər.",
    metric: "4 qiymətləndirmə meyarı",
    accent: "#b9a7ff",
  },
  {
    href: "/mentors",
    label: "Mentorlar",
    number: "04",
    title: "Növbəti addımını aydınlaşdır",
    description: "Sənin keçdiyin yoldan daha əvvəl keçmiş insanlardan dəstək al.",
    metric: "6 təcrübəli mentor",
    accent: "#ff9e7a",
  },
  {
    href: "/support",
    label: "Dəstək",
    number: "05",
    title: "Cavabı vaxtında tap",
    description: "Aydın cavablar və ehtiyac olanda insan yönümlü dəstək.",
    metric: "1 iş günü ərzində cavab",
    accent: "#7de5d1",
  },
  {
    href: "/feed",
    label: "Elanlar",
    number: "06",
    title: "Universitetin nəbzini izlə",
    description: "Tələbə paylaşımlarını, vacib elanları və kampus yeniliklərini bir yerdə izlə.",
    metric: "gündəlik yenilənən şəbəkə",
    accent: "#ffcf66",
  },
  {
    href: "/clubs",
    label: "Klublar",
    number: "07",
    title: "Maraq dairəni icmaya çevir",
    description: "Tələbə klubları, təşkilatlar və ortaq məqsədlər ətrafında yaranan birliklər.",
    metric: "6 tələbə klubu",
    accent: "#ff9e7a",
  },
  {
    href: "/admin",
    label: "İdarəetmə",
    number: "08",
    title: "Platformanı aydın idarə et",
    description: "İstifadəçi, klub, tədbir və müraciət axınlarını bir sakit idarəetmə mərkəzində izlə.",
    metric: "canlı analitika · çevik nəzarət",
    accent: "#72ddf7",
  },
  {
    href: "/technical-presentation",
    label: "Təqdimat",
    number: "09",
    title: "Layihəni aydın izah et",
    description: "Rəhbər görüşləri üçün texniki vəziyyət, API hazırlığı və növbəti addımlar.",
    metric: "rəhbərlər üçün hazır skript",
    accent: "#d4ff00",
  },
] as const;

export type PlatformRoute = (typeof platformRoutes)[number];

export const accountRoutes = [
  { href: "/profile", label: "Profilim", number: "P" },
  { href: "/auth", label: "Daxil ol", number: "A" },
] as const;

export const allPlatformRoutes = [...platformRoutes, ...accountRoutes] as const;
