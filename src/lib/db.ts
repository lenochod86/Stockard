import * as SQLite from 'expo-sqlite';
import { CodeFormat } from './codes';

export type Card = {
  id: number;
  name: string;
  value: string;
  format: CodeFormat;
  color: string;
  notes: string;
  brandId: string | null;
  /** Vlastní logo jako data URI (PNG), nebo null. */
  logo: string | null;
  createdAt: number;
  lastUsedAt: number | null;
  useCount: number;
};

export type CardUse = { cardId: number; lat: number; lon: number; ts: number };

type Row = {
  id: number;
  name: string;
  value: string;
  format: string;
  color: string;
  notes: string;
  brand_id: string | null;
  logo: string | null;
  created_at: number;
  last_used_at: number | null;
  use_count: number;
};

/** Kolik nejnovějších míst použití si u jedné karty pamatujeme. */
const MAX_USES_PER_CARD = 40;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      // Soubor je uložen v privátním úložišti aplikace – nikam se neodesílá.
      const db = await SQLite.openDatabaseAsync('cards.db');
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Schéma verze 1 = původní vydání 1.0.0; novější verze přidáváme jen přes ALTER/CREATE. */
async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      format TEXT NOT NULL,
      color TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      brand_id TEXT,
      created_at INTEGER NOT NULL,
      last_used_at INTEGER
    );
  `);
  const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = v?.user_version ?? 0;
  if (version < 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ALTER TABLE cards ADD COLUMN use_count INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE cards ADD COLUMN logo TEXT;
        CREATE TABLE IF NOT EXISTS card_uses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          card_id INTEGER NOT NULL,
          lat REAL NOT NULL,
          lon REAL NOT NULL,
          ts INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_card_uses_card ON card_uses(card_id);
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
        UPDATE cards SET use_count = CASE WHEN last_used_at IS NULL THEN 0 ELSE 1 END;
        PRAGMA user_version = 2;
      `);
    });
  }
}

const fromRow = (r: Row): Card => ({
  id: r.id,
  name: r.name,
  value: r.value,
  format: r.format as CodeFormat,
  color: r.color,
  notes: r.notes,
  brandId: r.brand_id,
  logo: r.logo,
  createdAt: r.created_at,
  lastUsedAt: r.last_used_at,
  useCount: r.use_count,
});

export async function listCards(): Promise<Card[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM cards');
  return rows.map(fromRow);
}

export async function getCard(id: number): Promise<Card | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<Row>('SELECT * FROM cards WHERE id = ?', id);
  return r ? fromRow(r) : null;
}

export type CardInput = Pick<Card, 'name' | 'value' | 'format' | 'color' | 'notes' | 'brandId' | 'logo'>;

export async function addCard(c: CardInput): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    'INSERT INTO cards (name, value, format, color, notes, brand_id, logo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    c.name,
    c.value,
    c.format,
    c.color,
    c.notes,
    c.brandId,
    c.logo,
    Date.now(),
  );
  return res.lastInsertRowId;
}

export async function updateCard(id: number, c: CardInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE cards SET name = ?, value = ?, format = ?, color = ?, notes = ?, brand_id = ?, logo = ? WHERE id = ?',
    c.name,
    c.value,
    c.format,
    c.color,
    c.notes,
    c.brandId,
    c.logo,
    id,
  );
}

/**
 * Zaznamená použití karty (otevření na pokladně). Pokud je známa poloha,
 * uloží ji do historie míst – ta zůstává jen v telefonu.
 */
export async function recordUse(id: number, pos: { lat: number; lon: number } | null): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync('UPDATE cards SET last_used_at = ?, use_count = use_count + 1 WHERE id = ?', now, id);
  if (!pos) return;
  await db.runAsync('INSERT INTO card_uses (card_id, lat, lon, ts) VALUES (?, ?, ?, ?)', id, pos.lat, pos.lon, now);
  // Držíme jen nejnovější záznamy, ať historie nenabobtná.
  await db.runAsync(
    'DELETE FROM card_uses WHERE card_id = ? AND id NOT IN (SELECT id FROM card_uses WHERE card_id = ? ORDER BY ts DESC LIMIT ?)',
    id,
    id,
    MAX_USES_PER_CARD,
  );
}

export async function deleteCard(id: number): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM card_uses WHERE card_id = ?', id);
    await db.runAsync('DELETE FROM cards WHERE id = ?', id);
  });
}

export async function listUses(): Promise<CardUse[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ card_id: number; lat: number; lon: number; ts: number }>(
    'SELECT card_id, lat, lon, ts FROM card_uses',
  );
  return rows.map((r) => ({ cardId: r.card_id, lat: r.lat, lon: r.lon, ts: r.ts }));
}

export async function countUses(): Promise<number> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM card_uses');
  return r?.n ?? 0;
}

export async function clearUseHistory(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM card_uses');
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return r?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, value);
}
