import { randomUUID } from "node:crypto";
import { databasePool } from "./database.js";

export const TIMETABLE_TONES = ["mint", "lilac", "blue", "coral", "gold", "sage"] as const;
export type TimetableTone = (typeof TIMETABLE_TONES)[number];

export type TimetableEntry = {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  tone: TimetableTone;
};

export type TimetableInput = Omit<TimetableEntry, "id">;

const memory = new Map<string, TimetableEntry[]>();

function sort(entries: TimetableEntry[]) {
  return [...entries].sort((a, b) =>
    a.dayOfWeek - b.dayOfWeek || a.startMinute - b.startMinute || a.subject.localeCompare(b.subject, "az"),
  );
}

function mapRow(row: Record<string, unknown>): TimetableEntry {
  return {
    id: String(row.id),
    subject: String(row.subject),
    teacher: String(row.teacher ?? ""),
    room: String(row.room ?? ""),
    dayOfWeek: Number(row.day_of_week),
    startMinute: Number(row.start_minute),
    endMinute: Number(row.end_minute),
    tone: String(row.tone ?? "mint") as TimetableTone,
  };
}

export async function listTimetable(userId: string): Promise<TimetableEntry[]> {
  if (!databasePool) return sort(memory.get(userId) ?? []);
  const result = await databasePool.query(
    "SELECT * FROM timetable_entries WHERE user_id=$1 ORDER BY day_of_week, start_minute",
    [userId],
  );
  return result.rows.map(mapRow);
}

export async function createTimetableEntry(userId: string, input: TimetableInput): Promise<TimetableEntry> {
  const entry: TimetableEntry = { id: randomUUID(), ...input };
  if (!databasePool) {
    memory.set(userId, [...(memory.get(userId) ?? []), entry]);
    return entry;
  }
  const result = await databasePool.query(
    `INSERT INTO timetable_entries(id,user_id,subject,teacher,room,day_of_week,start_minute,end_minute,tone)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [entry.id, userId, entry.subject, entry.teacher, entry.room, entry.dayOfWeek, entry.startMinute, entry.endMinute, entry.tone],
  );
  return mapRow(result.rows[0]);
}

export async function updateTimetableEntry(
  userId: string,
  id: string,
  patch: Partial<TimetableInput>,
): Promise<TimetableEntry | null> {
  if (!databasePool) {
    const entries = memory.get(userId) ?? [];
    const current = entries.find((item) => item.id === id);
    if (!current) return null;
    Object.assign(current, patch);
    return current;
  }
  const result = await databasePool.query(
    `UPDATE timetable_entries SET
       subject=COALESCE($3,subject), teacher=COALESCE($4,teacher), room=COALESCE($5,room),
       day_of_week=COALESCE($6,day_of_week), start_minute=COALESCE($7,start_minute),
       end_minute=COALESCE($8,end_minute), tone=COALESCE($9,tone), updated_at=NOW()
     WHERE id=$1 AND user_id=$2 RETURNING *`,
    [id, userId, patch.subject ?? null, patch.teacher ?? null, patch.room ?? null,
      patch.dayOfWeek ?? null, patch.startMinute ?? null, patch.endMinute ?? null, patch.tone ?? null],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteTimetableEntry(userId: string, id: string): Promise<boolean> {
  if (!databasePool) {
    const entries = memory.get(userId) ?? [];
    const next = entries.filter((item) => item.id !== id);
    memory.set(userId, next);
    return next.length !== entries.length;
  }
  const result = await databasePool.query("DELETE FROM timetable_entries WHERE id=$1 AND user_id=$2", [id, userId]);
  return Boolean(result.rowCount);
}
