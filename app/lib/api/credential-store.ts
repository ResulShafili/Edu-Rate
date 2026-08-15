import {
  createIdentityProfile,
  getInitials,
  type ProfileUpdateInput,
  type RegisterInput,
  type SignInInput,
  type UserProfile,
} from "../../data/user";
import { canonicalUniversity, isValidFacultyProgram } from "../../data/academic-programs";
import { ApiHttpError } from "./http";

type StoredCredential = {
  profile: UserProfile;
  passwordHash: string;
  salt: string;
};

const users = new Map<string, StoredCredential>();
const encoder = new TextEncoder();
const minimumPasswordLength = 8;
const maximumPasswordLength = 128;

export async function registerCredential(input: RegisterInput): Promise<UserProfile> {
  const values = validateRegistration(input);
  const email = values.email.toLocaleLowerCase("az");
  if (users.has(email)) {
    throw new ApiHttpError(409, "EMAIL_ALREADY_EXISTS", "Bu e-poçt ünvanı ilə hesab artıq mövcuddur.");
  }

  const profile = createProfile({ ...values, email });
  const salt = createSalt();
  const passwordHash = await hashPassword(values.password, salt);
  users.set(email, { profile, salt, passwordHash });
  return profile;
}

export async function signInCredential(input: SignInInput): Promise<UserProfile> {
  const email = normalizeEmail(input.email);
  if (!email || !isPassword(input.password)) {
    throw new ApiHttpError(422, "INVALID_CREDENTIALS", "E-poçt və şifrə məlumatlarını yoxla.");
  }

  const record = users.get(email);
  if (!record) {
    throw new ApiHttpError(401, "INVALID_CREDENTIALS", "E-poçt və ya şifrə düzgün deyil.");
  }

  const receivedHash = await hashPassword(input.password, record.salt);
  if (!safeEqual(record.passwordHash, receivedHash)) {
    throw new ApiHttpError(401, "INVALID_CREDENTIALS", "E-poçt və ya şifrə düzgün deyil.");
  }

  return record.profile;
}

export async function updateCredentialProfile(
  current: UserProfile,
  input: ProfileUpdateInput,
): Promise<UserProfile> {
  const values = validateProfileUpdate(input);
  const next: UserProfile = {
    ...current,
    ...values,
    initials: getInitials(values.name),
    completion: calculateCompletion({ ...current, ...values }),
  };
  const existing = users.get(current.email.toLocaleLowerCase("az"));
  if (existing) {
    users.set(current.email.toLocaleLowerCase("az"), { ...existing, profile: next });
  }
  return next;
}

function createProfile(input: RegisterInput): UserProfile {
  const base = createIdentityProfile(input.name, input.email);
  const role = input.accountType === "teacher" ? "Müəllim" : "Tələbə";
  return {
    ...base,
    name: input.name.trim(),
    initials: getInitials(input.name),
    role,
    accessRole: input.accountType,
    university: input.university.trim(),
    faculty: input.faculty.trim(),
    program: input.program.trim(),
    year: "Kursunu profil bölməsindən əlavə et",
    city: "Xankəndi",
    about: "EduRate icmasında universitet həyatını daha planlı və əlaqəli yaşamaq üçün buradayam.",
    interests: ["Universitet həyatı", "İnkişaf"],
    completion: 62,
  };
}

function validateRegistration(input: RegisterInput): RegisterInput {
  const errors: Record<string, string> = {};
  const name = input.name?.trim() ?? "";
  const email = normalizeEmail(input.email);
  const password = input.password ?? "";
  const university = input.university?.trim() ?? "";
  const faculty = input.faculty?.trim() ?? "";
  const program = input.program?.trim() ?? "";
  const accountType = input.accountType ?? "student";

  if (name.length < 2 || name.length > 100) errors.name = "Ad və soyad 2–100 simvol olmalıdır.";
  if (!email) errors.email = "Etibarlı e-poçt ünvanı yaz.";
  if (!isPassword(password)) errors.password = `Şifrə ${minimumPasswordLength}–${maximumPasswordLength} simvol olmalıdır.`;
  if (university !== canonicalUniversity) errors.university = "Qarabağ Universitetini seç.";
  if (accountType === "student" && !isValidFacultyProgram(faculty, program)) {
    errors.program = "Fakültə və ixtisası uyğun siyahıdan seç.";
  }
  if (accountType !== "student" && program.length < 2) errors.program = "Tədris və ya ekspertiza sahəsini yaz.";
  if (Object.keys(errors).length > 0) {
    throw new ApiHttpError(422, "VALIDATION_ERROR", "Məlumatları yenidən yoxla.", errors);
  }

  return { name, email: email ?? "", password, university, faculty, program, accountType, legalAccepted: true };
}

function validateProfileUpdate(input: ProfileUpdateInput): ProfileUpdateInput {
  const errors: Record<string, string> = {};
  const name = input.name?.trim() ?? "";
  const university = input.university?.trim() ?? "";
  const faculty = input.faculty?.trim() ?? "";
  const program = input.program?.trim() ?? "";
  const year = input.year?.trim() ?? "";
  const about = input.about?.trim() ?? "";

  if (name.length < 2 || name.length > 100) errors.name = "Ad və soyad 2–100 simvol olmalıdır.";
  if (university !== canonicalUniversity) errors.university = "Qarabağ Universitetini seç.";
  if (!isValidFacultyProgram(faculty, program)) {
    errors.program = "Fakültə və ixtisası uyğun siyahıdan seç.";
  }
  if (!year || year.length > 80) errors.year = "Kurs məlumatını yaz.";
  if (about.length > 600) errors.about = "Haqqında mətni 600 simvoldan uzun ola bilməz.";
  if (Object.keys(errors).length > 0) {
    throw new ApiHttpError(422, "VALIDATION_ERROR", "Profil məlumatlarını yenidən yoxla.", errors);
  }

  return { name, university, faculty, program, year, about };
}

function normalizeEmail(value: string | undefined): string | null {
  const email = value?.trim().toLocaleLowerCase("az") ?? "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function isPassword(value: string | undefined): value is string {
  return Boolean(value && value.length >= minimumPasswordLength && value.length <= maximumPasswordLength);
}

function createSalt(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 120_000 },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function calculateCompletion(profile: UserProfile): number {
  const fields = [profile.name, profile.university, profile.faculty, profile.program, profile.year, profile.about];
  return Math.round((fields.filter((value) => value.trim().length > 0).length / fields.length) * 100);
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}
