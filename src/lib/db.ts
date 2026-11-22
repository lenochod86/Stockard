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
  createdAt: number;
  lastUsedAt: number | null;
};

type Row = {
  id: number;
  name: string;
  value: string;
  format: string;
  color: string;
  notes: string;
  brand_id: string | null;
  created_at: number;
  last_used_at: number | null;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      // Soubor je uložen v privátním úložišti aplikace – nikam se neodesílá.
      const db = await SQLite.openDatabaseAsync('cards.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
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
      return db;
    })();
  }
  return dbPromise;
}

const fromRow = (r: Row): Card => ({
  id: r.id,
  name: r.name,
  value: r.value,
  format: r.format as CodeFormat,
  color: r.color,
  notes: r.notes,
  brandId: r.brand_id,
  createdAt: r.created_at,
  lastUsedAt: r.last_used_at,
});

export async function listCards(): Promise<Card[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM cards ORDER BY COALESCE(last_used_at, created_at) DESC',
  );
  return rows.map(fromRow);
}

export async function getCard(id: number): Promise<Card | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<Row>('SELECT * FROM cards WHERE id = ?', id);
  return r ? fromRow(r) : null;
}

export type CardInput = Pick<Card, 'name' | 'value' | 'format' | 'color' | 'notes' | 'brandId'>;

export async function addCard(c: CardInput): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    'INSERT INTO cards (name, value, format, color, notes, brand_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    c.name,
    c.value,
    c.format,
    c.color,
    c.notes,
    c.brandId,
    Date.now(),
  );
  return res.lastInsertRowId;
}

export async function updateCard(id: number, c: CardInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE cards SET name = ?, value = ?, format = ?, color = ?, notes = ?, brand_id = ? WHERE id = ?',
    c.name,
    c.value,
    c.format,
    c.color,
    c.notes,
    c.brandId,
    id,
  );
}

export async function touchCard(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE cards SET last_used_at = ? WHERE id = ?', Date.now(), id);
}

export async function deleteCard(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM cards WHERE id = ?', id);
}
