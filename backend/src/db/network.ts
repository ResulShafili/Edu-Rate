import { databasePool } from "./database.js";

export type NetworkCategory = "official" | "faculties" | "clubs" | "scholarship" | "events";
export type NetworkTone = "lime" | "lilac" | "blue" | "coral" | "mint" | "gold";

export type AnnouncementRecord = {
  id: string;
  kind: "announcement";
  category: NetworkCategory;
  title: string;
  summary: string;
  source: string;
  sourceInitials: string;
  publishedAt: string;
  timeLabel: string;
  tone: NetworkTone;
  dateLabel: string;
  startsAt: string;
  expiresAt: string;
  priority: boolean;
};

export type FeedRecord = Omit<AnnouncementRecord, "kind" | "dateLabel" | "startsAt" | "expiresAt" | "priority"> & {
  kind: "post" | "news" | "notification";
  tags: string[];
};

const announcements: AnnouncementRecord[] = [
  { id: "2026-orientation", kind: "announcement", category: "official", title: "Yeni tələbələr üçün tanışlıq proqramı", summary: "Kampus turu, tələbə xidmətləri və klublarla tanışlıq görüşü 18 avqustda keçiriləcək.", source: "Tələbə İşləri Mərkəzi", sourceInitials: "Tİ", publishedAt: "2026-08-10T09:00:00+04:00", timeLabel: "10 avqust · 09:00", tone: "lime", dateLabel: "18 avqust", startsAt: "2026-08-18T10:00:00+04:00", expiresAt: "2026-08-18T18:00:00+04:00", priority: true },
  { id: "2026-scholarship", kind: "announcement", category: "scholarship", title: "Akademik təqaüd müraciətləri açıqdır", summary: "Elektron müraciət və tələb olunan sənədlər 25 avqust saat 18:00-dək qəbul edilir.", source: "Tələbə İşləri Mərkəzi", sourceInitials: "Tİ", publishedAt: "2026-08-09T11:20:00+04:00", timeLabel: "9 avqust · 11:20", tone: "gold", dateLabel: "25 avqust", startsAt: "2026-08-09T11:20:00+04:00", expiresAt: "2026-08-25T18:00:00+04:00", priority: true },
  { id: "2026-robotics-lab", kind: "announcement", category: "clubs", title: "Robototexnika klubunda açıq laboratoriya", summary: "Sensorlar və kiçik robotlarla praktik görüş üçün ilkin təcrübə tələb olunmur.", source: "Robototexnika Klubu", sourceInitials: "RK", publishedAt: "2026-08-08T14:00:00+04:00", timeLabel: "8 avqust · 14:00", tone: "blue", dateLabel: "20 avqust", startsAt: "2026-08-20T14:00:00+04:00", expiresAt: "2026-08-20T17:00:00+04:00", priority: false },
];

const feed: FeedRecord[] = [
  { id: "library-hours-august", kind: "news", category: "official", title: "Kitabxananın iş saatları uzadıldı", summary: "İmtahan hazırlığı dövründə əsas oxu zalı həftəiçi saat 22:00-dək açıq olacaq.", source: "Universitet Kitabxanası", sourceInitials: "UK", publishedAt: "2026-08-10T10:20:00+04:00", timeLabel: "10 avqust · 10:20", tone: "lime", tags: ["Kitabxana", "İmtahan"] },
  { id: "frontend-team-august", kind: "post", category: "clubs", title: "Frontend layihəsi üçün komanda yoldaşı axtarılır", summary: "Kampus tədbirlərini əlçatan göstərən React layihəsi üçün dizayn düşüncəsi olan tələbə axtarılır.", source: "Proqramlaşdırma Klubu", sourceInitials: "PK", publishedAt: "2026-08-10T09:55:00+04:00", timeLabel: "10 avqust · 09:55", tone: "blue", tags: ["React", "Komanda"] },
  { id: "engineering-showcase-august", kind: "news", category: "faculties", title: "Mühəndislik layihələrinin açıq nümayişi", summary: "Tələbə komandaları işlək prototiplərini təqdim edəcək və ziyarətçilərdən rəy alacaq.", source: "Mühəndislik Fakültəsi", sourceInitials: "MF", publishedAt: "2026-08-09T16:10:00+04:00", timeLabel: "9 avqust · 16:10", tone: "lilac", tags: ["Layihə", "Mühəndislik"] },
  { id: "digital-safety-august", kind: "news", category: "official", title: "Rəqəmsal təhlükəsizlik bələdçisi yeniləndi", summary: "Hesab qorunması və şəxsi məlumatların təhlükəsiz paylaşılması üçün əsas addımlar bir səhifədə toplanıb.", source: "İnformasiya Təhlükəsizliyi", sourceInitials: "İT", publishedAt: "2026-08-09T12:30:00+04:00", timeLabel: "9 avqust · 12:30", tone: "mint", tags: ["Təhlükəsizlik", "Bələdçi"] },
  { id: "debate-intake-august", kind: "notification", category: "clubs", title: "Debat klubuna yeni üzv qəbulu", summary: "Açıq məşqdə klubun iş tərzi və həftəlik proqramı ilə tanış ola bilərsən.", source: "Debat Klubu", sourceInitials: "DK", publishedAt: "2026-08-08T18:40:00+04:00", timeLabel: "8 avqust · 18:40", tone: "coral", tags: ["Debat", "Üzvlük"] },
];

export async function initializeNetworkDatabase() {
  if (!databasePool) return;
  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(120) PRIMARY KEY, category VARCHAR(24) NOT NULL, title VARCHAR(180) NOT NULL,
      summary VARCHAR(800) NOT NULL, source VARCHAR(140) NOT NULL, source_initials VARCHAR(8) NOT NULL,
      published_at TIMESTAMPTZ NOT NULL, tone VARCHAR(16) NOT NULL, starts_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL, priority BOOLEAN NOT NULL DEFAULT FALSE
    );
    CREATE INDEX IF NOT EXISTS announcements_published_at_idx ON announcements (published_at DESC);
    CREATE TABLE IF NOT EXISTS feed_posts (
      id VARCHAR(120) PRIMARY KEY, kind VARCHAR(24) NOT NULL, category VARCHAR(24) NOT NULL,
      title VARCHAR(180) NOT NULL, summary VARCHAR(800) NOT NULL, source VARCHAR(140) NOT NULL,
      source_initials VARCHAR(8) NOT NULL, published_at TIMESTAMPTZ NOT NULL, tone VARCHAR(16) NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS feed_posts_published_at_idx ON feed_posts (published_at DESC);
  `);
  for (const item of announcements) {
    await databasePool.query(`INSERT INTO announcements
      (id, category, title, summary, source, source_initials, published_at, tone, starts_at, expires_at, priority)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
      [item.id, item.category, item.title, item.summary, item.source, item.sourceInitials, item.publishedAt, item.tone, item.startsAt, item.expiresAt, item.priority]);
  }
  for (const item of feed) {
    await databasePool.query(`INSERT INTO feed_posts
      (id, kind, category, title, summary, source, source_initials, published_at, tone, tags)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
      [item.id, item.kind, item.category, item.title, item.summary, item.source, item.sourceInitials, item.publishedAt, item.tone, item.tags]);
  }
}

export async function listAnnouncements(category?: NetworkCategory): Promise<AnnouncementRecord[]> {
  if (!databasePool) return announcements.filter((item) => !category || item.category === category);
  const result = await databasePool.query(
    `SELECT * FROM announcements ${category ? "WHERE category = $1" : ""} ORDER BY priority DESC, published_at DESC`,
    category ? [category] : [],
  );
  return result.rows.map((row) => ({ id: String(row.id), kind: "announcement", category: row.category, title: String(row.title), summary: String(row.summary), source: String(row.source), sourceInitials: String(row.source_initials), publishedAt: new Date(row.published_at).toISOString(), timeLabel: formatTime(row.published_at), tone: row.tone, dateLabel: formatDate(row.starts_at), startsAt: new Date(row.starts_at).toISOString(), expiresAt: new Date(row.expires_at).toISOString(), priority: Boolean(row.priority) }));
}

export async function listFeed(category?: NetworkCategory): Promise<FeedRecord[]> {
  if (!databasePool) return feed.filter((item) => !category || item.category === category);
  const result = await databasePool.query(
    `SELECT * FROM feed_posts ${category ? "WHERE category = $1" : ""} ORDER BY published_at DESC LIMIT 100`,
    category ? [category] : [],
  );
  return result.rows.map((row) => ({ id: String(row.id), kind: row.kind, category: row.category, title: String(row.title), summary: String(row.summary), source: String(row.source), sourceInitials: String(row.source_initials), publishedAt: new Date(row.published_at).toISOString(), timeLabel: formatTime(row.published_at), tone: row.tone, tags: Array.isArray(row.tags) ? row.tags.map(String) : [] }));
}

function formatDate(value: unknown) {
  return new Intl.DateTimeFormat("az-AZ", { day: "numeric", month: "long", timeZone: "Asia/Baku" }).format(new Date(String(value)));
}

function formatTime(value: unknown) {
  return new Intl.DateTimeFormat("az-AZ", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Baku" }).format(new Date(String(value))).replace(" tarixində", " ·");
}
