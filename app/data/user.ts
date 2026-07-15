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
  "Bakı Dövlət Universiteti",
  "Azərbaycan Dövlət İqtisad Universiteti",
  "Azərbaycan Texniki Universiteti",
  "Bakı Mühəndislik Universiteti",
  "ADA Universiteti",
] as const;

export const faculties = [
  "Tətbiqi riyaziyyat və kibernetika",
  "İnformasiya texnologiyaları",
  "İqtisadiyyat və idarəetmə",
  "Humanitar və sosial elmlər",
  "Memarlıq və dizayn",
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
