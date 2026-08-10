import { randomUUID } from "node:crypto";
import { databasePool, type UserRecord } from "./database.js";
import { ApiError } from "../lib/api-error.js";
import { activateMemoryMentorProfile } from "./professionals.js";

export type MentorApplicationStatus = "pending" | "approved" | "rejected";
export type MentorApplication = {
  id: string;
  userId: string;
  teacherName: string;
  specialty: string;
  biography: string;
  availability: string;
  meetingMode: string;
  languages: string[];
  status: MentorApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

type MentorApplicationInput = Pick<MentorApplication, "specialty" | "biography" | "availability" | "meetingMode" | "languages">;
const memoryApplications = new Map<string, MentorApplication>();

function map(row: Record<string, unknown>): MentorApplication {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    teacherName: String(row.teacher_name ?? "Müəllim"),
    specialty: String(row.specialty),
    biography: String(row.biography),
    availability: String(row.availability),
    meetingMode: String(row.meeting_mode),
    languages: Array.isArray(row.languages) ? row.languages.map(String) : [],
    status: row.status as MentorApplicationStatus,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getMentorApplication(userId: string) {
  if (!databasePool) return memoryApplications.get(userId) ?? null;
  const result = await databasePool.query(
    `SELECT a.*, u.name AS teacher_name FROM mentor_applications a
     JOIN users u ON u.id=a.user_id WHERE a.user_id=$1 LIMIT 1`,
    [userId],
  );
  return result.rows[0] ? map(result.rows[0]) : null;
}

export async function createMentorApplication(user: UserRecord, input: MentorApplicationInput) {
  if (user.role !== "teacher" || user.status !== "Aktiv") {
    throw new ApiError(403, "TEACHER_REQUIRED", "Mentorluq müraciəti yalnız aktiv müəllim hesabı üçün açıqdır.");
  }

  const existing = await getMentorApplication(user.id);
  if (existing?.status === "pending" || existing?.status === "approved") {
    throw new ApiError(409, "MENTOR_APPLICATION_EXISTS", existing.status === "approved" ? "Mentor profilin artıq aktivdir." : "Gözləyən mentorluq müraciətin artıq var.");
  }

  const timestamp = new Date().toISOString();
  if (!databasePool) {
    const application: MentorApplication = {
      id: existing?.id ?? randomUUID(), userId: user.id, teacherName: user.name, ...input,
      status: "pending", createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp,
    };
    memoryApplications.set(user.id, application);
    return application;
  }

  const result = await databasePool.query(
    `INSERT INTO mentor_applications
       (id,user_id,specialty,biography,availability,meeting_mode,languages,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
     ON CONFLICT (user_id) DO UPDATE SET
       specialty=EXCLUDED.specialty, biography=EXCLUDED.biography,
       availability=EXCLUDED.availability, meeting_mode=EXCLUDED.meeting_mode,
       languages=EXCLUDED.languages, status='pending', reviewed_by=NULL, updated_at=NOW()
     RETURNING *, $8::text AS teacher_name`,
    [randomUUID(), user.id, input.specialty, input.biography, input.availability, input.meetingMode, input.languages, user.name],
  );
  return map(result.rows[0]);
}

export async function listMentorApplications(status: MentorApplicationStatus = "pending") {
  if (!databasePool) return [...memoryApplications.values()].filter((item) => item.status === status);
  const result = await databasePool.query(
    `SELECT a.*, u.name AS teacher_name FROM mentor_applications a
     JOIN users u ON u.id=a.user_id WHERE a.status=$1 ORDER BY a.created_at DESC`,
    [status],
  );
  return result.rows.map(map);
}

export async function decideMentorApplication(
  id: string,
  status: Extract<MentorApplicationStatus, "approved" | "rejected">,
  reviewerId: string,
) {
  if (!databasePool) {
    const entry = [...memoryApplications.entries()].find(([, item]) => item.id === id);
    if (!entry) return null;
    const [userId, current] = entry;
    if (current.status !== "pending") return null;
    const next = { ...current, status, updatedAt: new Date().toISOString() };
    memoryApplications.set(userId, next);
    if (status === "approved") {
      activateMemoryMentorProfile({
        userId, name: current.teacherName, specialty: current.specialty,
        biography: current.biography, availability: current.availability,
        meetingMode: current.meetingMode, languages: current.languages,
      });
    }
    return next;
  }

  const client = await databasePool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE mentor_applications a SET status=$2, reviewed_by=$3, updated_at=NOW()
       FROM users u WHERE a.id=$1 AND a.user_id=u.id AND a.status='pending'
       RETURNING a.*, u.name AS teacher_name, u.city AS teacher_city`,
      [id, status, reviewerId],
    );
    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }
    const row = result.rows[0];
    if (status === "approved") {
      await client.query(
        `INSERT INTO professional_profiles
          (id,user_id,kind,slug,display_name,headline,specialty,biography,city,availability,meeting_mode,languages,expertise,status,visible)
         VALUES ($1,$2,'mentor',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'approved',TRUE)
         ON CONFLICT (user_id,kind) WHERE user_id IS NOT NULL DO UPDATE SET
          display_name=EXCLUDED.display_name, headline=EXCLUDED.headline,
          specialty=EXCLUDED.specialty, biography=EXCLUDED.biography,
          availability=EXCLUDED.availability, meeting_mode=EXCLUDED.meeting_mode,
          languages=EXCLUDED.languages, expertise=EXCLUDED.expertise,
          status='approved', visible=TRUE, updated_at=NOW()`,
        [randomUUID(), row.user_id, `mentor-${row.user_id}`, row.teacher_name, `${row.specialty} mentoru`, row.specialty, row.biography, row.teacher_city || "Xankəndi", row.availability, row.meeting_mode, row.languages, [row.specialty]],
      );
    }
    await client.query("COMMIT");
    return map(row);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
