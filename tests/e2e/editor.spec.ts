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

test('menampilkan seluruh sebelas blok dalam urutan default', async ({ page }) => {
  const rows = page.getByRole('button', { name: /^Blok / });
  await expect(rows).toHaveCount(11);
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
  // Seed belum punya konten AI, jadi blok FAQ kosong dan tidak dirender.
  await expect(page.locator('.ed__preview').getByRole('heading', { name: /Pertanyaan yang sering/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Blok FAQ' }).click();
  const toggle = page.getByRole('switch', { name: 'Tampilkan blok' });
  await expect(toggle).toBeVisible();
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

test('menaikkan urutan blok Galeri', async ({ page }) => {
  await page.getByRole('button', { name: 'Naikkan Galeri' }).click();
  await expect(page.getByRole('button', { name: /^Blok / }).first()).toHaveAccessibleName('Blok Galeri');
});

test('tema Showcase dan Luxury tampil nonaktif sampai desainnya masuk', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Showcase' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Luxury' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Modern' })).toBeEnabled();
});
