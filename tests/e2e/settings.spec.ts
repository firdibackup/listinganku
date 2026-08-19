import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await page.waitForURL(/\/dashboard$/);
});

test('sidebar membawa agen ke Pengaturan dan tab berpindah lewat URL', async ({ page }) => {
  await page.getByRole('link', { name: 'Pengaturan' }).click();
  await page.waitForURL(/\/settings$/);

  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await expect(page.getByText('Tema Situs Profil')).toBeVisible();

  await page.getByRole('link', { name: 'Profil' }).click();
  await page.waitForURL(/\/settings\?tab=profil$/);
  await expect(page.getByRole('link', { name: 'Profil' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByLabel('About Me')).toBeVisible();
});

test('menyimpan perubahan profil dan mempertahankannya setelah muat ulang', async ({ page }) => {
  await page.goto('/settings?tab=profil');

  await page.getByLabel('About Me').fill('Spesialis cluster baru Gading Serpong dan Alam Sutera.');
  await page.getByLabel('Total Closing').fill('71');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByText('Perubahan tersimpan.')).toBeVisible();

  // Muat ulang penuh: membuktikan nilainya benar-benar tertulis di store, bukan
  // hanya tersimpan di state komponen.
  await page.goto('/settings?tab=profil');
  await expect(page.getByLabel('About Me')).toHaveValue('Spesialis cluster baru Gading Serpong dan Alam Sutera.');
  await expect(page.getByLabel('Total Closing')).toHaveValue('71');
});

test('menolak nomor WhatsApp tidak valid tanpa menyimpan apa pun', async ({ page }) => {
  await page.goto('/settings?tab=profil');

  await page.getByLabel('Nomor WhatsApp').fill('12345');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();

  await expect(page.getByText('Masukkan nomor WhatsApp yang valid.')).toBeVisible();
  await expect(page.getByText('Perubahan tersimpan.')).toHaveCount(0);
});

test('unpublish situs profil menghapus kartu live di dashboard, lalu bisa dipublikasikan lagi', async ({ page }) => {
  await page.goto('/settings?tab=umum');
  await page.getByRole('button', { name: 'Unpublish situs profil' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Unpublish situs profil' }).click();

  await expect(page.getByRole('button', { name: 'Publikasikan situs profil' })).toBeVisible();
  await page.goto('/dashboard');
  await expect(page.getByText('audi.listingku.app')).toHaveCount(0);

  // Publikasikan kembali — sekaligus memulihkan state seed. Mock store dipakai
  // bersama seluruh suite e2e, dan login.spec menuntut kartu live ini ada.
  await page.goto('/settings?tab=umum');
  await page.getByRole('button', { name: 'Publikasikan situs profil' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Publikasikan situs profil' }).click();
  await expect(page.getByRole('button', { name: 'Unpublish situs profil' })).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByText('audi.listingku.app')).toBeVisible();
});
