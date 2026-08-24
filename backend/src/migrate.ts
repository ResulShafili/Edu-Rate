import { closeDatabase } from "./db/database.js";
import { runMigrations } from "./db/migrations.js";

try {
  await runMigrations();
  console.log("EduRate database migration-ları tamamlandı.");
} finally {
  await closeDatabase();
}
