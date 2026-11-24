export type LatLon = { lat: number; lon: number };

/** Do jaké vzdálenosti od dřívějšího použití považujeme kartu za „v okolí“. */
export const NEARBY_RADIUS_M = 250;

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;

/** Vzdálenost dvou bodů v metrech (haversine). */
export function distanceM(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Pro každou kartu nejmenší vzdálenost od aktuální polohy k některému dřívějšímu použití. */
export function nearestUseDistances(
  uses: { cardId: number; lat: number; lon: number }[],
  pos: LatLon,
): Map<number, number> {
  const out = new Map<number, number>();
  for (const u of uses) {
    const d = distanceM(pos, u);
    const prev = out.get(u.cardId);
    if (prev === undefined || d < prev) out.set(u.cardId, d);
  }
  return out;
}

export function formatDistance(m: number): string {
  if (m < 50) return 'tady';
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',')} km`;
}
