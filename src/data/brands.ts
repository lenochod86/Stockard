import { CodeKind } from '../lib/codes';

export type Brand = {
  id: string;
  name: string;
  color: string;
  /**
   * Co s největší pravděpodobností karta používá. Je to jen nápověda pro výběr –
   * skutečný typ se vždy zjistí ze skenu, případně ho lze změnit ručně.
   * Řetězce karty časem mění, proto tenhle seznam upravujte podle potřeby.
   */
  kind: CodeKind;
  category: 'Potraviny' | 'Drogerie' | 'Obchody' | 'Palivo' | 'Jídlo a pití' | 'Zdraví' | 'Cestování' | 'Jiné';
};

export const BRANDS: Brand[] = [
  // Potraviny
  { id: 'albert', name: 'Albert', color: '#00A0E3', kind: 'barcode', category: 'Potraviny' },
  { id: 'billa', name: 'Billa', color: '#FFD100', kind: 'barcode', category: 'Potraviny' },
  { id: 'lidl-plus', name: 'Lidl Plus', color: '#0050AA', kind: 'qr', category: 'Potraviny' },
  { id: 'kaufland', name: 'Kaufland Card', color: '#E10915', kind: 'barcode', category: 'Potraviny' },
  { id: 'penny', name: 'Penny', color: '#CD1719', kind: 'barcode', category: 'Potraviny' },
  { id: 'tesco', name: 'Tesco Clubcard', color: '#00539F', kind: 'barcode', category: 'Potraviny' },
  { id: 'globus', name: 'Globus', color: '#F07E00', kind: 'barcode', category: 'Potraviny' },
  { id: 'coop', name: 'COOP', color: '#E30613', kind: 'barcode', category: 'Potraviny' },
  { id: 'makro', name: 'Makro', color: '#002D72', kind: 'barcode', category: 'Potraviny' },
  { id: 'hruska', name: 'Hruška', color: '#6DB33F', kind: 'barcode', category: 'Potraviny' },
  { id: 'rohlik', name: 'Rohlík.cz', color: '#E3001B', kind: 'qr', category: 'Potraviny' },

  // Drogerie
  { id: 'dm', name: 'dm drogerie markt', color: '#00A0DF', kind: 'qr', category: 'Drogerie' },
  { id: 'rossmann', name: 'Rossmann', color: '#C50E1F', kind: 'barcode', category: 'Drogerie' },
  { id: 'teta', name: 'Teta drogerie', color: '#E2001A', kind: 'barcode', category: 'Drogerie' },
  { id: 'sephora', name: 'Sephora', color: '#000000', kind: 'barcode', category: 'Drogerie' },
  { id: 'notino', name: 'Notino', color: '#1A1A1A', kind: 'barcode', category: 'Drogerie' },
  { id: 'marionnaud', name: 'Marionnaud', color: '#6C2C83', kind: 'barcode', category: 'Drogerie' },

  // Obchody
  { id: 'ikea', name: 'IKEA Family', color: '#0058A3', kind: 'barcode', category: 'Obchody' },
  { id: 'decathlon', name: 'Decathlon', color: '#0082C3', kind: 'barcode', category: 'Obchody' },
  { id: 'hornbach', name: 'Hornbach', color: '#F58220', kind: 'barcode', category: 'Obchody' },
  { id: 'obi', name: 'OBI', color: '#FF6600', kind: 'barcode', category: 'Obchody' },
  { id: 'datart', name: 'Datart', color: '#E30613', kind: 'barcode', category: 'Obchody' },
  { id: 'electroworld', name: 'Electro World', color: '#E4002B', kind: 'barcode', category: 'Obchody' },
  { id: 'alza', name: 'Alza', color: '#F58220', kind: 'qr', category: 'Obchody' },
  { id: 'hm', name: 'H&M', color: '#E50010', kind: 'barcode', category: 'Obchody' },
  { id: 'tchibo', name: 'Tchibo', color: '#00508C', kind: 'barcode', category: 'Obchody' },
  { id: 'pepco', name: 'Pepco', color: '#E2001A', kind: 'qr', category: 'Obchody' },
  { id: 'kik', name: 'KiK', color: '#E30613', kind: 'barcode', category: 'Obchody' },

  // Palivo
  { id: 'benzina', name: 'Benzina / Orlen', color: '#E30613', kind: 'barcode', category: 'Palivo' },
  { id: 'shell', name: 'Shell ClubSmart', color: '#FBCE07', kind: 'qr', category: 'Palivo' },
  { id: 'mol', name: 'MOL Move', color: '#E2001A', kind: 'qr', category: 'Palivo' },
  { id: 'omv', name: 'OMV', color: '#003B80', kind: 'barcode', category: 'Palivo' },
  { id: 'eurooil', name: 'EuroOil', color: '#00A651', kind: 'barcode', category: 'Palivo' },

  // Jídlo a pití
  { id: 'starbucks', name: 'Starbucks', color: '#00704A', kind: 'qr', category: 'Jídlo a pití' },
  { id: 'mcdonalds', name: "McDonald's", color: '#DA291C', kind: 'qr', category: 'Jídlo a pití' },
  { id: 'kfc', name: 'KFC', color: '#E4002B', kind: 'qr', category: 'Jídlo a pití' },
  { id: 'costa', name: 'Costa Coffee', color: '#6D1F2C', kind: 'qr', category: 'Jídlo a pití' },

  // Zdraví
  { id: 'drmax', name: 'Dr.Max', color: '#00A651', kind: 'barcode', category: 'Zdraví' },
  { id: 'benu', name: 'BENU', color: '#00A3E0', kind: 'barcode', category: 'Zdraví' },
  { id: 'pilulka', name: 'Pilulka', color: '#00A19A', kind: 'barcode', category: 'Zdraví' },

  // Cestování
  { id: 'cd', name: 'České dráhy (In Karta)', color: '#003B80', kind: 'barcode', category: 'Cestování' },
  { id: 'regiojet', name: 'RegioJet', color: '#FFCC00', kind: 'qr', category: 'Cestování' },
  { id: 'flixbus', name: 'FlixBus', color: '#73D700', kind: 'qr', category: 'Cestování' },
];

export const BRAND_BY_ID: Record<string, Brand> = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

export const CARD_COLORS = [
  '#E53935',
  '#F4511E',
  '#FB8C00',
  '#FDD835',
  '#7CB342',
  '#00897B',
  '#00A0E3',
  '#1E5AA8',
  '#5E35B1',
  '#D81B60',
  '#6D4C41',
  '#455A64',
  '#000000',
];

/** Čitelná barva textu na pozadí dané barvy. */
export function onColor(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#111111' : '#FFFFFF';
}
