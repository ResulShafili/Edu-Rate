import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDatabase, initializeDatabase } from "./db/database.js";
import { initializeBusinessDatabase } from "./db/business.js";
import { initializePlatformDatabase } from "./db/platform.js";

await initializeDatabase();
await initializeBusinessDatabase();
await initializePlatformDatabase();

const server = createServer(createApp());

server.listen(env.PORT, "0.0.0.0", () => {
  console.log(`EduRate API http://0.0.0.0:${env.PORT} ünvanında işləyir.`);
  console.log(`Swagger: http://localhost:${env.PORT}/api-docs`);
});

async function shutdown(signal: string) {
  console.log(`${signal} alındı; server dayandırılır.`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
