import { test, expect } from '@playwright/test';

test('mengarahkan pengunjung tanpa sesi ke halaman login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('login membawa agen ke dashboard yang berisi data seed', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  await expect(page.getByText('Parkspring Gading')).toBeVisible();
  await expect(page.getByText('audi.listingku.app')).toBeVisible();
});
