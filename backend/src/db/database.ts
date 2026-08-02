import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { env } from "../config/env.js";

export type UserRole = "student" | "admin";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  university: string;
  faculty: string;
  program: string;
  year: string;
  city: string;
  about: string;
  role: UserRole;
  createdAt: string;
}

interface CreateUserRecord {
  name: string;
  email: string;
  passwordHash: string;
  university: string;
  faculty: string;
  role?: UserRole;
}

export interface UpdateUserRecord {
  name: string;
  university: string;
  faculty: string;
  program: string;
  year: string;
  about: string;
}

export const databasePool = env.DATABASE_URL
  ? new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : null;

const memoryUsers = new Map<string, UserRecord>();

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    university: String(row.university),
    faculty: String(row.faculty),
    program: String(row.program ?? "İxtisas məlumatı əlavə edilməyib"),
    year: String(row.year ?? "Kurs məlumatı əlavə edilməyib"),
    city: String(row.city ?? "Xankəndi"),
    about: String(row.about ?? "EduRate icmasına xoş gəlmisən."),
    role: row.role as UserRole,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function initializeDatabase() {
  if (!databasePool) {
    console.warn("DATABASE_URL yoxdur; lokal yaddaş rejimi aktivdir.");
    return;
  }

  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      university VARCHAR(180) NOT NULL,
      faculty VARCHAR(180) NOT NULL,
      program VARCHAR(180) NOT NULL DEFAULT 'İxtisas məlumatı əlavə edilməyib',
      year VARCHAR(80) NOT NULL DEFAULT 'Kurs məlumatı əlavə edilməyib',
      city VARCHAR(120) NOT NULL DEFAULT 'Xankəndi',
      about VARCHAR(600) NOT NULL DEFAULT 'EduRate icmasına xoş gəlmisən.',
      role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

    ALTER TABLE users ADD COLUMN IF NOT EXISTS program VARCHAR(180) NOT NULL DEFAULT 'İxtisas məlumatı əlavə edilməyib';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(80) NOT NULL DEFAULT 'Kurs məlumatı əlavə edilməyib';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(120) NOT NULL DEFAULT 'Xankəndi';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS about VARCHAR(600) NOT NULL DEFAULT 'EduRate icmasına xoş gəlmisən.';
  `);
}

export async function closeDatabase() {
  await databasePool?.end();
}

export function databaseMode() {
  return databasePool ? "postgresql" : "memory";
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!databasePool) {
    return memoryUsers.get(normalizedEmail) ?? null;
  }

  const result = await databasePool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [
    normalizedEmail,
  ]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (!databasePool) {
    return [...memoryUsers.values()].find((user) => user.id === id) ?? null;
  }

  const result = await databasePool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function createUser(input: CreateUserRecord): Promise<UserRecord> {
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    university: input.university.trim(),
    faculty: input.faculty.trim(),
    program: "İxtisas məlumatı əlavə edilməyib",
    year: "Kurs məlumatı əlavə edilməyib",
    city: "Xankəndi",
    about: "EduRate icmasında universitet həyatını daha əlaqəli yaşamaq üçün buradayam.",
    role: input.role ?? "student",
    createdAt: new Date().toISOString(),
  };

  if (!databasePool) {
    memoryUsers.set(user.email, user);
    return user;
  }

  const result = await databasePool.query(
    `INSERT INTO users (id, name, email, password_hash, university, faculty, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.university,
      user.faculty,
      user.role,
    ],
  );

  return mapUser(result.rows[0]);
}

export async function listUsers(limit = 50): Promise<UserRecord[]> {
  if (!databasePool) {
    return [...memoryUsers.values()].slice(0, limit);
  }

  const result = await databasePool.query("SELECT * FROM users ORDER BY created_at DESC LIMIT $1", [
    limit,
  ]);
  return result.rows.map(mapUser);
}

export async function updateUserProfile(
  id: string,
  input: UpdateUserRecord,
): Promise<UserRecord | null> {
  if (!databasePool) {
    const current = [...memoryUsers.values()].find((user) => user.id === id);
    if (!current) return null;
    const next = {
      ...current,
      name: input.name.trim(),
      university: input.university.trim(),
      faculty: input.faculty.trim(),
      program: input.program.trim(),
      year: input.year.trim(),
      about: input.about.trim(),
    };
    memoryUsers.set(next.email, next);
    return next;
  }

  const result = await databasePool.query(
    `UPDATE users
     SET name = $2, university = $3, faculty = $4, program = $5, year = $6,
         about = $7, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.name.trim(),
      input.university.trim(),
      input.faculty.trim(),
      input.program.trim(),
      input.year.trim(),
      input.about.trim(),
    ],
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}
