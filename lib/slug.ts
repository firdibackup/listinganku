/**
 * Landing publik hidup di `/{project-slug}`, satu ruang nama dengan rute aplikasi.
 * Slug di daftar ini akan membajak halaman aplikasi, jadi selalu diberi suffix.
 */
export const RESERVED_SLUGS = [
  'dashboard', 'projects', 'project', 'login', 'logout', 'settings', 'leads',
  'api', '_next', 'sitemap.xml', 'robots.txt', 'favicon.ico',
  'agent', 'admin', 'app', 'static', 'assets', 'uploads', 'brand',
] as const;

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

/** Mengembalikan slug bebas bentrok; menambah -2, -3, … bila perlu. */
export function uniqueSlug(base: string, taken: readonly string[]): string {
  const clean = slugify(base) || 'project';
  const used = new Set(taken.map((s) => s.toLowerCase()));
  if (!used.has(clean) && !isReservedSlug(clean)) return clean;

  let n = 2;
  while (used.has(`${clean}-${n}`)) n += 1;
  return `${clean}-${n}`;
}
