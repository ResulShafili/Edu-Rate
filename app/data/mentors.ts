export type Mentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  focus: string;
  bio: string;
  location: string;
  timezone: string;
  experience: string;
  responseTime: string;
  availability: string[];
  expertise: string[];
  outcome: string;
  accent: string;
  glow: string;
};

export const mentors: Mentor[] = [
  {
    id: "aygun-rzayeva",
    name: "Aygün Rzayeva",
    initials: "AR",
    role: "Məhsul strategiyası mentoru",
    focus: "Araşdırmadan aydın məhsul hekayəsinə",
    bio: "Aygün ilkin mərhələdə olan komandalara geniş araşdırmanı insanların asanlıqla anlaya, etibar edə və istifadə edə biləcəyi məqsədyönlü məhsula çevirməyə kömək edir.",
    location: "Berlin, Almaniya",
    timezone: "UTC+2",
    experience: "Məhsul sahəsində 12 il",
    responseTime: "Adətən 4 saat ərzində cavab verir",
    availability: ["Çərşənbə axşamı · 17:00–19:00", "Cümə axşamı · 16:00–18:00"],
    expertise: ["Məhsul strategiyası", "İstifadəçi araşdırması", "Hekayələndirmə", "Yol xəritəsi"],
    outcome: "“Aygün dağınıq tezisimi nəhayət inamla izah edə bildiyim aydın məhsul istiqamətinə çevirməyimə kömək etdi.”",
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.28)",
  },
  {
    id: "murad-selimli",
    name: "Murad Səlimli",
    initials: "MS",
    role: "Yaradıcı texnologiyalar mentoru",
    focus: "Ekrandan məkana keçən ideyalar",
    bio: "Murad kodu, səsi, qarşılıqlı əlaqəni və fiziki mühiti birləşdirən prototiplərə sakit və eksperimental yanaşma gətirir.",
    location: "Lissabon, Portuqaliya",
    timezone: "UTC+1",
    experience: "İnteraktiv təcrübələrin hazırlanmasında 10 il",
    responseTime: "Adətən bir gün ərzində cavab verir",
    availability: ["Çərşənbə · 18:00–20:00", "Şənbə · 10:00–12:00"],
    expertise: ["Yaradıcı proqramlaşdırma", "Məkan interfeysləri", "Prototipləşdirmə", "Qarşılıqlı əlaqə dizaynı"],
    outcome: "“Murad ilə bir düşünülmüş görüş prototipimizdə həftələrdir tapa bilmədiyimiz qarşılıqlı əlaqəni üzə çıxardı.”",
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.28)",
  },
  {
    id: "pervin-necefova",
    name: "Dr. Pərvin Nəcəfova",
    initials: "PN",
    role: "Məsuliyyətli süni intellekt mentoru",
    focus: "İnsana təsiri nəzərə alan dəqiq araşdırma",
    bio: "Pərvin ağıllı sistemləri real həyatda daha anlaşılan, ədalətli və faydalı etmək istəyən tədqiqatçı və yaradıcıları dəstəkləyir.",
    location: "London, Birləşmiş Krallıq",
    timezone: "UTC+1",
    experience: "Süni intellekt araşdırmalarında 14 il",
    responseTime: "Adətən 8 saat ərzində cavab verir",
    availability: ["Bazar ertəsi · 17:30–19:30", "Cümə · 15:00–17:00"],
    expertise: ["Məsuliyyətli süni intellekt", "Araşdırma dizaynı", "Model qiymətləndirilməsi", "Etika"],
    outcome: "“Pərvin ideyanın gücünü azaltmadan fərziyyələrimi sorğuladı və qürurla müdafiə edə biləcəyim araşdırma hazırlamağıma kömək etdi.”",
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.3)",
  },
  {
    id: "kenan-memmedov",
    name: "Kənan Məmmədov",
    initials: "KM",
    role: "Sistem dizaynı mentoru",
    focus: "Mürəkkəbliyi anlaşılan etmək",
    bio: "Kənan sosial təsir yaradan komandalara problemin altındakı əlaqələri görməyə və hərəkətə təkan verəcək ən kiçik müdaxiləni tapmağa kömək edir.",
    location: "Akra, Qana",
    timezone: "UTC",
    experience: "Sistem yanaşmaları sahəsində 11 il",
    responseTime: "Adətən 6 saat ərzində cavab verir",
    availability: ["Çərşənbə axşamı · 14:00–16:00", "Cümə · 13:00–15:00"],
    expertise: ["Sistem xəritələndirməsi", "Fasilitasiya", "Sosial innovasiya", "Xidmət ekosistemləri"],
    outcome: "“Kənan komandamıza problem haqqında ortaq dil və elə ertəsi səhər ata biləcəyimiz praktik ilk addım verdi.”",
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.28)",
  },
  {
    id: "yegane-tahirova",
    name: "Yeganə Tahirova",
    initials: "YT",
    role: "Xidmət dizaynı mentoru",
    focus: "Başdan sona düşünülmüş istifadəçi yolu",
    bio: "Yeganə dizaynerlərə xidmətləri ardıcıl, qayğıkeş və yenidən istifadə etmək üçün həqiqətən rahat edən görünməz detalları anlamaqda bələdçilik edir.",
    location: "Tokio, Yaponiya",
    timezone: "UTC+9",
    experience: "Xidmət dizaynında 13 il",
    responseTime: "Adətən 12 saat ərzində cavab verir",
    availability: ["Çərşənbə · 19:00–21:00", "Bazar · 09:00–11:00"],
    expertise: ["Xidmət dizaynı", "İstifadəçi yolu xəritəsi", "Dizayn təhlili", "Təcrübə strategiyası"],
    outcome: "“Yeganə başqalarının gözdən qaçırdığı üç kiçik məqamı gördü; onları düzəltmək bütün təcrübəni dəyişdi.”",
    accent: "#77b8ff",
    glow: "rgba(119, 184, 255, 0.3)",
  },
  {
    id: "sevinc-melikova",
    name: "Sevinc Məlikova",
    initials: "SM",
    role: "Yaradıcı karyera mentoru",
    focus: "Hələ də sənə aid hiss olunan karyera",
    bio: "Sevinc müstəqil yaradıcı mütəxəssislərə dəyərlərini aydın ifadə etməyə, imkanları məqsədli seçməyə və iddialı işlərini davamlı ritmlə qurmağa kömək edir.",
    location: "Buenos-Ayres, Argentina",
    timezone: "UTC−3",
    experience: "Yaradıcı mütəxəssislərlə kouçinq sahəsində 9 il",
    responseTime: "Adətən bir gün ərzində cavab verir",
    availability: ["Cümə axşamı · 18:00–20:00", "Şənbə · 11:00–13:00"],
    expertise: ["Karyera aydınlığı", "Portfolio hekayələri", "Yaradıcı biznes", "Davamlı iş yanaşması"],
    outcome: "“Sevinc mənə layihələri sadalamağı dayandırıb çevrildiyim peşəkarın hekayəsini danışmağa başlamaqda kömək etdi.”",
    accent: "#f7d56f",
    glow: "rgba(247, 213, 111, 0.28)",
  },
];
