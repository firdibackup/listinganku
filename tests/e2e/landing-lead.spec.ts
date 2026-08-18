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
  const link = page.getByRole('link', { name: 'Chat WhatsApp' }).first();
  const href = await link.getAttribute('href');
  expect(href).toContain('wa.me/6281288994410');
  expect(decodeURIComponent(href ?? '')).toContain('Parkspring Gading');
});
