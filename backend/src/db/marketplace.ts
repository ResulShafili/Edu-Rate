import { randomUUID } from "node:crypto";
import { databasePool } from "./database.js";

export const LISTING_KINDS = ["satiram", "axtariram", "pulsuz", "komek"] as const;
export const LISTING_CATEGORIES = ["kitab", "texnika", "ders", "yasayis", "diger"] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];
export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export type Listing = {
  id: string;
  title: string;
  details: string;
  kind: ListingKind;
  category: ListingCategory;
  price: string;
  createdAt: string;
  mine: boolean;
  /** Əlaqə yalnız daxil olmuş istifadəçiyə açılır. */
  contact?: { userId: string; name: string };
};

type MemoryListing = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  details: string;
  kind: ListingKind;
  category: ListingCategory;
  price: string;
  createdAt: string;
};

const memory = new Map<string, MemoryListing>();
const iso = (value: unknown) => new Date(String(value)).toISOString();

export async function listListings(viewerId: string | null, category?: ListingCategory): Promise<Listing[]> {
  if (!databasePool) {
    return [...memory.values()]
      .filter((item) => !category || item.category === category)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((item) => ({
        id: item.id,
        title: item.title,
        details: item.details,
        kind: item.kind,
        category: item.category,
        price: item.price,
        createdAt: item.createdAt,
        mine: item.userId === viewerId,
        ...(viewerId ? { contact: { userId: item.userId, name: item.userName } } : {}),
      }));
  }
  const values: unknown[] = [viewerId];
  let filter = "";
  if (category) {
    values.push(category);
    filter = `AND l.category=$${values.length}`;
  }
  const result = await databasePool.query(
    `SELECT l.*, u.name AS user_name
     FROM marketplace_listings l JOIN users u ON u.id=l.user_id
     WHERE l.status='active' ${filter}
     ORDER BY l.created_at DESC LIMIT 100`,
    values,
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    details: String(row.details ?? ""),
    kind: String(row.kind) as ListingKind,
    category: String(row.category) as ListingCategory,
    price: String(row.price ?? ""),
    createdAt: iso(row.created_at),
    mine: Boolean(viewerId && String(row.user_id) === viewerId),
    ...(viewerId ? { contact: { userId: String(row.user_id), name: String(row.user_name) } } : {}),
  }));
}

export async function createListing(
  userId: string,
  userName: string,
  input: { title: string; details: string; kind: ListingKind; category: ListingCategory; price: string },
) {
  const id = randomUUID();
  if (!databasePool) {
    memory.set(id, { id, userId, userName, createdAt: new Date().toISOString(), ...input });
    return { id };
  }
  await databasePool.query(
    "INSERT INTO marketplace_listings(id,user_id,title,details,kind,category,price) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [id, userId, input.title, input.details, input.kind, input.category, input.price],
  );
  return { id };
}

export async function closeListing(id: string, userId: string, isModerator: boolean) {
  if (!databasePool) {
    const listing = memory.get(id);
    if (!listing || (!isModerator && listing.userId !== userId)) return false;
    memory.delete(id);
    return true;
  }
  const result = isModerator
    ? await databasePool.query("UPDATE marketplace_listings SET status='closed',updated_at=NOW() WHERE id=$1", [id])
    : await databasePool.query("UPDATE marketplace_listings SET status='closed',updated_at=NOW() WHERE id=$1 AND user_id=$2", [id, userId]);
  return Boolean(result.rowCount);
}
