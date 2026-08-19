import { test, expect } from '@playwright/test';

/**
 * Verifikasi §14 #4: dengan AI_MOCK_FAIL=1 di server, Generate AI harus
 * menampilkan state error DAN publish tetap berhasil dengan konten manual.
 *
 * Spec ini TIDAK ikut `npm run test:e2e` biasa. Ia butuh dev server yang
 * dijalankan dengan AI_MOCK_FAIL=1, sedangkan webServer di playwright.config.ts
 * menjalankan `npm run dev` polos — tanpa gate di bawah, spec ini selalu merah
 * di suite default karena mock AI justru sukses.
 *
 * Jalankan sendirian, dari seed bersih:
 *   bash:       npm run seed:reset && AI_MOCK_FAIL=1 npx playwright test zz-ai-failure
 *   PowerShell: npm run seed:reset; $env:AI_MOCK_FAIL=1; npx playwright test zz-ai-failure
 *
 * Nama file diawali "zz" dengan sengaja: Playwright menjalankan file berurutan
 * abjad di atas satu mock store bersama, dan tes ini MEMPUBLIKASIKAN casa-verde.
 * Kalau ia berjalan lebih dulu, landing-ssr.spec.ts yang menuntut casa-verde
 * masih draft (404 + absen dari sitemap) akan gagal.
 */
test('AI_MOCK_FAIL: state error muncul dan publish tetap bisa', async ({ page }) => {
  test.skip(process.env.AI_MOCK_FAIL !== '1', 'Butuh server dengan AI_MOCK_FAIL=1 — lihat komentar di atas.');

  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await page.waitForURL(/\/dashboard$/);

  await page.goto('/projects/prj_casaverde/generate');
  await page.getByRole('button', { name: 'Generate AI' }).click();

  // Mock menunggu delay lalu melempar AiGenerationError → action ok:false → state error.
  await expect(page.getByText('AI sedang gangguan')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/AI opsional/)).toBeVisible();

  // Meski AI gagal, publish tetap jalan (konten manual, tanpa ai_content).
  await page.goto('/projects/prj_casaverde/publish');
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();
  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();
});
