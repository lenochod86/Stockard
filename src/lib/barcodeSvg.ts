import bwipjs from 'bwip-js/browser';
import { CodeFormat, FORMATS } from './codes';

export type RenderedCode = { svg: string; ok: true } | { ok: false; error: string };

/**
 * Vykreslí kód do SVG řetězce (čistý JS, žádné nativní moduly, funguje offline).
 */
export function renderCodeSvg(format: CodeFormat, value: string): RenderedCode {
  const info = FORMATS[format];
  try {
    const svg = bwipjs.toSVG({
      bcid: info.bwip,
      text: value,
      // Čárové kódy: rozumná výška. 2D kódy si velikost určí samy.
      ...(info.square ? { scale: 1 } : { height: 18, scale: 1 }),
      paddingwidth: 4,
      paddingheight: 4,
      backgroundcolor: 'FFFFFF',
      barcolor: '000000',
      // QR s vyšší korekcí chyb snese horší displej/odlesky
      ...(format === 'qr' ? { eclevel: 'M' } : {}),
    });
    return { ok: true, svg };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Rychlá validace pro ruční zadání. */
export function validateCode(format: CodeFormat, value: string): string | null {
  if (!value.trim()) return 'Zadejte číslo nebo obsah kódu.';
  const r = renderCodeSvg(format, value);
  if (r.ok) return null;
  const m = r.error.replace(/^bwipp\.[A-Za-z0-9]+#?\d*:\s*/, '');
  return `Hodnota se nehodí pro ${FORMATS[format].label}: ${m}`;
}
