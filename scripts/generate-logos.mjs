// Vygeneruje src/data/brandLogos.ts z balíčku simple-icons (CC0).
// Do aplikace se dostanou jen vektorové cesty vybraných značek.
// Spuštění: node scripts/generate-logos.mjs
//
// Pozn.: loga jsou ochranné známky svých vlastníků. Pro osobní použití v aplikaci
// je to v pořádku; pokud aplikaci někdy budete šířit veřejně (obchody s aplikacemi),
// zvažte získání povolení nebo loga odstraňte.
import { writeFileSync } from 'node:fs';
import * as si from 'simple-icons';

// id značky v src/data/brands.ts  →  slug v simple-icons
const MAP = {
  'lidl-plus': 'lidl',
  ikea: 'ikea',
  starbucks: 'starbucks',
  mcdonalds: 'mcdonalds',
  kfc: 'kfc',
  hm: 'handm',
  shell: 'shell',
  tesco: 'tesco',
  penny: 'penny',
  dm: 'dm',
  rossmann: 'rossmann',
  kaufland: 'kaufland',
  globus: 'globus',
  kik: 'kik',
};

const bySlug = new Map(Object.values(si).filter((x) => x && x.slug).map((x) => [x.slug, x]));
const out = {};
for (const [id, slug] of Object.entries(MAP)) {
  const icon = bySlug.get(slug);
  if (!icon) throw new Error(`Chybí ikona ${slug}`);
  out[id] = { path: icon.path, title: icon.title };
}

const body = Object.entries(out)
  .map(([id, v]) => `  ${JSON.stringify(id)}: { title: ${JSON.stringify(v.title)}, path: ${JSON.stringify(v.path)} },`)
  .join('\n');

writeFileSync(
  new URL('../src/data/brandLogos.ts', import.meta.url),
  `// GENEROVANÝ SOUBOR – neupravujte ručně, spusťte scripts/generate-logos.mjs
// Vektorové cesty (viewBox 0 0 24 24) z balíčku simple-icons (CC0).
export const BRAND_LOGOS: Record<string, { title: string; path: string }> = {
${body}
};
`,
);
console.log('Vygenerováno', Object.keys(out).length, 'log');
