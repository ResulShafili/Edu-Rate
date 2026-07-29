import { Router } from "express";
import { databaseMode } from "../db/database.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
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
