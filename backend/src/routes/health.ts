import { Router } from "express";
import { databaseMode, databasePool } from "../db/database.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  let databaseHealthy = true;
  if (databasePool) {
    try { await databasePool.query("SELECT 1"); } catch { databaseHealthy = false; }
  }
  if (!databaseHealthy) {
    response.status(503).json({ error: { code:"DATABASE_UNAVAILABLE", message:"Məlumat bazası ilə əlaqə yoxdur." } });
    return;
  }
  response.json({
    data: {
      status: "ok",
      service: "EduRate API",
      version: "1.0.0",
      database: databaseMode(),
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    },
  });
});
