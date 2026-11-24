import { NEARBY_RADIUS_M } from './geo';

export type SortMode = 'recent' | 'frequent' | 'name' | 'added' | 'distance';

export const SORT_LABELS: Record<SortMode, string> = {
  recent: 'Naposledy použité',
  frequent: 'Nejčastěji používané',
  name: 'Název (A–Z)',
  added: 'Nově přidané',
  distance: 'Nejblíž místu použití',
};

type Sortable = { id: number; name: string; createdAt: number; lastUsedAt: number | null; useCount: number };

const recentKey = (c: Sortable) => c.lastUsedAt ?? c.createdAt;

export function sortCards<T extends Sortable>(cards: T[], mode: SortMode, distances?: Map<number, number>): T[] {
  const arr = [...cards];
  const byRecent = (a: T, b: T) => recentKey(b) - recentKey(a);
  switch (mode) {
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }) || a.id - b.id);
    case 'added':
      return arr.sort((a, b) => b.createdAt - a.createdAt || b.id - a.id);
    case 'frequent':
      return arr.sort((a, b) => b.useCount - a.useCount || byRecent(a, b));
    case 'distance':
      return arr.sort(
        (a, b) =>
          (distances?.get(a.id) ?? Infinity) - (distances?.get(b.id) ?? Infinity) || byRecent(a, b),
      );
    default:
      return arr.sort(byRecent);
  }
}

export type HomeSections<T> = {
  nearby: { card: T; distance: number }[];
  frequent: T[];
  all: T[];
};

/**
 * Rozdělení domovské obrazovky: „V okolí“ (karty použité poblíž aktuální polohy),
 * „Často používané“ a „Všechny karty“ podle zvoleného řazení.
 */
export function buildSections<T extends Sortable>(
  cards: T[],
  mode: SortMode,
  distances: Map<number, number> | null,
): HomeSections<T> {
  const nearby = distances
    ? cards
        .filter((c) => (distances.get(c.id) ?? Infinity) <= NEARBY_RADIUS_M)
        .map((card) => ({ card, distance: distances.get(card.id)! }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 6)
    : [];
  const nearbyIds = new Set(nearby.map((n) => n.card.id));
  const frequent = cards
    .filter((c) => c.useCount >= 2 && !nearbyIds.has(c.id))
    .sort((a, b) => b.useCount - a.useCount || recentKey(b) - recentKey(a))
    .slice(0, 4);
  return { nearby, frequent, all: sortCards(cards, mode, distances ?? undefined) };
}
