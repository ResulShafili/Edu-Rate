import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
} from "../db/database.js";
import { ApiError } from "../lib/api-error.js";
import {
  createAccessToken,
  hashPassword,
  toPublicUser,
  verifyPassword,
} from "../lib/auth.js";
import { authenticate } from "../middleware/authenticate.js";

export const authRouter = Router();

const signupLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Çox sayda qeydiyyat cəhdi edildi." } },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Çox sayda giriş cəhdi edildi." } },
});

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Şifrə ən az 8 simvol olmalıdır.")
    .max(72)
    .regex(/[a-zA-ZƏəÖöÜüĞğŞşÇçİı]/, "Şifrədə hərf olmalıdır.")
    .regex(/\d/, "Şifrədə rəqəm olmalıdır."),
  university: z.string().trim().min(2).max(180).default("Qarabağ Universiteti"),
  faculty: z.string().trim().min(2).max(180),
});

const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  university: z.string().trim().min(2).max(180),
  faculty: z.string().trim().min(2).max(180),
  program: z.string().trim().min(2).max(180),
  year: z.string().trim().min(1).max(80),
  about: z.string().trim().max(600),
});

authRouter.post("/signup", signupLimiter, async (request, response) => {
  const input = signupSchema.parse(request.body);
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new ApiError(409, "EMAIL_EXISTS", "Bu e-poçt artıq istifadə olunur.");
  }

  const user = await createUser({ ...input, passwordHash: await hashPassword(input.password) });
  const token = createAccessToken(user);
  response.status(201).json({ data: { token, user: toPublicUser(user) } });
});

authRouter.post("/login", loginLimiter, async (request, response) => {
  const input = loginSchema.parse(request.body);
  const user = await findUserByEmail(input.email);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "E-poçt və ya şifrə düzgün deyil.");
  }

  response.json({ data: { token: createAccessToken(user), user: toPublicUser(user) } });
});

authRouter.get("/session", authenticate, async (request, response) => {
  const user = await findUserById(request.auth!.userId);

  if (!user) {
    throw new ApiError(401, "SESSION_USER_NOT_FOUND", "Sessiya istifadəçisi tapılmadı.");
  }

  response.json({ data: { user: toPublicUser(user) } });
});

authRouter.patch("/profile", authenticate, async (request, response) => {
  const input = profileSchema.parse(request.body);
  const user = await updateUserProfile(request.auth!.userId, input);

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  }

  response.json({ data: { user: toPublicUser(user) } });
});

authRouter.post("/logout", (_request, response) => {
  response.status(204).send();
});
