import * as Location from 'expo-location';
import { getSetting, setSetting } from './db';
import type { LatLon } from './geo';

const KEY = 'location_suggestions';

/** null = ještě jsme se neptali, true/false = volba uživatele. */
export async function getLocationPref(): Promise<boolean | null> {
  const v = await getSetting(KEY);
  return v === null ? null : v === 'on';
}

export async function setLocationPref(on: boolean): Promise<void> {
  await setSetting(KEY, on ? 'on' : 'off');
}

/** Vyžádá oprávnění „při používání aplikace“ (žádná poloha na pozadí). */
export async function askLocationPermission(): Promise<boolean> {
  try {
    const cur = await Location.getForegroundPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    return (await Location.requestForegroundPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

/**
 * Aktuální poloha, nikdy nevyvolává dotaz na oprávnění a nikdy nevyhodí chybu.
 * `fast`: stačí poslední známá poloha (do 5 minut) – okamžitá odpověď.
 */
export async function getPosition(fast: boolean): Promise<LatLon | null> {
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted) return null;
    const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000, requiredAccuracy: 500 });
    if (last) return { lat: last.coords.latitude, lon: last.coords.longitude };
    if (fast) return null;
    const cur = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 6000);
    return cur ? { lat: cur.coords.latitude, lon: cur.coords.longitude } : null;
  } catch {
    return null;
  }
}

/** Pokud jsou návrhy podle polohy zapnuté, vrátí aktuální polohu, jinak null. */
export async function getPositionIfEnabled(fast: boolean): Promise<LatLon | null> {
  if ((await getLocationPref()) !== true) return null;
  return getPosition(fast);
}
