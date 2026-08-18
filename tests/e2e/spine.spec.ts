import { test, expect } from '@playwright/test';

/**
 * Satu tes yang menjaga seluruh slice: jalur North Star dari login sampai
 * landing publik yang benar-benar server-rendered. Kalau tes ini hijau,
 * produk inti bekerja.
 */
test('jalur North Star: dari login sampai landing publik live', async ({ page, request }) => {
  const nama = `Uji Spine ${Date.now()}`;

  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // Fase 3 — Create Project
  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill(nama);
  await page.getByLabel('Lokasi').fill('Gading Serpong, Tangerang');
  await page.getByLabel('Developer').fill('Paramount Land');
  await page.getByLabel('Deskripsi').fill('Cluster uji dengan dua tipe unit dan akses tol lima menit.');
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan project' }).click();

  await expect(page.getByRole('heading', { name: nama })).toBeVisible();
  const projectUrl = page.url();

  // Fase 4 — dua tipe rumah
  for (const [tipe, harga, lt, lb, kt] of [
    ['Villa', '2450000000', '90', '120', '3'],
    ['Midea', '3100000000', '112', '145', '4'],
  ]) {
    // .first(): CTA header dan tile grid memakai label identik "Add house type".
    await page.getByRole('button', { name: 'Add house type' }).first().click();
    await page.getByLabel(/Nama tipe/).fill(tipe);
    await page.getByLabel(/Harga/).fill(harga);
    await page.getByLabel(/Luas tanah/).fill(lt);
    await page.getByLabel(/Luas bangunan/).fill(lb);
    await page.getByLabel(/Kamar tidur/).fill(kt);
    await page.getByLabel(/Kamar mandi/).fill('2');
    await page.getByLabel(/Carport/).fill('1');
    await page.getByRole('button', { name: 'Simpan tipe' }).click();
    await expect(page.getByText(tipe)).toBeVisible();
  }

  // Fase 5 — Generate AI
  await page.getByRole('link', { name: 'Generate AI' }).click();
  // Tunggu navigasi ke layar generate commit dulu. Di halaman detail, "Generate
  // AI" adalah <Link> berisi <Button> (dua elemen bernama sama); tanpa menunggu,
  // getByRole('button') bisa resolve ke tombol lama saat navigasi masih di
  // tengah jalan dan mengekliknya, sehingga tombol generate sungguhan tak pernah
  // terklik dan panel tetap idle.
  await page.waitForURL(/\/generate$/);
  await page.getByRole('button', { name: 'Generate AI' }).click();
  await expect(page.getByRole('button', { name: 'Lanjut ke editor' })).toBeVisible({ timeout: 30_000 });

  // Fase 6 — Block Editor
  await page.getByRole('button', { name: 'Lanjut ke editor' }).click();
  await page.getByRole('button', { name: 'Blok Hero' }).click();
  // exact: tanpa ini 'Judul' ikut cocok dengan 'Subjudul' (substring match).
  await page.getByLabel('Judul', { exact: true }).fill('Judul hero hasil uji');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByText('Tersimpan')).toBeVisible();

  // Fase 7 — Publish
  await page.goto(`${projectUrl}/publish`);
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();
  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();

  const slug = (await page.getByText(/^listingku\.app\//).textContent())?.replace('listingku.app/', '').trim();
  expect(slug).toBeTruthy();

  // Landing publik — dibuktikan dari HTML mentah, bukan setelah hidrasi
  const html = await (await request.get(`/${slug}`)).text();
  expect(html).toContain('Judul hero hasil uji');
  expect(html).toContain('Rp 2,45 M');
  expect(html).toContain('wa.me/6281288994410');
  expect(html).toContain('"@type":"RealEstateListing"');
  expect(html).toMatch(/<link[^>]+rel="canonical"/);
});

test('publish tetap berhasil tanpa konten AI sama sekali', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();

  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill(`Tanpa AI ${Date.now()}`);
  await page.getByLabel('Deskripsi').fill('Konten diisi manual tanpa bantuan AI sama sekali.');
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan project' }).click();

  // Tunggu wizard selesai router.push ke /projects/[id] sebelum membaca url;
  // membacanya terlalu cepat menangkap /projects/new dan /publish-nya 404.
  await page.waitForURL(/\/projects\/prj_/);
  await page.goto(`${page.url()}/publish`);
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();
  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();
});
