import { Camera } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource,
} from '@zxing/library';
import { CodeFormat, normalizeFormat, SCAN_TYPES } from './codes';

export type ScanResult = { value: string; format: CodeFormat };

const ZX_TO_FORMAT: Partial<Record<number, CodeFormat>> = {
  [BarcodeFormat.QR_CODE]: 'qr',
  [BarcodeFormat.CODE_128]: 'code128',
  [BarcodeFormat.CODE_39]: 'code39',
  [BarcodeFormat.CODE_93]: 'code93',
  [BarcodeFormat.EAN_13]: 'ean13',
  [BarcodeFormat.EAN_8]: 'ean8',
  [BarcodeFormat.UPC_A]: 'upc_a',
  [BarcodeFormat.UPC_E]: 'upc_e',
  [BarcodeFormat.ITF]: 'itf',
  [BarcodeFormat.CODABAR]: 'codabar',
  [BarcodeFormat.PDF_417]: 'pdf417',
  [BarcodeFormat.AZTEC]: 'aztec',
  [BarcodeFormat.DATA_MATRIX]: 'datamatrix',
};

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Dekóduje RGBA pixely pomocí ZXing (čistý JS – funguje na iOS i Androidu). */
export function decodePixels(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): ScanResult | null {
  // ZXing chce Int32 ARGB pole nebo luminance; RGBLuminanceSource bere Int32Array ARGB.
  const argb = new Int32Array(width * height);
  for (let i = 0, p = 0; i < argb.length; i++, p += 4) {
    argb[i] = (0xff << 24) | (rgba[p] << 16) | (rgba[p + 1] << 8) | rgba[p + 2];
  }
  const hints = new Map<DecodeHintType, unknown>();
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.POSSIBLE_FORMATS, Object.keys(ZX_TO_FORMAT).map(Number));
  const reader = new MultiFormatReader();
  reader.setHints(hints as Map<DecodeHintType, any>);
  const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(argb, width, height)));
  try {
    const res = reader.decode(bitmap);
    const format = ZX_TO_FORMAT[res.getBarcodeFormat()];
    if (!format) return null;
    return { value: res.getText(), format };
  } catch {
    return null;
  }
}

async function scanWithZxing(uri: string): Promise<ScanResult | null> {
  // Zkusíme několik velikostí – příliš velký obrázek je pomalý, příliš malý ztratí detail.
  for (const width of [1400, 900, 2000]) {
    try {
      const img = await manipulateAsync(uri, [{ resize: { width } }], {
        format: SaveFormat.JPEG,
        compress: 1,
        base64: true,
      });
      if (!img.base64) continue;
      const decoded = jpeg.decode(base64ToBytes(img.base64), { useTArray: true, formatAsRGBA: true });
      const res = decodePixels(decoded.data, decoded.width, decoded.height);
      if (res) return res;
    } catch {
      // zkusit další velikost
    }
  }
  return null;
}

/**
 * Načte kód z obrázku. Nejdřív nativní skener (rychlý; na iOS jen QR),
 * pak JS fallback (ZXing), který zvládne všechny čárové kódy i na iOS.
 */
export async function scanImage(uri: string): Promise<ScanResult | null> {
  try {
    const native = await Camera.scanFromURLAsync(uri, [...SCAN_TYPES]);
    for (const r of native) {
      const format = normalizeFormat(r.type);
      if (format && r.data) return { value: r.data, format };
    }
  } catch {
    // nativní sken selhal → fallback níže
  }
  return scanWithZxing(uri);
}
