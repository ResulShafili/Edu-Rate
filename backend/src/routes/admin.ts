import { Router } from "express";
import { listUsers } from "../db/database.js";
import { toPublicUser } from "../lib/auth.js";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get("/users", async (_request, response) => {
  const users = await listUsers();
  response.json({ data: { items: users.map(toPublicUser), total: users.length } });
});
