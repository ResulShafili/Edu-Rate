import { Router } from "express";
import { z } from "zod";
import { listAnnouncements, listFeed } from "../db/network.js";

export const networkRouter = Router();
const querySchema = z.object({
  category: z.enum(["official", "faculties", "clubs", "scholarship", "events"]).optional(),
});

networkRouter.get("/announcements", async (request, response) => {
  const { category } = querySchema.parse(request.query);
  response.json({ data: await listAnnouncements(category) });
});

networkRouter.get("/feed", async (request, response) => {
  const { category } = querySchema.parse(request.query);
  response.json({ data: await listFeed(category) });
});
