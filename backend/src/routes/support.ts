import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { createSupportTicket } from "../db/platform.js";

export const supportRouter = Router();

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 4,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Çox sayda dəstək sorğusu göndərilib." } },
});

const ticketSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  topic: z.string().trim().min(2).max(120),
  message: z.string().trim().min(20).max(2000),
});

supportRouter.post("/tickets", limiter, async (request, response) => {
  const ticket = await createSupportTicket(ticketSchema.parse(request.body), null);
  response.status(201).json({ data: { reference: ticket.reference, status: ticket.status } });
});
