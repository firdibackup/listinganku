import { test, expect } from '@playwright/test';

// Verifikasi sementara §14 #4: dengan AI_MOCK_FAIL=1 di server, Generate AI harus
// menampilkan state error DAN publish tetap berhasil dengan konten manual.
// casa-verde: draft dengan 2 tipe rumah di seed (milik user seed 'usr_audi').
test('AI_MOCK_FAIL: state error muncul dan publish tetap bisa', async ({ page }) => {
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
