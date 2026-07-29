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

const pool = env.DATABASE_URL
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
    role: row.role as UserRole,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function initializeDatabase() {
  if (!pool) {
    console.warn("DATABASE_URL yoxdur; lokal yaddaş rejimi aktivdir.");
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      university VARCHAR(180) NOT NULL,
      faculty VARCHAR(180) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
  `);
}

export async function closeDatabase() {
  await pool?.end();
}

export function databaseMode() {
  return pool ? "postgresql" : "memory";
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!pool) {
    return memoryUsers.get(normalizedEmail) ?? null;
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [
    normalizedEmail,
  ]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (!pool) {
    return [...memoryUsers.values()].find((user) => user.id === id) ?? null;
  }

  const result = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
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
    role: input.role ?? "student",
    createdAt: new Date().toISOString(),
  };

  if (!pool) {
    memoryUsers.set(user.email, user);
    return user;
  }

  const result = await pool.query(
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
  if (!pool) {
    return [...memoryUsers.values()].slice(0, limit);
  }

  const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC LIMIT $1", [
    limit,
  ]);
  return result.rows.map(mapUser);
}
