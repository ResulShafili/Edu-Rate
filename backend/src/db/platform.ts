import { randomBytes, randomUUID } from "node:crypto";
import { ApiError } from "../lib/api-error.js";
import { databasePool } from "./database.js";

export type ClubStatus = "Aktiv" | "Gözləmədə" | "Məhdudlaşdırılıb";

export type ClubRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  coordinatorInitials: string;
  memberCount: number;
  eventCount: number;
  status: ClubStatus;
  createdAt: string;
  updatedAt: string;
};

export type ClubInput = Pick<ClubRecord, "slug" | "name" | "category" | "coordinatorInitials"> & {
  status?: ClubStatus;
};

export type TeacherReviewRecord = {
  id: string;
  userId: string;
  teacherId: string;
  course: string;
  semester: string;
  text: string;
  criteria: {
    clarity: number;
    subjectKnowledge: number;
    objectivity: number;
    communication: number;
  };
  rating: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type TeacherReviewStatus = TeacherReviewRecord["status"];

export type SupportTicketRecord = {
  id: string;
  reference: string;
  userId: string | null;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
};

const clubSeeds: Omit<ClubRecord, "id" | "createdAt" | "updatedAt">[] = [
  { slug: "innovasiya-robototexnika", name: "İnnovasiya və Robototexnika Klubu", category: "Texnologiya", coordinatorInitials: "NH", memberCount: 186, eventCount: 8, status: "Aktiv" },
  { slug: "debat-natiqlik", name: "Debat və Natiqlik Cəmiyyəti", category: "Akademik", coordinatorInitials: "NA", memberCount: 142, eventCount: 6, status: "Aktiv" },
  { slug: "yasil-kampus", name: "Yaşıl Kampus Birliyi", category: "Sosial təsir", coordinatorInitials: "LM", memberCount: 118, eventCount: 5, status: "Aktiv" },
  { slug: "vizual-hekaye", name: "Vizual Hekayə Klubu", category: "Yaradıcılıq", coordinatorInitials: "NG", memberCount: 96, eventCount: 7, status: "Aktiv" },
  { slug: "konulluler-sebekesi", name: "Könüllülər Şəbəkəsi", category: "Sosial təsir", coordinatorInitials: "RA", memberCount: 214, eventCount: 11, status: "Aktiv" },
  { slug: "sehne-musiqi", name: "Səhnə və Musiqi Birliyi", category: "Mədəniyyət", coordinatorInitials: "SD", memberCount: 124, eventCount: 9, status: "Aktiv" },
];

const now = () => new Date().toISOString();
const memoryClubs = new Map<string, ClubRecord>(
  clubSeeds.map((club) => {
    const createdAt = "2026-08-01T00:00:00.000Z";
    return [club.slug, { ...club, id: randomUUID(), createdAt, updatedAt: createdAt }];
  }),
);
const memoryMemberships = new Set<string>();
const memoryReviews = new Map<string, TeacherReviewRecord>();
const memoryTickets = new Map<string, SupportTicketRecord>();

function iso(value: unknown) {
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}

function mapClub(row: Record<string, unknown>): ClubRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category),
    coordinatorInitials: String(row.coordinator_initials),
    memberCount: Number(row.member_count),
    eventCount: Number(row.event_count),
    status: row.status as ClubStatus,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapReview(row: Record<string, unknown>): TeacherReviewRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    teacherId: String(row.teacher_id),
    course: String(row.course),
    semester: String(row.semester),
    text: String(row.review_text),
    criteria: {
      clarity: Number(row.clarity),
      subjectKnowledge: Number(row.subject_knowledge),
      objectivity: Number(row.objectivity),
      communication: Number(row.communication),
    },
    rating: Number(row.rating),
    status: row.status as TeacherReviewRecord["status"],
    createdAt: iso(row.created_at),
  };
}

export async function initializePlatformDatabase() {
  if (!databasePool) return;

  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS clubs (
      id UUID PRIMARY KEY,
      slug VARCHAR(90) NOT NULL UNIQUE,
      name VARCHAR(140) NOT NULL,
      category VARCHAR(80) NOT NULL,
      coordinator_initials VARCHAR(6) NOT NULL,
      member_count INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
      event_count INTEGER NOT NULL DEFAULT 0 CHECK (event_count >= 0),
      status VARCHAR(32) NOT NULL DEFAULT 'Aktiv' CHECK (status IN ('Aktiv', 'Gözləmədə', 'Məhdudlaşdırılıb')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS club_memberships (
      club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (club_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS teacher_reviews (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      teacher_id VARCHAR(120) NOT NULL,
      course VARCHAR(180) NOT NULL,
      semester VARCHAR(80) NOT NULL,
      review_text VARCHAR(1200) NOT NULL,
      clarity SMALLINT NOT NULL CHECK (clarity BETWEEN 1 AND 5),
      subject_knowledge SMALLINT NOT NULL CHECK (subject_knowledge BETWEEN 1 AND 5),
      objectivity SMALLINT NOT NULL CHECK (objectivity BETWEEN 1 AND 5),
      communication SMALLINT NOT NULL CHECK (communication BETWEEN 1 AND 5),
      rating NUMERIC(3,2) NOT NULL CHECK (rating BETWEEN 1 AND 5),
      status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, teacher_id, semester)
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id UUID PRIMARY KEY,
      reference VARCHAR(32) NOT NULL UNIQUE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL,
      topic VARCHAR(120) NOT NULL,
      message VARCHAR(2000) NOT NULL,
      status VARCHAR(24) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  for (const club of clubSeeds) {
    await databasePool.query(
      `INSERT INTO clubs (id, slug, name, category, coordinator_initials, member_count, event_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (slug) DO NOTHING`,
      [randomUUID(), club.slug, club.name, club.category, club.coordinatorInitials, club.memberCount, club.eventCount, club.status],
    );
  }
}

export async function listClubs(): Promise<ClubRecord[]> {
  if (!databasePool) return [...memoryClubs.values()].map((club)=>({
    ...club,
    memberCount:[...memoryMemberships].filter((key)=>key.endsWith(`:${club.slug}`)).length,
  })).sort((a, b) => a.name.localeCompare(b.name, "az"));
  const result = await databasePool.query(`SELECT clubs.*,
    (SELECT COUNT(*)::int FROM club_memberships WHERE club_id=clubs.id) AS member_count
    FROM clubs ORDER BY name ASC`);
  return result.rows.map(mapClub);
}

export async function findClub(idOrSlug: string): Promise<ClubRecord | null> {
  if (!databasePool) {
    const club=[...memoryClubs.values()].find((item) => item.id === idOrSlug || item.slug === idOrSlug);
    return club ? {...club,memberCount:[...memoryMemberships].filter((key)=>key.endsWith(`:${club.slug}`)).length} : null;
  }
  const result = await databasePool.query(`SELECT clubs.*,
    (SELECT COUNT(*)::int FROM club_memberships WHERE club_id=clubs.id) AS member_count
    FROM clubs WHERE id::text = $1 OR slug = $1 LIMIT 1`, [idOrSlug]);
  return result.rows[0] ? mapClub(result.rows[0]) : null;
}

export async function createClub(input: ClubInput): Promise<ClubRecord> {
  const club: ClubRecord = { id: randomUUID(), ...input, memberCount: 0, eventCount: 0, status: input.status ?? "Gözləmədə", createdAt: now(), updatedAt: now() };
  if (!databasePool) {
    if (memoryClubs.has(club.slug)) throw new ApiError(409, "CLUB_EXISTS", "Bu qısa adla klub artıq mövcuddur.");
    memoryClubs.set(club.slug, club);
    return club;
  }
  const result = await databasePool.query(
    `INSERT INTO clubs (id, slug, name, category, coordinator_initials, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [club.id, club.slug, club.name, club.category, club.coordinatorInitials, club.status],
  );
  return mapClub(result.rows[0]);
}

export async function updateClub(id: string, input: Partial<ClubInput>): Promise<ClubRecord | null> {
  if (!databasePool) {
    const current = await findClub(id);
    if (!current) return null;
    const next = { ...current, ...input, updatedAt: now() };
    memoryClubs.delete(current.slug);
    memoryClubs.set(next.slug, next);
    return next;
  }
  const result = await databasePool.query(
    `UPDATE clubs SET slug = COALESCE($2, slug), name = COALESCE($3, name),
       category = COALESCE($4, category), coordinator_initials = COALESCE($5, coordinator_initials),
       status = COALESCE($6, status), updated_at = NOW()
     WHERE id::text = $1 OR slug = $1 RETURNING *`,
    [id, input.slug, input.name, input.category, input.coordinatorInitials, input.status],
  );
  return result.rows[0] ? mapClub(result.rows[0]) : null;
}

export async function deleteClub(id: string): Promise<boolean> {
  if (!databasePool) {
    const club = await findClub(id);
    return club ? memoryClubs.delete(club.slug) : false;
  }
  const result = await databasePool.query("DELETE FROM clubs WHERE id::text = $1 OR slug = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function listMyClubMemberships(userId: string): Promise<ClubRecord[]> {
  if (!databasePool) {
    const slugs = new Set([...memoryMemberships].filter((key) => key.startsWith(`${userId}:`)).map((key) => key.slice(userId.length + 1)));
    return [...memoryClubs.values()].filter((club) => slugs.has(club.slug));
  }
  const result = await databasePool.query(
    `SELECT clubs.*,
       (SELECT COUNT(*)::int FROM club_memberships all_members WHERE all_members.club_id=clubs.id) AS member_count
     FROM club_memberships JOIN clubs ON clubs.id = club_memberships.club_id
     WHERE club_memberships.user_id = $1 ORDER BY club_memberships.created_at DESC`,
    [userId],
  );
  return result.rows.map(mapClub);
}

export async function joinClub(id: string, userId: string): Promise<ClubRecord> {
  const club = await findClub(id);
  if (!club || club.status !== "Aktiv") throw new ApiError(404, "CLUB_NOT_FOUND", "Aktiv klub tapılmadı.");
  if (!databasePool) {
    const key = `${userId}:${club.slug}`;
    if (memoryMemberships.has(key)) throw new ApiError(409, "ALREADY_MEMBER", "Artıq bu klubun üzvüsən.");
    memoryMemberships.add(key);
    club.memberCount += 1;
    club.updatedAt = now();
    return club;
  }
  const client = await databasePool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO club_memberships (club_id, user_id) VALUES ($1, $2)", [club.id, userId]);
    const result = await client.query(`UPDATE clubs SET
      member_count = (SELECT COUNT(*)::int FROM club_memberships WHERE club_id=$1),
      updated_at = NOW() WHERE id = $1 RETURNING *`, [club.id]);
    await client.query("COMMIT");
    return mapClub(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new ApiError(409, "ALREADY_MEMBER", "Artıq bu klubun üzvüsən.");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function leaveClub(id: string, userId: string): Promise<ClubRecord> {
  const club = await findClub(id);
  if (!club) throw new ApiError(404, "CLUB_NOT_FOUND", "Klub tapılmadı.");
  if (!databasePool) {
    const deleted = memoryMemberships.delete(`${userId}:${club.slug}`);
    if (!deleted) throw new ApiError(404, "MEMBERSHIP_NOT_FOUND", "Klub üzvlüyü tapılmadı.");
    club.memberCount = Math.max(0, club.memberCount - 1);
    club.updatedAt = now();
    return club;
  }
  const client = await databasePool.connect();
  try {
    await client.query("BEGIN");
    const deleted = await client.query("DELETE FROM club_memberships WHERE club_id = $1 AND user_id = $2", [club.id, userId]);
    if (!deleted.rowCount) throw new ApiError(404, "MEMBERSHIP_NOT_FOUND", "Klub üzvlüyü tapılmadı.");
    const result = await client.query(`UPDATE clubs SET
      member_count = (SELECT COUNT(*)::int FROM club_memberships WHERE club_id=$1),
      updated_at = NOW() WHERE id = $1 RETURNING *`, [club.id]);
    await client.query("COMMIT");
    return mapClub(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createTeacherReview(
  userId: string,
  input: Omit<TeacherReviewRecord, "id" | "userId" | "rating" | "status" | "createdAt">,
  teacherProfileId?: string,
): Promise<TeacherReviewRecord> {
  const rating = Object.values(input.criteria).reduce((total, value) => total + value, 0) / 4;
  const review: TeacherReviewRecord = { id: randomUUID(), userId, ...input, rating, status: "pending", createdAt: now() };
  const uniqueKey = `${userId}:${input.teacherId}:${input.semester}`;
  if (!databasePool) {
    if (memoryReviews.has(uniqueKey)) throw new ApiError(409, "REVIEW_EXISTS", "Bu müəllim üçün cari semestrdə artıq rəy göndərmisən.");
    memoryReviews.set(uniqueKey, review);
    return review;
  }
  try {
    const result = await databasePool.query(
      `INSERT INTO teacher_reviews
         (id, user_id, teacher_id, teacher_profile_id, course, semester, review_text, clarity, subject_knowledge, objectivity, communication, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [review.id, userId, input.teacherId, teacherProfileId ?? null, input.course, input.semester, input.text, input.criteria.clarity, input.criteria.subjectKnowledge, input.criteria.objectivity, input.criteria.communication, rating],
    );
    return mapReview(result.rows[0]);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new ApiError(409, "REVIEW_EXISTS", "Bu müəllim üçün cari semestrdə artıq rəy göndərmisən.");
    }
    throw error;
  }
}

export async function listTeacherReviews(filters: {
  teacherId?: string;
  status?: TeacherReviewStatus;
  limit?: number;
} = {}): Promise<TeacherReviewRecord[]> {
  const limit = Math.min(100, Math.max(1, filters.limit ?? 50));
  if (!databasePool) {
    return [...memoryReviews.values()]
      .filter((review) => !filters.teacherId || review.teacherId === filters.teacherId)
      .filter((review) => !filters.status || review.status === filters.status)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  }

  const clauses: string[] = [];
  const values: unknown[] = [];
  if (filters.teacherId) {
    values.push(filters.teacherId);
    clauses.push(`(teacher_id = $${values.length} OR teacher_profile_id::text = $${values.length})`);
  }
  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }
  values.push(limit);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await databasePool.query(
    `SELECT * FROM teacher_reviews ${where} ORDER BY created_at DESC LIMIT $${values.length}`,
    values,
  );
  return result.rows.map(mapReview);
}

export async function updateTeacherReviewStatus(
  id: string,
  status: TeacherReviewStatus,
): Promise<TeacherReviewRecord | null> {
  if (!databasePool) {
    const entry = [...memoryReviews.entries()].find(([, review]) => review.id === id);
    if (!entry) return null;
    const [key, review] = entry;
    const updated = { ...review, status };
    memoryReviews.set(key, updated);
    return updated;
  }

  const result = await databasePool.query(
    "UPDATE teacher_reviews SET status = $2 WHERE id = $1 RETURNING *",
    [id, status],
  );
  return result.rows[0] ? mapReview(result.rows[0]) : null;
}

export async function createSupportTicket(
  input: Pick<SupportTicketRecord, "name" | "email" | "topic" | "message">,
  userId: string | null,
): Promise<SupportTicketRecord> {
  const ticket: SupportTicketRecord = {
    id: randomUUID(), reference: `EDU-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`,
    userId, ...input, status: "open", createdAt: now(),
  };
  if (!databasePool) {
    memoryTickets.set(ticket.id, ticket);
    return ticket;
  }
  const result = await databasePool.query(
    `INSERT INTO support_tickets (id, reference, user_id, name, email, topic, message)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [ticket.id, ticket.reference, userId, input.name, input.email, input.topic, input.message],
  );
  return { ...ticket, createdAt: iso(result.rows[0].created_at) };
}

function mapTicket(row: Record<string, unknown>): SupportTicketRecord {
  return { id:String(row.id), reference:String(row.reference), userId:row.user_id ? String(row.user_id) : null,
    name:String(row.name), email:String(row.email), topic:String(row.topic), message:String(row.message),
    status:row.status as SupportTicketRecord["status"], createdAt:iso(row.created_at) };
}

export async function listSupportTickets(userId?: string): Promise<SupportTicketRecord[]> {
  if (!databasePool) return [...memoryTickets.values()].filter((ticket)=>!userId||ticket.userId===userId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const result=await databasePool.query(`SELECT * FROM support_tickets ${userId?"WHERE user_id=$1":""} ORDER BY created_at DESC`,userId?[userId]:[]);
  return result.rows.map(mapTicket);
}

export async function updateSupportTicketStatus(id:string,status:SupportTicketRecord["status"]):Promise<SupportTicketRecord|null> {
  if (!databasePool) { const ticket=memoryTickets.get(id); if(!ticket)return null; const next={...ticket,status}; memoryTickets.set(id,next); return next; }
  const result=await databasePool.query("UPDATE support_tickets SET status=$2, updated_at=NOW() WHERE id=$1 RETURNING *",[id,status]);
  return result.rows[0]?mapTicket(result.rows[0]):null;
}

export async function getPlatformCounts() {
  if (!databasePool) {
    return { clubs: memoryClubs.size, memberships: memoryMemberships.size, reviews: memoryReviews.size, tickets: memoryTickets.size };
  }
  const result = await databasePool.query(`SELECT
    (SELECT COUNT(*)::int FROM clubs) AS clubs,
    (SELECT COUNT(*)::int FROM club_memberships) AS memberships,
    (SELECT COUNT(*)::int FROM teacher_reviews) AS reviews,
    (SELECT COUNT(*)::int FROM support_tickets) AS tickets`);
  return result.rows[0] as { clubs: number; memberships: number; reviews: number; tickets: number };
}
