// Jednotná definice typů kódů: jak se jmenují v expo-camera, jak v bwip-js
// a jak se mají zobrazit uživateli.

export type CodeFormat =
  | 'qr'
  | 'code128'
  | 'ean13'
  | 'ean8'
  | 'upc_a'
  | 'upc_e'
  | 'code39'
  | 'code93'
  | 'itf'
  | 'codabar'
  | 'pdf417'
  | 'aztec'
  | 'datamatrix';

export type CodeKind = 'qr' | 'barcode';

type FormatInfo = {
  label: string;
  bwip: string;
  /** 2D kód (čtvercový) vs. klasický čárový kód */
  kind: CodeKind;
  /** Přidat do plné šířky? 2D kódy ne. */
  square: boolean;
  /** Numerický vstup? (jen pro nápovědu v UI) */
  numeric?: boolean;
};

export const FORMATS: Record<CodeFormat, FormatInfo> = {
  qr: { label: 'QR kód', bwip: 'qrcode', kind: 'qr', square: true },
  aztec: { label: 'Aztec', bwip: 'azteccode', kind: 'qr', square: true },
  datamatrix: { label: 'Data Matrix', bwip: 'datamatrix', kind: 'qr', square: true },
  pdf417: { label: 'PDF417', bwip: 'pdf417', kind: 'barcode', square: false },
  code128: { label: 'Code 128', bwip: 'code128', kind: 'barcode', square: false },
  ean13: { label: 'EAN-13', bwip: 'ean13', kind: 'barcode', square: false, numeric: true },
  ean8: { label: 'EAN-8', bwip: 'ean8', kind: 'barcode', square: false, numeric: true },
  upc_a: { label: 'UPC-A', bwip: 'upca', kind: 'barcode', square: false, numeric: true },
  upc_e: { label: 'UPC-E', bwip: 'upce', kind: 'barcode', square: false, numeric: true },
  code39: { label: 'Code 39', bwip: 'code39', kind: 'barcode', square: false },
  code93: { label: 'Code 93', bwip: 'code93', kind: 'barcode', square: false },
  itf: { label: 'ITF (2 z 5)', bwip: 'interleaved2of5', kind: 'barcode', square: false, numeric: true },
  codabar: { label: 'Codabar', bwip: 'rationalizedCodabar', kind: 'barcode', square: false },
};

/** Pořadí v ručním výběru – nejčastější nahoře. */
export const FORMAT_ORDER: CodeFormat[] = [
  'code128',
  'ean13',
  'qr',
  'ean8',
  'code39',
  'upc_a',
  'itf',
  'pdf417',
  'aztec',
  'datamatrix',
  'codabar',
  'code93',
  'upc_e',
];

/**
 * Převede název typu z expo-camera / ZXing / starších iOS konstant
 * na náš formát. Neznámé typy vrací null.
 */
export function normalizeFormat(raw: string | undefined | null): CodeFormat | null {
  if (!raw) return null;
  const k = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (k.includes('qr')) return 'qr';
  if (k.includes('aztec')) return 'aztec';
  if (k.includes('datamatrix')) return 'datamatrix';
  if (k.includes('pdf417')) return 'pdf417';
  if (k.includes('ean13')) return 'ean13';
  if (k.includes('ean8')) return 'ean8';
  if (k.includes('upca')) return 'upc_a';
  if (k.includes('upce')) return 'upc_e';
  if (k.includes('code128')) return 'code128';
  if (k.includes('code39')) return 'code39';
  if (k.includes('code93')) return 'code93';
  if (k.includes('itf') || k.includes('interleaved') || k.includes('i25')) return 'itf';
  if (k.includes('codabar')) return 'codabar';
  return null;
}

/** Typy, které předáváme kameře ke skenování (vše, co umíme vykreslit). */
export const SCAN_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'itf14',
  'codabar',
  'pdf417',
  'aztec',
  'datamatrix',
] as const;
