import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRecord } from "../db/database.js";
import { ApiError } from "./api-error.js";

const issuer = "edurate-api";
const audience = "edurate-web";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  university: string;
  faculty: string;
  role: UserRecord["role"];
  createdAt: string;
}

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(user: UserRecord) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    issuer,
    audience,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { issuer, audience });

    if (typeof payload === "string" || !payload.sub) {
      throw new Error("Token payload yanlışdır.");
    }

    const role = payload.role;
    if (role !== "student" && role !== "admin") {
      throw new Error("Token rolu yanlışdır.");
    }

    return { userId: payload.sub, role };
  } catch {
    throw new ApiError(401, "INVALID_TOKEN", "Sessiya etibarlı deyil.");
  }
}
