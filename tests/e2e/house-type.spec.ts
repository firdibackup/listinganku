import { test, expect } from '@playwright/test';

test('menambah tipe rumah ke project lalu memunculkan ajakan Generate AI', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();

  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill('Uji Tipe Rumah');
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan project' }).click();

  await expect(page.getByRole('heading', { name: 'Uji Tipe Rumah' })).toBeVisible();

  await page.getByRole('button', { name: 'Add house type' }).click();
  await page.getByLabel(/Nama tipe/).fill('Villa');
  await page.getByLabel(/Harga/).fill('2450000000');
  await page.getByLabel(/Luas tanah/).fill('90');
  await page.getByLabel(/Luas bangunan/).fill('120');
  await page.getByLabel(/Kamar tidur/).fill('3');
  await page.getByLabel(/Kamar mandi/).fill('2');
  await page.getByLabel(/Carport/).fill('1');
  await page.getByRole('button', { name: 'Simpan tipe' }).click();

  await expect(page.getByText('Villa')).toBeVisible();
  await expect(page.getByText('Rp 2,45 M')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Generate AI' })).toBeVisible();
});

test('menolak harga nol dengan pesan inline', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  // Tanpa menunggu navigasi /dashboard selesai dulu, goto() di bawah ini bisa
  // lebih cepat daripada Server Action signInAction menuliskan cookie sesi —
  // race yang gagal ~100% di lokal (page.goto langsung sesudah click, tanpa
  // locator yang auto-retry) dan melempar balik ke /login lewat middleware.
  // Test pertama di file ini tidak kena karena getByRole().click() berikutnya
  // punya auto-wait bawaan Playwright yang menyerap jeda itu.
  await page.waitForURL(/\/dashboard$/);
  await page.goto('/projects/prj_parkspring');

  await page.getByRole('button', { name: 'Add house type' }).click();
  await page.getByLabel(/Nama tipe/).fill('Tipe Nol');
  await page.getByLabel(/Harga/).fill('0');
  await page.getByRole('button', { name: 'Simpan tipe' }).click();

  await expect(page.getByText('Harga harus lebih dari nol.')).toBeVisible();
});
