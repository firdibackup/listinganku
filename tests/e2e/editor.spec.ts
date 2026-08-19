import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  // Tunggu sesi benar-benar terpasang (signInAction redirect ke /dashboard)
  // SEBELUM membuka editor — tanpa ini, request editor berlomba mendahului
  // cookie sesi dan middleware memantulkannya kembali ke /login.
  await page.waitForURL(/\/dashboard$/);
  await page.goto('/projects/prj_parkspring/editor');
});

test('menampilkan seluruh empat belas blok dalam urutan default tema', async ({ page }) => {
  const rows = page.getByRole('button', { name: /^Blok / });
  await expect(rows).toHaveCount(14);
  await expect(rows.first()).toHaveAccessibleName('Blok Hero');
});

test('mengedit judul hero dan melihatnya di pratinjau', async ({ page }) => {
  await page.getByRole('button', { name: 'Blok Hero' }).click();
  // exact: 'Judul' saja tanpa ini juga cocok dengan 'Subjudul' (getByLabel memakai
  // substring match) — dua field itu hidup berdampingan di panel setelan Hero.
  await page.getByLabel('Judul', { exact: true }).fill('Judul hasil edit manual');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();

  await expect(page.getByText('Tersimpan')).toBeVisible();
  await expect(page.locator('.ed__preview').getByRole('heading', { level: 1 }))
    .toHaveText('Judul hasil edit manual');
});

test('panel blok FAQ menyediakan toggle tampil/sembunyi', async ({ page }) => {
  // Seed Parkspring mengisi FAQ, jadi blok ini dirender di pratinjau.
  const faqItem = page.locator('.ed__preview').getByText('Apakah bisa KPR?');
  await expect(faqItem).toBeVisible();

  await page.getByRole('button', { name: 'Blok FAQ' }).click();
  const toggle = page.getByRole('switch', { name: 'Tampilkan blok' });
  await expect(toggle).toBeVisible();
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  // Menonaktifkan blok mengeluarkannya dari pratinjau (resolveBlocks melewati disabled).
  await expect(faqItem).toHaveCount(0);
});

test('menaikkan urutan blok Lokasi ke atas Hero', async ({ page }) => {
  await page.getByRole('button', { name: 'Naikkan Lokasi' }).click();
  await expect(page.getByRole('button', { name: /^Blok / }).first()).toHaveAccessibleName('Blok Lokasi');
});

test('tema yang layoutnya sudah dibangun aktif; sisanya nonaktif sampai masuk', async ({ page }) => {
  // Label palet sama dengan label tema, jadi scope ke .ed__themes agar tidak
  // bentrok dengan swatch di .ed__palettes.
  const themes = page.locator('.ed__themes');
  await expect(themes.getByRole('button', { name: 'Tropis Hangat' })).toBeEnabled();
  await expect(themes.getByRole('button', { name: 'Editorial Putih' })).toBeEnabled();
  await expect(themes.getByRole('button', { name: 'Korporat Biru' })).toBeDisabled();
});

test('memilih swatch palet mengubah pratinjau tanpa reload', async ({ page }) => {
  const preview = page.locator('.ed__preview');
  await expect(preview).toHaveAttribute('data-lp-palette', 'tropicalWarm');
  await page.locator('.ed__palettes').getByRole('button', { name: 'Premium Gelap' }).click();
  await expect(preview).toHaveAttribute('data-lp-palette', 'premiumDark');
});
