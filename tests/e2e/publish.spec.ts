import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  // Tunggu sesi terpasang sebelum tiap test membuka rute dashboard, kalau tidak
  // request halaman mendahului cookie sesi dan middleware memantulkannya ke /login.
  await page.waitForURL(/\/dashboard$/);
});

test('mempublikasikan project draft setelah konfirmasi', async ({ page }) => {
  await page.goto('/projects/prj_casaverde/publish');
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();

  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();
  await expect(page.getByText('listingku.app/casa-verde-alam-sutera')).toBeVisible();
});

test('menyediakan QR dalam PNG dan SVG untuk project yang sudah live', async ({ page, request }) => {
  await page.goto('/projects/prj_parkspring/publish');
  await expect(page.getByRole('img', { name: /QR/ })).toBeVisible();

  const png = await request.get('/api/qr?slug=parkspring-gading&format=png');
  expect(png.headers()['content-type']).toContain('image/png');

  const svg = await request.get('/api/qr?slug=parkspring-gading&format=svg');
  expect(await svg.text()).toContain('<svg');
});

test('menolak QR untuk project yang belum published', async ({ request }) => {
  expect((await request.get('/api/qr?slug=tidak-ada&format=png')).status()).toBe(404);
});
