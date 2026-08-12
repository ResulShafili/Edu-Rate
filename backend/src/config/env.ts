import "dotenv/config";
import { z } from "zod";

const booleanValue = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().url().optional().or(z.literal("")),
    JWT_SECRET: z.string().min(16).default("edurate-local-development-secret"),
    JWT_EXPIRES_IN: z.string().default("8h"),
    FRONTEND_URL: z
      .string()
      .default("http://localhost:3000,https://edu-rate-nu.vercel.app"),
    TRUST_PROXY: booleanValue,
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production" && value.JWT_SECRET.length < 32) {
      context.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message: "Production JWT_SECRET ən az 32 simvol olmalıdır.",
      });
    }

    if (value.NODE_ENV === "production" && !value.DATABASE_URL) {
      context.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "Production mühitində DATABASE_URL tələb olunur.",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment dəyişənləri yanlışdır:", z.treeifyError(parsed.error));
  throw new Error("Server konfiqurasiyası yanlışdır.");
}

export const env = {
  ...parsed.data,
  DATABASE_URL: parsed.data.DATABASE_URL || undefined,
  ALLOWED_ORIGINS: parsed.data.FRONTEND_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
