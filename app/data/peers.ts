export type PeerStatus = "online" | "away" | "offline";

export type Peer = {
  id: string;
  name: string;
  initials: string;
  role: string;
  focus: string;
  bio: string;
  city: string;
  status: PeerStatus;
  accent: string;
  glow: string;
  mutuals: number;
  tags: string[];
  openingMessage: string;
  reply: string;
};

export const peers: Peer[] = [
  {
    id: "amara-osei",
    name: "Amara Osei",
    initials: "AO",
    role: "Sistem tədqiqatçısı",
    focus: "İnsan mərkəzli süni intellekt",
    bio: "Ağıllı alətlərin insan mühakiməsini əvəz etmək əvəzinə onu necə gücləndirə biləcəyini araşdırır.",
    city: "Berlin",
    status: "online",
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.34)",
    mutuals: 14,
    tags: ["Süni intellekt etikası", "Tədqiqat"],
    openingMessage: "İnsan / Maşın tədbirində sənin üçün yer saxladım. Hələ də iştirak etməyi düşünürsən?",
    reply: "Əla — qeydlərimi əvvəlcədən səninlə bölüşərəm. Orada söhbətimizi davam etdirmək xoş olar.",
  },
  {
    id: "mina-park",
    name: "Mina Park",
    initials: "MP",
    role: "Müstəqil dizayner",
    focus: "Gələcəyin materialları",
    bio: "Eksperimental materialları faydalı, isti və gündəlik həyatın təbii bir hissəsinə çevirir.",
    city: "Kopenhagen",
    status: "online",
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.3)",
    mutuals: 9,
    tags: ["Dizayn", "Materiallar"],
    openingMessage: "Gələcəyin formaları sessiyasından sonra verdiyin sual məni düşündürdü. Qeydlərimizi müqayisə edək?",
    reply: "Məmnuniyyətlə. İndi bir neçə mənbə toplayıram — ən faydalı olanları sənə göndərəcəyəm.",
  },
  {
    id: "kaito-mori",
    name: "Kaito Mori",
    initials: "KM",
    role: "Kreativ texnoloq",
    focus: "Məkan texnologiyaları",
    bio: "Rəqəmsal məkanları daha fiziki və sosial hiss etdirən əyləncəli interfeyslər hazırlayır.",
    city: "Tokio",
    status: "away",
    accent: "#77b8ff",
    glow: "rgba(119, 184, 255, 0.32)",
    mutuals: 21,
    tags: ["Yaradıcı kodlaşdırma", "XR"],
    openingMessage: "Danışdığımız prototipi indicə sınadım — məkan səsi bütün təcrübəni dəyişdi.",
    reply: "Bəli, məhz belə. Bu həftə rahat araşdıra bilməyin üçün demo versiyanı hazırlayıb göndərim.",
  },
  {
    id: "nia-laurent",
    name: "Nia Laurent",
    initials: "NL",
    role: "Komanda rifahı üzrə strateq",
    focus: "Sağlam və davamlı inkişaf",
    bio: "Yaradıcı komandalara yüksək keyfiyyətli işlə sağlam həyatın yanaşı mövcud olduğu mədəniyyət qurmağa kömək edir.",
    city: "Paris",
    status: "online",
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.3)",
    mutuals: 7,
    tags: ["Rifah", "Mədəniyyət"],
    openingMessage: "Yumşaq yenilənmə sessiyasındakı düşüncə tapşırığı hazırdır. Bir nüsxəsini sənə göndərim?",
    reply: "İndi göndərirəm. Tələsmə — sualların heç birinə cavab verməyin yeganə düzgün yolu yoxdur.",
  },
  {
    id: "leon-vale",
    name: "León Vale",
    initials: "LV",
    role: "Səs sənətçisi",
    focus: "İmmersiv səhnə təcrübələri",
    bio: "Tamaşaçının hərəkətinə cavab verən və onu alətin bir hissəsinə çevirən səs mühitləri yaradır.",
    city: "Lissabon",
    status: "offline",
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.3)",
    mutuals: 18,
    tags: ["Səs", "İnstalyasiya"],
    openingMessage: "Afterlight üçün yekun məkanı qururam və sükutla bağlı ideyanı xatırladım.",
    reply: "Elə həmin fikir. Kiçik bir səssizlik növbəti səsi daha təsirli hiss etdirir — bunu gördüyün üçün təşəkkür edirəm.",
  },
  {
    id: "iris-bell",
    name: "Iris Bell",
    initials: "IB",
    role: "Məhsul və texnologiya filosofu",
    focus: "Texnologiya və cəmiyyət",
    bio: "Nə yaratdığımız, niyə yaratdığımız və qərarı kimin verdiyi barədə daha düzgün suallar qoyur.",
    city: "London",
    status: "online",
    accent: "#f7d56f",
    glow: "rgba(247, 213, 111, 0.3)",
    mutuals: 11,
    tags: ["Gələcək", "Yazı"],
    openingMessage: "Gələn cümə axşamı kiçik bir mütaliə qrupu keçirirəm. Sənin baxışın söhbətə çox şey qatar.",
    reply: "Möhtəşəm. Qısa oxu siyahısını göndərəcəyəm — qəsdən yığcamdır ki, söhbətə geniş vaxt qalsın.",
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    initials: "MC",
    role: "Generativ sənətçi",
    focus: "Canlı sistemlər",
    bio: "Kod, hava məlumatları və kiçik iştirak addımları ilə daim dəyişən vizual dünyalar yaradır.",
    city: "Amsterdam",
    status: "away",
    accent: "#f09cff",
    glow: "rgba(240, 156, 255, 0.3)",
    mutuals: 16,
    tags: ["Generativ sənət", "Kod"],
    openingMessage: "Ortaq kətan yenidən açıqdır. Sınağın üçün orada yeni bir sistem buraxdım.",
    reply: "Ona məhz belə yaradıcı bir qarışıqlıq lazımdır. Nə tapacağını səbirsizliklə gözləyirəm.",
  },
  {
    id: "ren-ito",
    name: "Ren Ito",
    initials: "RI",
    role: "Sənaye dizayneri",
    focus: "Gündəlik rituallar",
    bio: "Diqqəti mükafatlandıran və istifadə olunduqca daha da yaxşılaşan sakit obyektlər hazırlayır.",
    city: "Kioto",
    status: "online",
    accent: "#a7d88b",
    glow: "rgba(167, 216, 139, 0.3)",
    mutuals: 6,
    tags: ["Obyektlər", "Sənətkarlıq"],
    openingMessage: "Danışdığımız kiçik emalatxananı tapdım. Hələ də hər parçanı əl ilə hazırlayırlar.",
    reply: "Onların işini bəyənəcəyini düşünürdüm. Səni onlarla tanış edərəm — iş proseslərini çox səxavətlə paylaşırlar.",
  },
];
