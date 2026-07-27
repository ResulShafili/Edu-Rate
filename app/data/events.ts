export type EventCategory = "Design" | "Technology" | "Culture" | "Wellness";
export type EventMonth = "SEP" | "OCT";

export type Event = {
  id: string;
  category: EventCategory;
  date: string;
  month: EventMonth;
  time: string;
  title: string;
  location: string;
  city: string;
  description: string;
  longDescription: string;
  accent: string;
  glow: string;
  speakers: string[];
  capacity: string;
};

export const categories = [
  "All",
  "Design",
  "Technology",
  "Culture",
  "Wellness",
] as const;

export type EventFilter = (typeof categories)[number];

export const eventCategoryLabels: Record<EventFilter, string> = {
  All: "Hamısı",
  Design: "Dizayn",
  Technology: "Texnologiya",
  Culture: "Mədəniyyət",
  Wellness: "Sağlamlıq",
};

export const eventMonthLabels: Record<EventMonth, string> = {
  SEP: "SEN",
  OCT: "OKT",
};

export const eventMonthLongLabels: Record<EventMonth, string> = {
  SEP: "sentyabr",
  OCT: "oktyabr",
};

export const events: Event[] = [
  {
    id: "future-forms",
    category: "Design",
    date: "18",
    month: "SEP",
    time: "18:30",
    title: "Gələcəyin formaları",
    location: "Yaradıcılıq zalı",
    city: "Xankəndi",
    description: "Yeni ideyaları, sistemləri və hekayələri birlikdə araşdıran kampus görüşü.",
    longDescription:
      "Dizayna maraq göstərən tələbələr üçün canlı görüş. Material təcrübələrini, məkan interfeyslərini və daha düşünülmüş sabah yaradan insanlarla söhbətləri kampusda bir araya gətirir.",
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.28)",
    speakers: ["Ləman Həsənli", "Nihad Əlizadə", "Aytac Hüseynova"],
    capacity: "180 iştirakçı",
  },
  {
    id: "human-machine",
    category: "Technology",
    date: "22",
    month: "SEP",
    time: "19:00",
    title: "İnsan / Maşın",
    location: "Texnologiya laboratoriyası",
    city: "Xankəndi",
    description: "Zəka, təxəyyül və bizi insan edən dəyərlər haqqında səmimi söhbət.",
    longDescription:
      "Ağıllı alətlərlə münasibətimiz barədə daha düzgün suallar verən bu görüş praktik düşüncə, canlı müzakirə və açıq fikirli tələbələri bir araya gətirir.",
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.3)",
    speakers: ["İradə Babayeva", "Kamran Məmmədli", "Aysu Quliyeva"],
    capacity: "120 iştirakçı",
  },
  {
    id: "afterlight",
    category: "Culture",
    date: "28",
    month: "SEP",
    time: "21:00",
    title: "İşıqdan sonra",
    location: "Kampus mədəniyyət mərkəzi",
    city: "Xankəndi",
    description: "Səs, işıq, hərəkət və ortaq heyrət hissini birləşdirən immersiv gecə.",
    longDescription:
      "Kampus axşamında “İşıqdan sonra” başlayır. İnteraktiv instalyasiyalar, canlı performanslar və dəyişən səs mənzərələri arasında sərbəst dolaş.",
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.3)",
    speakers: ["Xəzər Studiyası", "Elvin Vəliyev", "Aynur Rəhimli"],
    capacity: "350 iştirakçı",
  },
  {
    id: "soft-reset",
    category: "Wellness",
    date: "04",
    month: "OCT",
    time: "09:30",
    title: "Yumşaq başlanğıc",
    location: "Yaşıl kampus həyəti",
    city: "Xankəndi",
    description: "Diqqəti, enerjini və yenidən başlamaq hissini bərpa edən sakit səhər.",
    longDescription:
      "Daim məşğul düşüncələr üçün yarımgünlük fasilə. Kampusun sakit həyətində hərəkət, nəfəs məşqləri və şüurlu fasilə bir araya gəlir.",
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.28)",
    speakers: ["Nərmin Əliyeva", "Mahir Soltanlı", "Sakit Studiyası"],
    capacity: "48 iştirakçı",
  },
  {
    id: "strange-loops",
    category: "Technology",
    date: "11",
    month: "OCT",
    time: "17:45",
    title: "Qəribə dövrlər",
    location: "Açıq laboratoriya",
    city: "Xankəndi",
    description: "Kod, musiqi və yeni yaradıcı sistemlərin sərhədində canlı təcrübələr.",
    longDescription:
      "Bir qədər konsert, bir qədər laboratoriya olan “Qəribə dövrlər” yaradıcı texnoloqları səhnədə yeni sistemlər qurmağa, sınaqdan keçirməyə və canlı remiks etməyə dəvət edir. Nəticəni tamaşaçılar da formalaşdırır.",
    accent: "#77b8ff",
    glow: "rgba(119, 184, 255, 0.3)",
    speakers: ["Sıra Laboratoriyası", "Mələk Cəfərova", "Tural Qarayev"],
    capacity: "220 iştirakçı",
  },
  {
    id: "new-rituals",
    category: "Design",
    date: "16",
    month: "OCT",
    time: "18:00",
    title: "Yeni rituallar",
    location: "Dizayn studiyası",
    city: "Xankəndi",
    description: "Dizaynerlər gündəlik həyatı quran əşyalara və vərdişlərə yenidən baxırlar.",
    longDescription:
      "Gündəlik həyatın sakit axınından bəhs edən, əşyaların ön planda olduğu səmimi sərgi. Sənətkarlıq, texnologiya və qayğı ilə tanış vərdişlərə yeni məna verən dizaynerlərlə görüş.",
    accent: "#f7d56f",
    glow: "rgba(247, 213, 111, 0.28)",
    speakers: ["Nərgiz Vəlizadə", "Səhər Bürosu", "Rauf İsmayılov"],
    capacity: "95 iştirakçı",
  },
];
