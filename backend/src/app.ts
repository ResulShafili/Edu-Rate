import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { openApiDocument } from "./openapi.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { healthRouter } from "./routes/health.js";

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY) app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error("Bu origin üçün CORS icazəsi yoxdur."));
      },
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      credentials: true,
      maxAge: 86_400,
    }),
  );
  app.use(express.json({ limit: "256kb" }));
  app.use((request, response, next) => {
    const requestId = request.header("x-request-id") || randomUUID();
    response.locals.requestId = requestId;
    response.setHeader("X-Request-Id", requestId);
    next();
  });

  app.get("/", (_request, response) => {
    response.json({
      data: {
        service: "EduRate API",
        status: "ready",
        documentation: "/api-docs",
      },
    });
  });
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api", catalogRouter);
  app.use("/api/admin", adminRouter);
  app.get("/api/openapi.json", (_request, response) => response.json(openApiDocument));
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "EduRate API sənədləri",
      swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
    }),
  );

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
