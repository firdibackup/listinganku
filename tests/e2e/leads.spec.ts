import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  // Tunggu sesi terpasang sebelum membuka rute dashboard — kalau tidak, request
  // halaman mendahului cookie sesi dan middleware memantulkannya ke /login.
  await page.waitForURL(/\/dashboard$/);
});

test('sidebar membawa agen ke halaman Leads dan menandainya aktif', async ({ page }) => {
  await page.getByRole('link', { name: 'Leads' }).click();
  await page.waitForURL(/\/leads$/);

  await expect(page.getByRole('heading', { name: 'Leads', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Leads' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current', 'page');
});

test('menampilkan lead seed dengan metrik yang dihitung dari event', async ({ page }) => {
  await page.goto('/leads');

  // Sengaja TANPA jumlah baris absolut: seluruh suite e2e berbagi satu mock
  // store dan landing-lead.spec (urutan abjad lebih dulu) menambah lead baru.
  // Yang diuji adalah "lead seed tampil", bukan "jumlahnya persis lima".
  // .first(): landing-lead.spec mengirim nama DAN nomor yang sama persis dengan
  // lead seed (keduanya dari fixture design yang sama), jadi saat suite penuh
  // berjalan baris "Rina Wijaya" ada dua. Yang diuji adalah kehadirannya.
  for (const nama of ['Rina Wijaya', 'Hendra S.', 'Melisa Tanuwijaya', 'Bayu Prakoso', 'Dewi Anggraini']) {
    await expect(page.getByRole('cell', { name: nama }).first()).toBeVisible();
  }
  await expect(page.getByRole('cell', { name: '0813-2244-9087' }).first()).toBeVisible();

  // Metrik berasal dari event sungguhan, bukan angka hias. Seed memberi 1.842
  // visitor (angka file design), dan spec lain yang membuka landing page hanya
  // MENAMBAH hitungan itu — jadi batas bawah, bukan kesamaan persis.
  const visitors = page.locator('.dash__metric').filter({ hasText: 'Visitors' }).locator('dd').first();
  const terbaca = Number((await visitors.innerText()).replace(/\./g, ''));
  expect(terbaca).toBeGreaterThanOrEqual(1842);

  await expect(page.locator('.dash__metric').filter({ hasText: 'Conversion' })).toContainText('%');
});

test('filter status menyaring tabel lewat URL yang bisa dibagikan', async ({ page }) => {
  await page.goto('/leads');
  // Dropdown filter adalah <details>: isinya belum ada di accessibility tree
  // sebelum disclosure-nya dibuka, persis seperti yang dialami pengguna.
  // Teks "Semua status" muncul dua kali (summary + opsi reset di dalam menu),
  // jadi target elemen summary-nya secara eksplisit.
  await page.locator('summary').filter({ hasText: 'Semua status' }).click();
  await page.getByRole('link', { name: 'Deal', exact: true }).click();
  await page.waitForURL(/\/leads\?status=deal$/);

  await expect(page.getByRole('cell', { name: 'Dewi Anggraini' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Rina Wijaya' })).toHaveCount(0);

  // Membuka URL yang sama langsung harus memberi hasil sama — bukti filter
  // benar-benar hidup di URL, bukan di state klien.
  await page.goto('/leads?status=deal');
  // Jumlah absolut aman DI SINI, tidak seperti tabel tanpa filter: lead yang
  // dibuat spec lain selalu berstatus `new`, dan status belum bisa diubah.
  await expect(page.getByRole('row')).toHaveCount(2);
});

test('status yang tidak dikenal di URL tidak mengosongkan tabel', async ({ page }) => {
  await page.goto('/leads');
  const tanpaFilter = await page.getByRole('row').count();

  await page.goto('/leads?status=bukan-status');

  // Dibandingkan dengan baseline, bukan angka tetap: yang diuji adalah "status
  // asing diabaikan", dan itu benar berapa pun isi store saat tes berjalan.
  await expect(page.getByRole('row')).toHaveCount(tanpaFilter);
  await expect(page.getByRole('cell', { name: 'Rina Wijaya' }).first()).toBeVisible();
});
