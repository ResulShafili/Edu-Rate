export type ProfileStat = {
  id: "events" | "connections" | "saved";
  label: string;
  value: number;
};

export type ProfileActivity = {
  id: string;
  category: string;
  title: string;
  description: string;
  date: string;
  dateTime: string;
};

export type UserProfile = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: "Tələbə";
  accessRole?: "student" | "mentor" | "teacher" | "admin" | "assistant_admin";
  university: string;
  faculty: string;
  program: string;
  year: string;
  city: string;
  about: string;
  interests: readonly string[];
  completion: number;
  stats: readonly ProfileStat[];
  activities: readonly ProfileActivity[];
};

export type SignInInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  university: string;
  faculty: string;
};

export type ProfileUpdateInput = Pick<
  UserProfile,
  "name" | "university" | "faculty" | "program" | "year" | "about"
>;

export type AuthGateway = {
  signIn: (input: SignInInput) => Promise<UserProfile>;
  register: (input: RegisterInput) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (
    profile: UserProfile,
    input: ProfileUpdateInput,
  ) => Promise<UserProfile>;
};

export const universities = [
  "Qarabağ Universiteti",
  "Bakı Dövlət Universiteti",
  "Azərbaycan Dövlət İqtisad Universiteti",
  "Azərbaycan Texniki Universiteti",
  "Bakı Mühəndislik Universiteti",
  "ADA Universiteti",
  "Azərbaycan Dövlət Neft və Sənaye Universiteti",
  "Azərbaycan Memarlıq və İnşaat Universiteti",
  "Azərbaycan Tibb Universiteti",
  "Azərbaycan Dövlət Pedaqoji Universiteti",
  "Azərbaycan Dillər Universiteti",
  "Bakı Slavyan Universiteti",
  "Xəzər Universiteti",
  "Qərbi Kaspi Universiteti",
  "Azərbaycan Universiteti",
  "Bakı Ali Neft Məktəbi",
  "Naxçıvan Dövlət Universiteti",
  "Gəncə Dövlət Universiteti",
  "Sumqayıt Dövlət Universiteti",
  "Lənkəran Dövlət Universiteti",
] as const;

export const faculties = [
  "Tətbiqi riyaziyyat və kibernetika",
  "İnformasiya texnologiyaları",
  "Kompüter elmləri və kompüter mühəndisliyi",
  "Mühəndislik",
  "Energetika və avtomatika",
  "Neft-qaz mühəndisliyi",
  "Kimya mühəndisliyi",
  "İnşaat mühəndisliyi",
  "İqtisadiyyat və idarəetmə",
  "Biznes və menecment",
  "Maliyyə və mühasibat",
  "Hüquq",
  "Humanitar və sosial elmlər",
  "Filologiya və dilçilik",
  "Tarix və coğrafiya",
  "Pedaqogika",
  "Təbiət elmləri",
  "Kimya və biologiya",
  "Tibb",
  "İctimai səhiyyə",
  "Memarlıq və dizayn",
  "İncəsənət",
  "Turizm və qonaqpərvərlik",
  "Kənd təsərrüfatı",
] as const;

const emptyProfileStats: readonly ProfileStat[] = [
  { id: "events", label: "Qoşulduğu tədbirlər", value: 0 },
  { id: "connections", label: "İcma əlaqələri", value: 0 },
  { id: "saved", label: "Yadda saxlananlar", value: 0 },
];

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("az") ?? "")
    .join("") || "ER";
}

export function createIdentityProfile(nameValue: string, emailValue: string): UserProfile {
  const name = nameValue.trim() || emailValue.trim();
  const email = emailValue.trim().toLocaleLowerCase("az");

  return {
    id: `student-${normalizeIdentifier(email)}`,
    name,
    initials: getInitials(name),
    email,
    role: "Tələbə",
    accessRole: "student",
    university: "Universitet məlumatı əlavə edilməyib",
    faculty: "Fakültə məlumatı əlavə edilməyib",
    program: "İxtisas məlumatı əlavə edilməyib",
    year: "Kurs məlumatı əlavə edilməyib",
    city: "Azərbaycan",
    about: "Profilini tamamlayaraq universitetini, maraqlarını və öyrənmə məqsədlərini icma ilə paylaş.",
    interests: [],
    completion: 36,
    stats: emptyProfileStats,
    activities: [],
  };
}

function normalizeIdentifier(email: string): string {
  const normalized = email
    .trim()
    .toLocaleLowerCase("az")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "new-member";
}
