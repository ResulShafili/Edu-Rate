export type Teacher = {
  id: string;
  name: string;
  initials: string;
  role: string;
  subject: string;
  bio: string;
  city: string;
  experience: string;
  availability: string;
  teachingMode: "Onlayn" | "Əyani" | "Hibrid";
  language: "Azərbaycan dili" | "İngilis dili";
  studentsCount: number;
  rating: number;
  reviewCount: number;
  accent: string;
  glow: string;
};

export type TeacherReview = {
  id: string;
  teacherId: Teacher["id"];
  teacherName: string;
  author: string;
  initials: string;
  rating: number;
  text?: string;
  date: string;
  course: string;
  accent: string;
  featured?: boolean;
  criteria?: {
    clarity: number;
    subjectKnowledge: number;
    objectivity: number;
    communication: number;
  };
};

export const teachers: Teacher[] = [
  {
    id: "leyla-memmedova",
    name: "Leyla Məmmədova",
    initials: "LM",
    role: "Riyaziyyat müəllimi",
    subject: "Riyaziyyat",
    bio: "Mürəkkəb mövzuları gündəlik nümunələrlə sadələşdirir, şagirdə düsturu əzbərlətmək əvəzinə onun məntiqini anlamağa kömək edir.",
    city: "Bakı",
    experience: "11 il təcrübə",
    availability: "Bu gün · 18:30-dan sonra",
    teachingMode: "Hibrid",
    language: "Azərbaycan dili",
    studentsCount: 286,
    rating: 4.9,
    reviewCount: 94,
    accent: "#c8ff4d",
    glow: "rgba(200, 255, 77, 0.28)",
  },
  {
    id: "murad-eliyev",
    name: "Murad Əliyev",
    initials: "MƏ",
    role: "Proqramlaşdırma müəllimi",
    subject: "Proqramlaşdırma",
    bio: "Kodlaşdırmanı real layihələr üzərindən öyrədir və hər tələbənin öz sürətinə uyğun aydın, mərhələli inkişaf planı qurur.",
    city: "Gəncə",
    experience: "8 il təcrübə",
    availability: "Sabah · 10:00–14:00",
    teachingMode: "Onlayn",
    language: "Azərbaycan dili",
    studentsCount: 214,
    rating: 4.8,
    reviewCount: 76,
    accent: "#77b8ff",
    glow: "rgba(119, 184, 255, 0.3)",
  },
  {
    id: "nigar-huseynli",
    name: "Nigar Hüseynli",
    initials: "NH",
    role: "İngilis dili müəllimi",
    subject: "İngilis dili",
    bio: "Danışıq qorxusunu aradan qaldıran rahat dərs mühiti yaradır, gündəlik ünsiyyət və imtahan hazırlığını balanslı şəkildə birləşdirir.",
    city: "Sumqayıt",
    experience: "9 il təcrübə",
    availability: "Bu həftə · 3 boş vaxt aralığı",
    teachingMode: "Hibrid",
    language: "İngilis dili",
    studentsCount: 341,
    rating: 5,
    reviewCount: 128,
    accent: "#b9a7ff",
    glow: "rgba(185, 167, 255, 0.3)",
  },
  {
    id: "tural-kerimov",
    name: "Tural Kərimov",
    initials: "TK",
    role: "Fizika müəllimi",
    subject: "Fizika",
    bio: "Fiziki hadisələri təcrübə, vizual izah və düzgün suallarla canlandırır; şagirdlərə nəticədən əvvəl düşüncə yolunu qurmağı öyrədir.",
    city: "Şəki",
    experience: "13 il təcrübə",
    availability: "Cümə · 16:00–20:00",
    teachingMode: "Əyani",
    language: "Azərbaycan dili",
    studentsCount: 198,
    rating: 4.9,
    reviewCount: 82,
    accent: "#ff9e7a",
    glow: "rgba(255, 158, 122, 0.28)",
  },
  {
    id: "aysel-rehimova",
    name: "Aysel Rəhimova",
    initials: "AR",
    role: "Biologiya müəllimi",
    subject: "Biologiya",
    bio: "Canlılar aləmini sxemlər və əlaqəli hekayələrlə izah edir, faktları əzbərləmədən mövzular arasında möhkəm bilik körpüsü yaradır.",
    city: "Lənkəran",
    experience: "10 il təcrübə",
    availability: "Şənbə · 11:00–15:00",
    teachingMode: "Onlayn",
    language: "Azərbaycan dili",
    studentsCount: 173,
    rating: 4.8,
    reviewCount: 67,
    accent: "#7de5d1",
    glow: "rgba(125, 229, 209, 0.28)",
  },
  {
    id: "emin-seferli",
    name: "Emin Səfərli",
    initials: "ES",
    role: "Qrafik dizayn müəllimi",
    subject: "Qrafik dizayn",
    bio: "Dizayn alətlərini yaradıcı düşüncə ilə birlikdə öyrədir, portfel işlərinə diqqətli rəy verərək ideyanı təsirli vizual dilə çevirməyə yönəldir.",
    city: "Naxçıvan",
    experience: "7 il təcrübə",
    availability: "Bazar · 12:00–17:00",
    teachingMode: "Hibrid",
    language: "Azərbaycan dili",
    studentsCount: 149,
    rating: 4.7,
    reviewCount: 51,
    accent: "#f7d56f",
    glow: "rgba(247, 213, 111, 0.28)",
  },
];

export const teacherReviews: TeacherReview[] = [
  {
    id: "review-leyla-1",
    teacherId: "leyla-memmedova",
    teacherName: "Leyla Məmmədova",
    author: "Aynur Qasımova",
    initials: "AQ",
    rating: 5,
    text: "Leyla müəllim ilk dərsdən boşluqlarımı dəqiq müəyyənləşdirdi. İndi məsələni həll etməzdən əvvəl nəyi və niyə etdiyimi anlayıram; bu, imtahan nəticəmə də aydın şəkildə təsir etdi.",
    date: "12 iyul 2026",
    course: "Riyaziyyat · Buraxılış imtahanına hazırlıq",
    accent: "#c8ff4d",
    featured: true,
  },
  {
    id: "review-murad-1",
    teacherId: "murad-eliyev",
    teacherName: "Murad Əliyev",
    author: "Orxan Vəliyev",
    initials: "OV",
    rating: 5,
    text: "Heç kod yazmamışdım. Səkkiz həftə sonra öz kiçik veb tətbiqimi hazırladım. Murad müəllim hazır cavab vermir, düzgün sualla məni həllə aparır.",
    date: "9 iyul 2026",
    course: "Frontend əsasları",
    accent: "#77b8ff",
  },
  {
    id: "review-nigar-1",
    teacherId: "nigar-huseynli",
    teacherName: "Nigar Hüseynli",
    author: "Səbinə Məlikova",
    initials: "SM",
    rating: 5,
    text: "Danışarkən səhv etməkdən çəkinirdim. Nigar müəllimin sakit və dəstəkləyici yanaşması sayəsində artıq fikrimi sərbəst ifadə edirəm. Hər dərsin sonunda inkişafımı hiss edirəm.",
    date: "6 iyul 2026",
    course: "Danışıq ingiliscəsi · B2",
    accent: "#b9a7ff",
    featured: true,
  },
  {
    id: "review-tural-1",
    teacherId: "tural-kerimov",
    teacherName: "Tural Kərimov",
    author: "Kamran Abdullayev",
    initials: "KA",
    rating: 4,
    text: "Mövzuları sadəcə düsturla deyil, real hadisələrlə bağlayır. Xüsusilə mexanika bölməsində qurduğu vizual izahlar yadda qalır və məsələləri daha rahat həll etməyə kömək edir.",
    date: "2 iyul 2026",
    course: "Fizika · Abituriyent hazırlığı",
    accent: "#ff9e7a",
  },
  {
    id: "review-aysel-1",
    teacherId: "aysel-rehimova",
    teacherName: "Aysel Rəhimova",
    author: "Zəhra İsmayılzadə",
    initials: "Zİ",
    rating: 5,
    text: "Genetika mənə çox qarışıq görünürdü. Aysel müəllim mövzunu kiçik hissələrə ayırdı və aralarındakı əlaqəni göstərdi. Artıq testləri əzbərləməklə yox, anlayaraq cavablandırıram.",
    date: "28 iyun 2026",
    course: "Biologiya · Genetika",
    accent: "#7de5d1",
  },
  {
    id: "review-emin-1",
    teacherId: "emin-seferli",
    teacherName: "Emin Səfərli",
    author: "Rauf Cəfərov",
    initials: "RC",
    rating: 5,
    text: "Emin müəllimin rəyləri konkret və əsaslandırılmışdır. Portfelimdəki işləri sadəcə gözəlləşdirmədik, hər layihənin fikrini və təqdimat dilini də gücləndirdik.",
    date: "24 iyun 2026",
    course: "Portfel və vizual kimlik",
    accent: "#f7d56f",
    featured: true,
  },
  {
    id: "review-nigar-2",
    teacherId: "nigar-huseynli",
    teacherName: "Nigar Hüseynli",
    author: "Elvin Həsənov",
    initials: "EH",
    rating: 5,
    text: "IELTS hazırlığında zəif tərəflərim üçün ayrıca plan qurdu. Tapşırıqlar məqsədlidir, izahlar isə həmişə aydındır. Qısa müddətdə yazı balımı 6-dan 7-yə yüksəltdim.",
    date: "19 iyun 2026",
    course: "IELTS hazırlığı",
    accent: "#b9a7ff",
  },
  {
    id: "review-leyla-2",
    teacherId: "leyla-memmedova",
    teacherName: "Leyla Məmmədova",
    author: "Nərgiz Soltanlı",
    initials: "NS",
    rating: 5,
    text: "Hər səhvimi səbirli şəkildə təhlil edir və eyni səhvin təkrarlanmaması üçün düşüncə üsulu göstərir. Riyaziyyata münasibətim tamamilə dəyişib.",
    date: "15 iyun 2026",
    course: "Cəbr və həndəsə",
    accent: "#c8ff4d",
  },
];
