import { test, expect } from '@playwright/test';

/**
 * Membuktikan rantai penuh: materi yang diketik agen di wizard sampai ke
 * halaman publik, dan tidak ada angka menit yang dikarang untuk tempat yang
 * menitnya dikosongkan.
 *
 * Tanpa nilai absolut: suite ini serial di atas SATU mock store bersama, dan
 * spec lain menambah project/lead/visitor di store yang sama.
 */
test('materi yang diketik agen sampai ke halaman publik', async ({ page }) => {
  const nama = `Uji Brief ${Date.now()}`;

  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // Step 1 — basic info + lokasi lewat combobox
  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill(nama);
  await page.getByRole('button', { name: 'Perumahan' }).click();

  await page.getByRole('combobox', { name: /Cari kota atau kecamatan/i }).fill('kelapa dua');
  await page.getByRole('option', { name: /Kelapa Dua/ }).first().click();
  await page.getByLabel(/Nama kawasan/).fill('Gading Serpong');
  await page.getByLabel('Developer').fill('Paramount Land');
  await page.getByLabel(/Ceritakan singkat/).fill('Cluster dua lantai dengan akses tol dekat.');
  await page.getByRole('button', { name: 'Lanjut' }).click();

  // Step 2 — Content Planner
  await expect(page.getByRole('heading', { name: 'Materi landing page' })).toBeVisible();
  await page.getByRole('button', { name: 'Gunakan rekomendasi' }).click();

  // Panel Lokasi: satu tempat DENGAN menit, satu TANPA menit.
  await page.getByRole('button', { name: /Buka materi Lokasi/i }).click();
  await page.getByRole('button', { name: 'Tambah tempat terdekat' }).click();
  await page.getByLabel('Nama tempat 1').fill('Tol Jakarta–Merak');
  await page.getByLabel('Menit 1').fill('5');
  await page.getByRole('button', { name: 'Tambah tempat terdekat' }).click();
  await page.getByLabel('Nama tempat 2').fill('Sekolah Pelita Harapan');
  await expect(page.getByText(/tidak tampil sebagai kartu akses/i)).toBeVisible();
  await page.getByRole('button', { name: /Tutup materi Lokasi/i }).click();

  // Panel Promo
  await page.getByRole('button', { name: /Buka materi Harga & Promo/i }).click();
  await page.getByRole('checkbox', { name: 'Ada promo' }).check();
  await page.getByLabel('Nama promo').fill('Free BPHTB');
  await page.getByLabel('Butir promo').fill('Free BPHTB dan AJB\nCashback 5%');
  await page.getByLabel('DP').fill('10%');
  await page.getByRole('button', { name: /Tutup materi Harga & Promo/i }).click();

  await page.getByRole('button', { name: 'Lanjut' }).click();

  // Step 3 — review
  await expect(page.getByText('2 tempat').first()).toBeVisible();
  await page.getByRole('button', { name: 'Simpan project' }).click();
  await expect(page.getByRole('heading', { name: nama })).toBeVisible();
  const projectUrl = page.url();

  // Satu tipe rumah supaya Generate AI terbuka
  await page.getByRole('button', { name: 'Add house type' }).first().click();
  await page.getByLabel(/Nama tipe/).fill('Tipe A');
  await page.getByLabel(/Harga/).fill('1500000000');
  await page.getByLabel(/Luas tanah/).fill('72');
  await page.getByLabel(/Luas bangunan/).fill('96');
  await page.getByLabel(/Kamar tidur/).fill('3');
  await page.getByLabel(/Kamar mandi/).fill('2');
  await page.getByRole('button', { name: /Simpan tipe/i }).click();

  // Generate AI lalu publish
  await page.goto(projectUrl);
  await page.getByRole('link', { name: /Generate AI/i }).click();
  // Halaman detail punya <Link> DAN <Button> bernama sama "Generate AI" — tanpa
  // menunggu URL /generate dulu, getByRole('button') di bawah bisa resolve ke
  // tombol lama saat navigasi masih di tengah jalan (race yang sama yang
  // dicatat di spine.spec.ts, bukan dugaan — sudah pernah terjadi).
  await page.waitForURL(/\/generate$/);
  await page.getByRole('button', { name: /Generate/i }).first().click();
  // GeneratePanel fase 'done' tidak pernah menulis kata "selesai"/"berhasil"
  // di mana pun (diverifikasi dari components/ai/GeneratePanel.tsx) — sinyal
  // nyata generate selesai adalah tombol "Lanjut ke editor", sama seperti
  // yang sudah dipakai spine.spec.ts.
  await expect(page.getByRole('button', { name: 'Lanjut ke editor' })).toBeVisible({ timeout: 30_000 });

  // Halaman detail project TIDAK punya link "Publish" — hanya EditorShell
  // (halaman editor) yang punya. Navigasi langsung ke /publish, pola yang
  // sama dengan spine.spec.ts.
  await page.goto(`${projectUrl}/publish`);
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();
  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();

  // Halaman publik
  const slug = nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await page.goto(`/${slug}`);

  // Fakta agen tampil apa adanya.
  await expect(page.getByText('5 mnt')).toBeVisible();
  await expect(page.getByText('Tol Jakarta–Merak')).toBeVisible();
  await expect(page.getByText('Free BPHTB dan AJB')).toBeVisible();

  // Tempat TANPA menit tidak menjadi kartu akses — dan tidak ada satu pun angka
  // menit yang dikarang untuknya.
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  expect(body).not.toMatch(/\d+\s*mnt\s+Sekolah Pelita Harapan/);
});
