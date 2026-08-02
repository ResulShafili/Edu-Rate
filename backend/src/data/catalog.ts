export type CatalogEvent = {
  id: string;
  title: string;
  category: "Design" | "Technology" | "Culture" | "Wellness";
  description: string;
  longDescription: string;
  location: string;
  city: string;
  organizer: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  speakers: string[];
  capacity: number;
  availableSpots: number;
  accent: string;
  glow: string;
};

export const events: CatalogEvent[] = [
  {
    id: "future-forms",
    title: "Gələcəyin formaları",
    category: "Design",
    description: "Yeni ideyaları, sistemləri və hekayələri birlikdə araşdıran kampus görüşü.",
    longDescription: "Dizayna maraq göstərən tələbələr üçün canlı görüş. Material təcrübələri, məkan interfeysləri və düşünülmüş sabah yaradan insanlarla söhbətlər bir araya gəlir.",
    location: "Yaradıcılıq zalı",
    city: "Xankəndi",
    organizer: "Dizayn və yaradıcılıq mərkəzi",
    startAt: "2026-09-18T18:30:00+04:00",
    endAt: "2026-09-18T20:00:00+04:00",
    registrationDeadline: "2026-09-17T23:59:59+04:00",
    speakers: ["Ləman Həsənli", "Nihad Əlizadə", "Aytac Hüseynova"],
    capacity: 180,
    availableSpots: 42,
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.28)",
  },
  {
    id: "human-machine",
    title: "İnsan / Maşın",
    category: "Technology",
    description: "Zəka, təxəyyül və bizi insan edən dəyərlər haqqında səmimi söhbət.",
    longDescription: "Ağıllı alətlərlə münasibətimiz barədə daha düzgün suallar verən görüş praktik düşüncə və açıq fikirli tələbələri bir araya gətirir.",
    location: "Texnologiya laboratoriyası",
    city: "Xankəndi",
    organizer: "Texnologiya klubu",
    startAt: "2026-09-22T19:00:00+04:00",
    endAt: "2026-09-22T20:30:00+04:00",
    registrationDeadline: "2026-09-21T23:59:59+04:00",
    speakers: ["İradə Babayeva", "Kamran Məmmədli", "Aysu Quliyeva"],
    capacity: 120,
    availableSpots: 18,
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.3)",
  },
  {
    id: "afterlight",
    title: "İşıqdan sonra",
    category: "Culture",
    description: "Səs, işıq, hərəkət və ortaq heyrət hissini birləşdirən immersiv gecə.",
    longDescription: "İnteraktiv instalyasiyalar, canlı performanslar və dəyişən səs mənzərələri arasında sərbəst dolaşacağın kampus axşamı.",
    location: "Kampus mədəniyyət mərkəzi",
    city: "Xankəndi",
    organizer: "Mədəniyyət mərkəzi",
    startAt: "2026-09-28T21:00:00+04:00",
    endAt: "2026-09-28T23:00:00+04:00",
    registrationDeadline: "2026-09-27T23:59:59+04:00",
    speakers: ["Xəzər Studiyası", "Elvin Vəliyev", "Aynur Rəhimli"],
    capacity: 350,
    availableSpots: 96,
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.3)",
  },
  {
    id: "soft-reset",
    title: "Yumşaq başlanğıc",
    category: "Wellness",
    description: "Diqqəti, enerjini və yenidən başlamaq hissini bərpa edən sakit səhər.",
    longDescription: "Daim məşğul düşüncələr üçün yarımgünlük fasilə. Kampusun sakit həyətində hərəkət, nəfəs məşqləri və şüurlu fasilə bir araya gəlir.",
    location: "Yaşıl kampus həyəti",
    city: "Xankəndi",
    organizer: "Tələbə rifahı mərkəzi",
    startAt: "2026-10-04T09:30:00+04:00",
    endAt: "2026-10-04T12:30:00+04:00",
    registrationDeadline: "2026-10-02T18:00:00+04:00",
    speakers: ["Nərmin Əliyeva", "Mahir Soltanlı", "Sakit Studiyası"],
    capacity: 48,
    availableSpots: 8,
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.28)",
  },
];

export const clubs = [
  { id: "robototexnika", name: "İnnovasiya və Robototexnika Klubu", category: "Texnologiya", memberCount: 128 },
  { id: "debat", name: "Debat və Natiqlik Cəmiyyəti", category: "Akademik", memberCount: 84 },
  { id: "kitab", name: "Kitab və Müzakirə Klubu", category: "Mədəniyyət", memberCount: 96 },
];

export const mentors = [
  { id: "aygun-rzayeva", name: "Aygün Rzayeva", expertise: ["Məhsul strategiyası", "İstifadəçi araşdırması"], available: true },
  { id: "murad-selimli", name: "Murad Səlimli", expertise: ["Yaradıcı proqramlaşdırma", "Prototipləşdirmə"], available: true },
  { id: "pervin-necefova", name: "Pərvin Nəcəfova", expertise: ["Məsuliyyətli süni intellekt", "Araşdırma dizaynı"], available: true },
  { id: "kenan-memmedov", name: "Kənan Məmmədov", expertise: ["Sistem dizaynı", "Sosial innovasiya"], available: true },
  { id: "yegane-tahirova", name: "Yeganə Tahirova", expertise: ["Xidmət dizaynı", "İstifadəçi yolu"], available: true },
  { id: "sevinc-melikova", name: "Sevinc Məlikova", expertise: ["Karyera planlaması", "Portfolio"], available: true },
];
