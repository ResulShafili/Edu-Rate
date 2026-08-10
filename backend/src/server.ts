import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDatabase, initializeDatabase } from "./db/database.js";
import { initializeBusinessDatabase } from "./db/business.js";
import { initializePlatformDatabase } from "./db/platform.js";
import { initializeNetworkDatabase } from "./db/network.js";
import { runMigrations } from "./db/migrations.js";
import { seedProfessionalProfiles } from "./db/professionals.js";
import { attachRealtime, closeRealtime } from "./realtime.js";

await initializeDatabase();
await initializeBusinessDatabase();
await initializePlatformDatabase();
await initializeNetworkDatabase();
await runMigrations();
await seedProfessionalProfiles();

const server = createServer(createApp());
attachRealtime(server);
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.maxRequestsPerSocket = 1_000;
server.on("clientError", (_error, socket) => {
  if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
});

server.listen(env.PORT, "0.0.0.0", () => {
  console.log(`EduRate API http://0.0.0.0:${env.PORT} ünvanında işləyir.`);
  console.log(`Swagger: http://localhost:${env.PORT}/api-docs`);
});

async function shutdown(signal: string) {
  console.log(`${signal} alındı; server dayandırılır.`);
  server.close(async () => {
    await closeRealtime();
    await closeDatabase();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
