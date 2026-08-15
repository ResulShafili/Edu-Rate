import { Router } from "express";
import { databaseMode, databasePool } from "../db/database.js";
import { latestMigrationVersion } from "../db/migrations.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  let databaseHealthy = true;
  let migrationVersion: number | null = null;
  if (databasePool) {
    try {
      await databasePool.query("SELECT 1");
      const migration = await databasePool.query("SELECT COALESCE(MAX(version),0)::int AS version FROM schema_migrations");
      migrationVersion = Number(migration.rows[0]?.version ?? 0);
      databaseHealthy = migrationVersion >= latestMigrationVersion;
    } catch { databaseHealthy = false; }
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
      migrationVersion,
      latestMigrationVersion,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    },
  });
});
