import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  closeListing,
  createListing,
  listListings,
  LISTING_CATEGORIES,
  LISTING_KINDS,
} from "../db/marketplace.js";
import { findUserById } from "../db/database.js";
import { ApiError } from "../lib/api-error.js";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate.js";

export const marketplaceRouter = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Qısa müddətdə çox sayda elan yerləşdirildi." } },
});

const MODERATORS = ["admin", "owner_admin", "assistant_admin"];

marketplaceRouter.get("/", optionalAuthenticate, async (request, response) => {
  const { category } = z.object({ category: z.enum(LISTING_CATEGORIES).optional() }).parse(request.query);
  response.json({ data: await listListings(request.auth?.userId ?? null, category) });
});

marketplaceRouter.post("/", authenticate, writeLimiter, async (request, response) => {
  const input = z.object({
    title: z.string().trim().min(4).max(140),
    details: z.string().trim().max(1000).default(""),
    kind: z.enum(LISTING_KINDS).default("satiram"),
    category: z.enum(LISTING_CATEGORIES).default("kitab"),
    price: z.string().trim().max(40).default(""),
  }).strict().parse(request.body);
  const user = await findUserById(request.auth!.userId);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  response.status(201).json({ data: await createListing(user.id, user.name, input) });
});

marketplaceRouter.delete("/:id", authenticate, async (request, response) => {
  const id = z.string().uuid().parse(request.params.id);
  const isModerator = MODERATORS.includes(request.auth!.role);
  if (!(await closeListing(id, request.auth!.userId, isModerator))) {
    throw new ApiError(404, "LISTING_NOT_FOUND", "Bağlana bilən elan tapılmadı.");
  }
  response.status(204).send();
});
