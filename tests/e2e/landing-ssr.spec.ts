import { test, expect } from '@playwright/test';

test('landing publik dirender di server, bukan di klien', async ({ request }) => {
  const response = await request.get('/parkspring-gading');
  expect(response.status()).toBe(200);

  const html = await response.text();
  // Dibuktikan lewat HTML mentah — bukan setelah hidrasi.
  expect(html).toContain('Parkspring');
  expect(html).toContain('Rp 2,6 M');
  expect(html).toContain('"@type":"RealEstateListing"');
  expect(html).toMatch(/<link[^>]+rel="canonical"/);
});

test('project draft tidak dapat diakses publik', async ({ request }) => {
  const response = await request.get('/casa-verde-alam-sutera');
  expect(response.status()).toBe(404);

  // Status 404 saja tidak cukup: pastikan draft tidak bocor lewat metadata
  // atau JSON-LD yang sempat dirender sebelum notFound() dipanggil.
  const html = await response.text();
  expect(html).not.toContain('Casa Verde Alam Sutera');
  expect(html).not.toContain('RealEstateListing');
});

test('sitemap dan robots hanya memuat project published', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/parkspring-gading');
  expect(sitemap).not.toContain('/casa-verde-alam-sutera');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
});

test('slug bertabrakan dengan rute terpisah tidak dibajak oleh halaman landing', async ({ request }) => {
  // Next.js selalu mengutamakan segmen statis /dashboard di atas segmen
  // dinamis [slug] pada level yang sama. Tanpa memeriksa ini, regresi pada
  // urutan resolusi rute bisa membuat [slug] diam-diam menelan /dashboard.
  const response = await request.get('/dashboard');
  expect(response.status()).not.toBe(404);
  const html = await response.text();
  expect(html).not.toContain('"@type":"RealEstateListing"');
});
