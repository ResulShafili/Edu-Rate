import type { PoolClient } from "pg";
import { databasePool } from "./database.js";

type Migration = { version: number; name: string; sql: string };

const migrations: Migration[] = [
  {
    version: 1,
    name: "professional profiles and stable relations",
    sql: `
      CREATE TABLE IF NOT EXISTS professional_profiles (
        id UUID PRIMARY KEY,
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
        kind VARCHAR(16) NOT NULL CHECK (kind IN ('teacher', 'mentor')),
        slug VARCHAR(120) NOT NULL UNIQUE,
        display_name VARCHAR(120) NOT NULL,
        headline VARCHAR(180) NOT NULL,
        specialty VARCHAR(180) NOT NULL,
        biography VARCHAR(1200) NOT NULL DEFAULT '',
        city VARCHAR(120) NOT NULL DEFAULT 'Xankəndi',
        experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
        availability VARCHAR(240) NOT NULL DEFAULT '',
        meeting_mode VARCHAR(80) NOT NULL DEFAULT 'Onlayn',
        languages TEXT[] NOT NULL DEFAULT '{}',
        expertise TEXT[] NOT NULL DEFAULT '{}',
        status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
        visible BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS professional_profiles_catalog_idx
        ON professional_profiles (kind, status, visible, display_name);

      ALTER TABLE teacher_reviews ADD COLUMN IF NOT EXISTS teacher_profile_id UUID REFERENCES professional_profiles(id) ON DELETE RESTRICT;
      ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS mentor_profile_id UUID REFERENCES professional_profiles(id) ON DELETE RESTRICT;
      CREATE INDEX IF NOT EXISTS teacher_reviews_profile_idx ON teacher_reviews (teacher_profile_id, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS mentorship_requests_profile_idx ON mentorship_requests (mentor_profile_id, status, created_at DESC);
    `,
  },
  {
    version: 2,
    name: "support ownership and publishing states",
    sql: `
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'published';
      ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'published';
      ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS support_tickets_user_idx ON support_tickets (user_id, created_at DESC);
    `,
  },
  {
    version: 3,
    name: "connections and direct messages",
    sql: `
      CREATE TABLE IF NOT EXISTS connections (
        id UUID PRIMARY KEY,
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (requester_id <> recipient_id),
        UNIQUE (requester_id, recipient_id)
      );
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS conversation_participants (
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_read_at TIMESTAMPTZ,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (conversation_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body VARCHAR(2000) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS messages_cursor_idx ON messages (conversation_id, created_at DESC, id DESC);
    `,
  },
  {
    version: 4,
    name: "administration audit history",
    sql: `
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY,
        actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(80) NOT NULL,
        entity_type VARCHAR(40) NOT NULL,
        entity_id VARCHAR(120) NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);
    `,
  },
  {
    version: 5,
    name: "unique direct relationships",
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS connections_pair_unique
        ON connections (LEAST(requester_id,recipient_id), GREATEST(requester_id,recipient_id));
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS direct_key TEXT;
      UPDATE conversations c SET direct_key=(SELECT string_agg(cp.user_id::text,':' ORDER BY cp.user_id::text)
        FROM conversation_participants cp WHERE cp.conversation_id=c.id) WHERE direct_key IS NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS conversations_direct_key_unique ON conversations (direct_key);
    `,
  },
  {
    version: 6,
    name: "teacher mentor applications and dual professional profiles",
    sql: `
      ALTER TABLE professional_profiles DROP CONSTRAINT IF EXISTS professional_profiles_user_id_key;
      CREATE UNIQUE INDEX IF NOT EXISTS professional_profiles_user_kind_unique
        ON professional_profiles (user_id, kind) WHERE user_id IS NOT NULL;

      CREATE TABLE IF NOT EXISTS mentor_applications (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        specialty VARCHAR(180) NOT NULL,
        biography VARCHAR(1200) NOT NULL,
        availability VARCHAR(240) NOT NULL,
        meeting_mode VARCHAR(80) NOT NULL,
        languages TEXT[] NOT NULL DEFAULT '{}',
        status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS mentor_applications_status_idx
        ON mentor_applications (status, created_at DESC);
    `,
  },
  {
    version: 7,
    name: "reconcile club membership counters",
    sql: `
      UPDATE clubs SET member_count = (
        SELECT COUNT(*)::int FROM club_memberships WHERE club_memberships.club_id = clubs.id
      );
      CREATE INDEX IF NOT EXISTS club_memberships_user_idx
        ON club_memberships (user_id, created_at DESC);
    `,
  },
];

export async function runMigrations() {
  if (!databasePool) return;
  await databasePool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  for (const migration of migrations) {
    const applied = await databasePool.query("SELECT 1 FROM schema_migrations WHERE version=$1", [migration.version]);
    if (applied.rowCount) continue;
    const client = await databasePool.connect();
    await applyMigration(client, migration);
  }
}

async function applyMigration(client: PoolClient, migration: Migration) {
  try {
    await client.query("BEGIN");
    await client.query(migration.sql);
    await client.query("INSERT INTO schema_migrations (version,name) VALUES ($1,$2)", [migration.version, migration.name]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
