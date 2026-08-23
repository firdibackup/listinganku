import raw from '@/data/id-regions.json';

export interface Region {
  district: string;
  city: string;
  province: string;
}

/**
 * Dataset administratif berhenti di KECAMATAN. Nama kawasan komersial
 * ("Gading Serpong", "BSD City", "Alam Sutera") bukan unit administratif dan
 * tidak akan pernah ada di sini — itulah sebabnya LocationDetail punya field
 * `area` bebas yang terpisah.
 *
 * Diimpor statis (bukan dibaca lewat fs) supaya modul ini aman dipakai dari
 * route handler tanpa menyeret node:fs.
 */
const REGIONS = raw as Region[];

/** Lipat diakritik dan rapatkan spasi supaya "Cikupa " dan "cikupa" cocok. */
const norm = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');

const HAYSTACK = REGIONS.map((r) => ({ region: r, key: norm(`${r.district} ${r.city} ${r.province}`) }));

/**
 * Kecocokan AWALAN didahulukan supaya mengetik "serpong" memunculkan kecamatan
 * Serpong sebelum kecamatan lain yang kebetulan berada di Tangerang Selatan.
 */
export function searchRegions(q: string, limit = 8): Region[] {
  const needle = norm(q);
  if (needle.length < 2) return [];

  const prefix: Region[] = [];
  const contains: Region[] = [];
  for (const { region, key } of HAYSTACK) {
    if (norm(region.district).startsWith(needle) || key.startsWith(needle)) prefix.push(region);
    else if (key.includes(needle)) contains.push(region);
    if (prefix.length >= limit) break;
  }
  return [...prefix, ...contains].slice(0, limit);
}

/** Baris kedua di combobox. */
export const formatRegion = (r: Region): string => `${r.district}, ${r.city}, ${r.province}`;

/**
 * String tampilan yang disimpan ke `project.location`. Kawasan didahulukan
 * karena itulah yang dikenali pembeli; provinsi dibuang supaya baris subjudul
 * hero tidak kepanjangan di lebar 390px.
 */
export function composeLocationLabel(d: {
  area: string; district: string; city: string; province: string;
}): string {
  return [d.area, d.district, d.city].map((s) => s.trim()).filter(Boolean).join(', ');
}
