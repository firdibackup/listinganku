import { test, expect } from '@playwright/test';

/**
 * Menjaga tema "Tropis Hangat": keempat belas blok terisi seed Parkspring dan
 * dirender server-side, plus dua blok interaktif (tab tipe unit + akordeon FAQ).
 * Suite serial di atas satu mock store — hindari asersi bernilai absolut.
 */
test('keempat belas blok tema terisi dan server-rendered', async ({ request }) => {
  const html = await (await request.get('/parkspring-gading')).text();

  // Konten baru yang hanya hidup kalau di-seed (bukan dari AI):
  expect(html).toContain('Gerbang Tol'); // location.access
  expect(html).toContain('Free BPHTB'); // pricePromo.promos
  expect(html).toContain('Paramount Land'); // developer.name
  expect(html).toContain('Rina Wijaya'); // testimonials
  expect(html).toContain('Akses tol 5 menit'); // hero badge
  expect(html).toContain('Harga mulai'); // hero price bar
});

test('tab tipe unit menukar kartu tanpa reload', async ({ page }) => {
  await page.goto('/parkspring-gading');

  const card = page.locator('.lp-tw-unitcard');
  await expect(card).toContainText('Villa');

  await page.getByRole('tab', { name: 'Midea' }).click();
  await expect(card).toContainText('Midea');
  await expect(card).toContainText('Rp 3,1 M');
});

test('akordeon FAQ membuka satu jawaban dan menutup yang lain', async ({ page }) => {
  await page.goto('/parkspring-gading');

  const first = page.getByRole('button', { name: /Apakah bisa KPR/ });
  await expect(first).toHaveAttribute('aria-expanded', 'true');

  const second = page.getByRole('button', { name: /Kapan serah terima/ });
  await second.click();
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
});
