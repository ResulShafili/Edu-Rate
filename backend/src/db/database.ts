import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { env } from "../config/env.js";

export type UserRole = "student" | "mentor" | "teacher" | "admin";
export type UserStatus = "Aktiv" | "Gözləmədə" | "Məhdudlaşdırılıb";

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
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRecord {
  name: string;
  email: string;
  passwordHash: string;
  university: string;
  faculty: string;
  role?: UserRole;
  status?: UserStatus;
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
    status: (row.status ?? "Aktiv") as UserStatus,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
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
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      status VARCHAR(32) NOT NULL DEFAULT 'Aktiv',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

    ALTER TABLE users ADD COLUMN IF NOT EXISTS program VARCHAR(180) NOT NULL DEFAULT 'İxtisas məlumatı əlavə edilməyib';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(80) NOT NULL DEFAULT 'Kurs məlumatı əlavə edilməyib';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(120) NOT NULL DEFAULT 'Xankəndi';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS about VARCHAR(600) NOT NULL DEFAULT 'EduRate icmasına xoş gəlmisən.';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'Aktiv';
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'mentor', 'teacher', 'admin'));
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
    ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('Aktiv', 'Gözləmədə', 'Məhdudlaşdırılıb'));
  `);

  if (env.ADMIN_EMAILS.length > 0) {
    await databasePool.query(
      "UPDATE users SET role = 'admin', status = 'Aktiv', updated_at = NOW() WHERE email = ANY($1::text[])",
      [env.ADMIN_EMAILS],
    );
  }
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
  const normalizedEmail = input.email.trim().toLowerCase();
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: input.passwordHash,
    university: input.university.trim(),
    faculty: input.faculty.trim(),
    program: "İxtisas məlumatı əlavə edilməyib",
    year: "Kurs məlumatı əlavə edilməyib",
    city: "Xankəndi",
    about: "EduRate icmasında universitet həyatını daha əlaqəli yaşamaq üçün buradayam.",
    role: input.role ?? (env.ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "student"),
    status: input.status ?? "Aktiv",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!databasePool) {
    memoryUsers.set(user.email, user);
    return user;
  }

  const result = await databasePool.query(
    `INSERT INTO users (id, name, email, password_hash, university, faculty, role, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.university,
      user.faculty,
      user.role,
      user.status,
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

export async function adminUpdateUser(
  id: string,
  input: Partial<Pick<UserRecord, "name" | "email" | "role" | "university" | "faculty" | "status">>,
): Promise<UserRecord | null> {
  if (!databasePool) {
    const current = [...memoryUsers.values()].find((user) => user.id === id);
    if (!current) return null;
    const previousEmail = current.email;
    const next: UserRecord = {
      ...current,
      ...input,
      name: input.name?.trim() ?? current.name,
      email: input.email?.trim().toLowerCase() ?? current.email,
      university: input.university?.trim() ?? current.university,
      faculty: input.faculty?.trim() ?? current.faculty,
      updatedAt: new Date().toISOString(),
    };
    memoryUsers.delete(previousEmail);
    memoryUsers.set(next.email, next);
    return next;
  }

  const result = await databasePool.query(
    `UPDATE users SET
       name = COALESCE($2, name), email = COALESCE($3, email),
       role = COALESCE($4, role), university = COALESCE($5, university),
       faculty = COALESCE($6, faculty), status = COALESCE($7, status), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, input.name?.trim(), input.email?.trim().toLowerCase(), input.role, input.university?.trim(), input.faculty?.trim(), input.status],
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (!databasePool) {
    const user = [...memoryUsers.values()].find((entry) => entry.id === id);
    return user ? memoryUsers.delete(user.email) : false;
  }
  const result = await databasePool.query("DELETE FROM users WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
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
