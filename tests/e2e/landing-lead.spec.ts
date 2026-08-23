import { test, expect } from '@playwright/test';

test('form kontak menyimpan lead dan menampilkan konfirmasi datar', async ({ page }) => {
  await page.goto('/parkspring-gading');

  await page.getByLabel('Nama').fill('Rina Wijaya');
  await page.getByLabel(/Nomor WhatsApp/).fill('081322449087');
  await page.getByLabel('Pesan').fill('Tipe Midea masih ada unit hadap timur?');
  await page.getByRole('button', { name: 'Kirim pesan' }).click();

  await expect(page.getByText('Permintaan terkirim')).toBeVisible();
});

test('menolak nomor telepon yang tidak valid', async ({ page }) => {
  await page.goto('/parkspring-gading');
  await page.getByLabel('Nama').fill('Rina');
  await page.getByLabel(/Nomor WhatsApp/).fill('123');
  await page.getByLabel('Pesan').fill('Halo');
  await page.getByRole('button', { name: 'Kirim pesan' }).click();

  await expect(page.getByText('Masukkan nomor WhatsApp yang valid.')).toBeVisible();
});

test('tautan WhatsApp mengarah ke wa.me dengan pesan awal', async ({ page }) => {
  await page.goto('/parkspring-gading');
  const link = page.getByRole('link', { name: 'WhatsApp' }).first();
  const href = await link.getAttribute('href');
  expect(href).toContain('wa.me/6281288994410');
  expect(decodeURIComponent(href ?? '')).toContain('Parkspring');
});

test('di layar mobile sticky CTA bar tampil dan Minta info melompat ke form kontak', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/parkspring-gading');

  const bar = page.locator('.lp__stickybar');
  await expect(bar).toBeVisible();
  await expect(bar.getByRole('link', { name: 'WhatsApp' })).toBeVisible();

  await bar.getByRole('link', { name: 'Minta info' }).click();
  await expect(page.locator('#minta-info')).toBeInViewport();
});

/**
 * Landing sekarang mobile-only: di layar lebar bingkai 390px dipusatkan, bukan
 * dilebarkan, jadi sticky bar TETAP tampil — dan lebarnya ikut bingkai, bukan
 * viewport. Dulu tes ini menuntut bar tersembunyi di desktop; itu perilaku
 * layout desktop yang sudah dihapus.
 */
test('di desktop bingkai tetap selebar mobile dan sticky bar ikut bingkai', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/parkspring-gading');

  const bar = page.locator('.lp__stickybar');
  await expect(bar).toBeVisible();

  const frame = await page.locator('.lp').boundingBox();
  const barBox = await bar.boundingBox();
  expect(frame?.width).toBeLessThanOrEqual(390);
  expect(barBox?.width).toBeLessThanOrEqual(390);
});
