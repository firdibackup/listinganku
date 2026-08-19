# STATUS — listinganku

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-08-19 (KESEPULUH tema landing SELESAI & aktif — semua 10 desain .dc.html diimplementasi. AVAILABLE_THEMES = 10.)
>
> **10 tema:** tropicalWarm (bespoke, `themes/tropicalWarm/`), 9 lain = komponen bersama + CSS di-scope `[data-lp-theme=...]` (`themes/<name>.css`) + font + urutan. Override struktural: editorialWhite & softLuxury pakai `HouseTypesList` (unit sebagai daftar/carousel). Simplifikasi sadar: 03 corporateBlue pakai hero foto bersama (form-in-hero desain dijalankan lewat blok form penutup); 06 architectural pakai kartu unit bertab (sudah mirip lembar spesifikasi). Kalau mau lebih presisi ke desain, tambah varian Hero/Unit di `themes/shared/` + daftarkan di `THEME_OVERRIDES`.
>
> **Tema landing (design/project/*.dc.html):** file desain 01–10 SUDAH ada di repo `design/project/`. DesignSync/`/design-login` GAGAL di device ini (400 "could not add design scopes") — baca file langsung dari `design/project/`, jangan pakai DesignSync.
> **Pola membangun tema baru (terbukti):** (1) baca `design/project/NN ....dc.html`; (2) tambah font di `lib/landing/fonts.ts` + `tests/mocks/next-font.ts`; (3) tambah urutan di `BLOCK_ORDER_BY_THEME` (blocks.ts); (4) tulis `lib/landing/themes/<name>.css` — override kelas `lp-tw-*` di-scope `[data-lp-theme='<name>']`, NOL warna literal (semua var(--lp-*)); (5) untuk beda struktural (unit daftar/spec-sheet, form di hero) tambah komponen di `themes/shared/` + daftarkan di `THEME_OVERRIDES` (themes/index.ts); (6) import CSS di globals.css; (7) `AVAILABLE_THEMES` += nama; (8) update tes `block-renderer` (AVAILABLE_THEMES) + `editor.spec` (tema enabled/disabled); (9) verify. Palet 10 warna SUDAH ada — tema = font+urutan+CSS+enable saja. **7 sisa:** 03 Korporat Biru (form di hero), 04 Soft Luxury Beige, 05 Bold Retail, 06 Arsitektural Beton (unit spec-sheet), 07 Nature Calm (fasilitas dulu), 08 Klasik Navy, 09 Playful Pastel.
> **PENTING e2e:** bunuh dev server bocor di port 3000 + `rm -rf .next` SEBELUM e2e (`bug-030`), kalau tidak `reuseExistingServer` pakai bundle basi → semua tes interaksi klien gagal walau kode benar.

---

## ✅ Done

**Dokumentasi & perencanaan**
- `CLAUDE.md` ditulis — ringkasan produk + arsitektur terencana, disuling dari PRD v3.0 + flow doc Fase 0–9.
- Design system + 11 layar aplikasi diimpor dan dibaca penuh dari Claude Design project `8059d123-0b3d-4faf-b7be-b76ce3506622` lewat tool `DesignSync`.
- **Spec slice 1 disetujui dan ditulis:** `docs/superpowers/specs/2026-08-16-listingku-frontend-slice1-design.md`.
- **Implementation plan slice 1 selesai + self-review:** `docs/superpowers/plans/2026-08-16-listingku-frontend-slice1.md` — 18 task TDD, tiap task berakhir commit.

**Eksekusi slice 1 (subagent-driven development)**
- Repo di-init git. Baseline `cfd945e` di `main`; kerja di branch **`slice-1-frontend`**.
- Ledger eksekusi: `.superpowers/sdd/2026-08-16-listingku-frontend-slice1/progress.md` — **baca ini untuk tahu task mana yang sudah selesai.** Task dengan baris `Task <N>: complete` sudah beres, jangan diulang.
- Pre-flight scan plan: 22 baris cek, 2 cacat ditemukan + diputuskan (Switch masuk slice 1 lewat Task 16; nama e2e test Task 16 diperbaiki).
- **Task 1–18 SELESAI — slice 1 lengkap.** Sudah di-push dan di-merge lewat PR #1; HEAD branch = `2e04fe9`, local = origin. Basis Task 14 = `5a00ed8` "initial commit" dari device lain (Audi).
- **Audit merge PR #1 vs plan superpowers (2026-08-18).** Merge bersih (tidak ada yang hilang: `git diff 5478db3 2e04fe9` kosong, `5a00ed8` memang leluhur sisi fitur). Dua temuan, **keduanya sudah diperbaiki** (`bug-021`, `bug-022`): (a) `_aifail.spec.ts` dari commit terakhir membuat `npm run verify` merah — verifikasi manual §14 #4 dikomit sebagai spec biasa tanpa `AI_MOCK_FAIL=1` di webServer; (b) `components/landing/StickyCtaBar.tsx` yang diwajibkan plan Task 14 + spec §mobile tidak pernah dibuat, menyisakan `.lp__stickybar` sebagai CSS mati. Sesudah perbaikan: `npm run verify` **EXIT_CODE=0** — unit **259/259**, `npm run build` bersih, e2e **23 passed + 1 skipped** (spec AI-failure sengaja di-gate).
- **Catatan proses:** ledger `.superpowers/.../progress.md` hanya menutup **Task 1–12**; Task 13 direview tapi tak ditutup, Task 14 hanya "dispatched", dan `task-14..18-report.md` tidak ada. Artinya Task 14–18 tidak melewati ronde review per-task seperti Task 1–13 — loop yang dulu menangkap bug Critical snapshot (T6), penanda accordion (T3), dan `RpNaN` (T4). `.superpowers/` gitignored, jadi device lain punya ledger sendiri.
  - **1** scaffold Next 15 + TS + Tailwind v4 + token DS + Vitest/RTL + Playwright (`4655f1f`)
  - **2** komponen DS Button/Card/Chip/Input + `ds.css` (`e9e5272` → fix `e6d6543`, `e0be27e`)
  - **3** primitif Radix Dialog/Sheet/Accordion/Progress/Skeleton/Toaster (`457d822` → fix `0b87192`, `1002fd6`)
  - **4** utilitas `lib/{format,slug,ids}.ts` (`6c510a3` → fix `01d0ffe`)
  - **5** model blocks `lib/landing/blocks.ts` (`0465457` → `a7c8878`)
  - **6** lapisan data: `lib/data/repo.ts` (kontrak `DataStore`), mock store + snapshot atomik ke `.data/store.json`, seed (`168334a` → `8d0f781` → `5282b43`)
  - **7** sesi dummy + login + dashboard terwiring ke store (`6a1b1a9` → `6fdecda`); dua wordmark asli dari Claude Design (`612eed4`)
  - **8** pipeline media: upload tervalidasi server, daftar, hapus, foto utama (`4bf09e3` → `80d9909`). Nama file selalu diturunkan server — 12 nama bermusuhan diuji, tidak satu pun lolos keluar folder upload
  - **9** skema Zod + wizard buat project 3 langkah (`85e7ce4` → `411f706`). Wizard menyimpan per langkah: dua langkah = tepat satu baris, dibuktikan lewat eksekusi
  - **10** detail project + sheet tipe rumah (`3f46db1` → `e05283b`). Dua gate otorisasi: project milik user, DAN tipe rumah milik project itu
  - **11** `lib/landing/resolve.ts` — rantai override → AI → kosong (`6753d1b` → `725b119`). `pick` diekspor dan diuji langsung; `0`/`false` terbukti bertahan
  - **12** tema wireframe + `BlockRenderer` (`fd37db3` → fix `0d91b8f`, alt text galeri)
  - **13** landing publik SSR di `/{slug}` + `generateMetadata` + JSON-LD + `sitemap.xml`/`robots.txt` (`d57bd6a`). **2 cacat nyata ditemukan & diperbaiki di luar teks brief:** (1) JSON-LD dipasang lewat `dangerouslySetInnerHTML` pakai `JSON.stringify` polos — nama project bermusuhan berisi `</script>` bisa memutus tag `<script>` dan menyuntik markup; ditambal `jsonLdScript()` di `lib/landing/seo.ts` (tiap karakter `<` diganti escape unicode enam-karakter setaranya), dibuktikan lewat unit test round-trip DAN verifikasi manual di production build sungguhan (0 karakter `<` literal di span JSON-LD). (2) `app/sitemap.ts` tanpa `export const dynamic` dibekukan **statis** oleh Next di build time (dibuktikan lewat tabel rute `next build`: `○` tanpa fix → `ƒ` dengan fix) — publish/unpublish project sesudah build tidak akan pernah muncul di sitemap tanpa redeploy; e2e Playwright tidak menangkap ini karena `webServer` jalan `next dev`, yang selalu re-eksekusi. `cache()` dari `react` dipakai menyatukan `generateMetadata`+halaman ke satu fetch. Kedua bug + fix ada di `.wolf/buglog.json` (`bug-013`, `bug-014`).
  - **14** landing interaktif — `WhatsAppLink` + `PageViewTracker` + `ContactForm` (baru di `components/landing/`), wiring `AgentCta`/`ContactFormBlock`, mount tracker di `[slug]/page.tsx`. `submitLeadAction`/`recordEventAction` sudah ada dari device lain (commit `5a00ed8`); sesi ini menuntaskan separuh UI-nya sampai 33 test Task 14 hijau. 1 cacat e2e ditemukan & ditambal: happy-path lead gagal dari cold karena kompilasi Server Action pertama di `next dev` >5s (default expect timeout Playwright) — dinaikkan ke 15s di `playwright.config.ts` (`bug-015`).
  - **15** AI mock + layar Generate AI (`1c9baac`). `lib/ai/{schema,generator,mock,index}`, `generateContentAction` memecah respons (project→`ai_content`, tiap tipe→barisnya) + catat `ai_usage`, `GeneratePanel` 4-state (idle/loading/error/done). Disalin verbatim dari plan §15 setelah memverifikasi semua tipe/`db`/komponen cocok; 6 unit test hijau. `ProjectHeader` sudah menaut ke route ini sejak Task 10.
  - **16** block editor terpimpin (`8db9e7c`). `EditorShell` + `BlockSettingsPanel` (Radix Switch), pratinjau memakai `BlockRenderer` live yang sama. 2 deviasi wajib dari plan (kode plan belum pernah jalan): buang prop `projectId` di `<BlockRenderer>` (compile error — projectId sudah lewat `resolveBlocks`); frame pratinjau `<div>` bukan `<button>` (blok berisi form/`<a>`, nesting DOM invalid). 2 fix e2e: `beforeEach` tunggu `/dashboard` (race sesi); `getByLabel('Judul',{exact:true})` (tanpa exact ikut cocok 'Subjudul'). 5 e2e hijau.
  - **17** publish + QR + share (`e6d6003`). `PublishPanel` (Dialog konfirmasi, salin link, QR img SVG + unduh PNG/SVG, caption per platform), `app/api/qr` route (png/svg, 400 slug kosong, 404 draft) + helper murni diuji. **E2e dijadikan serial (`workers:1`)**: satu mock store bersama tanpa isolasi per-test → worker paralel berebut state (publish.spec publikasikan casa-verde vs landing-ssr.spec assert casa-verde draft). Serial + urutan file abjad = asersi selalu mendahului mutasi. 2 unit + 3 e2e hijau.
  - **18** spine e2e tulang punggung (`dfac0c7`) + script `npm run verify`. Dua test alur penuh: North Star (login→wizard→2 tipe→Generate AI→editor→publish→landing dari HTML mentah) + publish-tanpa-AI. 3 fix e2e nav-timing: `waitForURL(/generate$/)` sebelum klik Generate (detail project punya `<Link>` DAN `<Button>` "Generate AI"); `waitForURL(/projects/prj_/)` sebelum baca `page.url()`; `.first()` pada "Add house type" (dua tombol identik).
  - **fix** `snapshot.ts` `renameWithRetry` (`e463538`). `renameSync` di Windows sesekali EPERM saat `store.json` terkunci sejenak (antivirus/indexer); hanya muncul di bawah beban `verify` → 1 unit test flaky. Retry transien + test deterministik lewat seam DI (`bug-020`).
- **5 dari 6 task butuh fix round** — mayoritas temuannya cacat di teks plan saya, bukan kesalahan implementer. Plan sudah diperbaiki di sumbernya supaya tidak menurun ke task berikutnya. Task 13 dikerjakan dari brief task-13-brief.md (bukan langsung dari plan), 2 cacat brief ditemukan & ditambal seperti tercatat di atas.

**Halaman Leads + Settings (2026-08-19) — SELESAI dan di-commit**
- Dikerjakan lewat brainstorming (jalur *bounded*) → TDD penuh. Desain diambil dari layar `leads` (baris 697) dan `settings` (baris 736) di `Listingku App.dc.html`, bukan wireframe.
- **Prasyarat yang diperbaiki:** `Sidebar` keempat item nav ber-`href="/dashboard"` (Leads & Pengaturan = link mati) dan prop `active` di-hardcode `"dashboard"` di layout. Sidebar kini Client Component memakai `usePathname()`; peta aktif di `components/dashboard/navItems.ts` menyalin `activeNav` file design (`/projects/new` milik Dashboard, bukan Projects).
- **Leads** (`/leads`): 4 kartu metrik dari event sungguhan + delta 7 hari, tabel `<table>` semantik (bukan grid div), filter status/project **lewat URL** (Server Component, bisa dibagikan), empty state. Status **read-only** (keputusan user).
- **Settings** (`/settings?tab=tampilan|profil|umum`): tab lewat URL dengan `<Link>` — `@radix-ui/react-tabs` tidak jadi dipasang. Ketiga tab menulis data asli lewat 4 Server Action. Panel pratinjau sticky ikut tema/aksen terpilih.
- **Perubahan kontrak data:** `DataStore.events.listByUser()` ditambah (`totalsByUser` meratakan tanggal, delta 7 hari mustahil darinya). `AgentProfile` +`specialistArea: string` +`notifyOnLead: boolean`. Seed: 5 lead dari file design + `specialistArea`/`notifyOnLead`.
- **Rumus konversi dikoreksi:** kartu "VISITOR → LEAD" = `(whatsapp_click + form_submit) / visitor`, bukan `leads.length / visitor`. Hanya submit form yang membuat baris `leads`; rumus events mereproduksi 6,7% file design **persis** dari angka seed.
- **Tombol "Publikasikan situs profil" ditambah di luar desain** — desain hanya menggambar "Unpublish", yang tanpa jalan kembali mengunci agen keluar dari profilnya sendiri.
- **5 bug dicatat** (`bug-023`..`bug-027`): `.next` rusak karena build selagi dev server hidup; asersi e2e absolut di atas mock store bersama (3 ronde); spesifisitas CSS delta metrik; takik `<legend>` fieldset; `<details>`/`<summary>` di Playwright.
- Verifikasi: `npm run verify` **EXIT_CODE=0** — unit **322/322**, `npm run build` bersih, e2e **31 passed + 1 skipped**. Screenshot keempat layar diperiksa mata terhadap file design.

---

## 🚀 Next phase

**Slice 2A — sistem tema landing + tema Tropis Hangat: SELESAI & terverifikasi (2026-08-19).**
`npm run verify` hijau: **365 unit test**, `next build` bersih, **35 e2e passed + 1 skipped** (AI_MOCK_FAIL di-gate). Belum di-commit (menunggu keputusan user; branch = default `slice-1-frontend`, jadi buat branch baru dulu bila commit).

Yang dibangun (Task 1–14 plan tema): `lib/landing/palettes.ts` (10×20 token, gate WCAG AA), `themeNames.ts`, `fonts.ts`, 3 blok baru (`pricePromo`/`developer`/`testimonials`) + perluasan `hero`(badges,priceFrom,projectId,waNumber,defaultMessage)/`location`(access)/`floorPlans`(masterplan), `BLOCK_ORDER_BY_THEME`+`defaultBlocksForTheme`, registry `THEMES` objek (label/fonts/defaultPalette/components/Chrome), 14 komponen `themes/tropicalWarm/` + Header/Footer + `theme.css` (nol warna literal), migrasi store row-level (`Project.palette`), editor: `PalettePicker` + konfirmasi urutan + 4 panel blok, `page.tsx` root `data-lp-theme`/`data-lp-palette`+`paletteStyle`, seed Parkspring mengisi 14 blok. Tema `wireframe` DIHAPUS.
- Vitest: alias `next/font/google` → `tests/mocks/next-font.ts` (next/font tak jalan di jsdom).
- Deviasi kontras tercatat: `tropicalWarm['on-accent']='#ffffff'` (krem gagal 4,46:1) — sama pola softLuxury/boldRetail.
- Gotcha baru: `bug-028` (komentar 'rgba(' kena lint), `bug-029` (label palet == label tema → strict-mode e2e).

**Slice 2B–2J — 9 layout sisanya (01–09).** Semua 10 tema SUDAH terdaftar di `THEMES` dengan palet masing-masing, tapi 9 dipetakan sementara ke komponen tropicalWarm dan DISABLED di picker (`AVAILABLE_THEMES=['tropicalWarm']`). Membangun layout DISTINCT tiap tema butuh file `.dc.html` 01–09 di Claude Design `b83ace24-6494-4409-9908-45979e7de301` — **butuh `/design-login` per-device (hanya user yang bisa jalankan)**. Tanpa file itu, 9 tema hanya bisa dibuat sebagai interpretasi dari brief satu-baris spec §2. **Keputusan user tertunda:** (a) user `/design-login` → agen pull DesignSync → bangun faithful; atau (b) izinkan bangun interpretasi tanpa file.

### Cara melanjutkan (termasuk di device lain)

Di device baru: `npm install` lalu `npm run seed:reset` dulu. `/design-login` HANYA perlu untuk membuka file desain 01–09 (slice 2B+).

- **Spec:** `docs/superpowers/specs/2026-08-19-listingku-landing-tema-tropis-design.md` — 21 bagian, berdiri sendiri.
- **Plan:** `docs/superpowers/plans/2026-08-19-listingku-landing-tema-tropis.md` — 14 task TDD, tiap task berakhir commit.
- **Sumber desain:** Claude Design project `b83ace24-6494-4409-9908-45979e7de301` ("10 Design Landing Page Variatif"), file `00 Index` + `01`–`10` + `support.js`.

### Empat keputusan user (2026-08-19) — TERTUTUP, jangan dibuka ulang

1. **Cakupan isi = Hybrid.** Enam bagian desain tanpa sumber data ditangani selektif: tambah `pricePromo`, `testimonials`, `developer` sebagai blok baru; `location.access` dilebur ke blok Lokasi; masterplan memakai media `floor_plan` yang sudah ada; tim marketing = 1 agen; form kontak DIPERTAHANKAN.
2. **10 layout DAN palet yang bisa ditukar** (user: "dikombine opsi 1 dan opsi 3"). Dieksekusi bertahap — slice 2A = fondasi + Tropis Hangat; slice 2B–2J = 9 layout sisanya, satu slice masing-masing.
3. **Tema membawa urutan blok bawaannya.** Ganti tema memunculkan konfirmasi "Terapkan urutan bawaan tema ini?" — susunan manual agen tidak pernah hilang diam-diam.
4. **Mobile-first, desktop responsive** (user: "fokus ke mobile first, untuk desktop kamu buat responsive aja"). Kesepuluh file desain hanya 390px; perilaku desktop dirancang di spec §12.

### Inti arsitekturnya

Tiga lapis: **konten** (1×) → **palet** (1×, 20 token peran × 10 palet) → **layout** (10×). Token dinamai per PERAN (`--lp-contrast`, bukan `--lp-dark`) supaya palet gelap bisa dipasang ke layout terang. Komponen tema **tidak boleh** menulis warna literal — ditegakkan tes lint. Palet dikirim sebagai `style` custom property di root landing (hanya palet aktif, ~600 byte, nol duplikasi TS↔CSS).

**`AiContentSchema` tidak berubah sama sekali.** Garisnya: AI menulis prosa pemasaran, manusia memasok fakta dan klaim. Akses lokasi, syarat promo, statistik developer, dan **terutama testimoni** semuanya klaim faktual — testimoni fabrikasi yang tampil seolah asli adalah penipuan terhadap pembeli.

### Dua cacat kontras yang sudah ditemukan di file desain aslinya

Kesepuluh palet sudah diekstrak dan dimasukkan ke plan Task 1. Dua di antaranya gagal WCAG AA di file aslinya dan sudah dikoreksi di plan, dengan alasannya tercatat:
- `boldRetail`: teks putih di atas oranye `#ff6a13` hanya **3,2:1** → `on-feature` jadi `#111111`.
- `softLuxury`: `#f6f1e9` di atas `#8a6b45` hanya **4,2:1** → `on-accent` jadi `#ffffff`.

Gate kontras 4.5:1 ada di Task 1 Step 1. **Jangan longgarkan ambangnya** kalau palet baru gagal — perbaiki tokennya.

### Yang juga berubah di slice ini
- Tema `wireframe` **DIHAPUS**. `AVAILABLE_THEMES` jadi `['tropicalWarm']`; 9 tema lain disabled di picker.
- `ThemeName` `'modern'|'showcase'|'luxury'` → 10 id desain, lewat `normalizeTheme()`. **Bukan pemetaan menyeluruh** — nilai sah dilewatkan apa adanya supaya `editorialWhite` tetap bertahan begitu dibangun.
- `repairShape()` kini memperbaiki **BARIS**, bukan cuma tabel yang hilang — menutup jebakan yang selama ini tercatat di file ini.
- `Project.palette: PaletteName` baru.

### Catatan penting untuk sesi berikut
- **Jangan jalankan `npm run build`/`npm run verify` selagi `next dev` masih hidup** — `.next` rusak (`Cannot find module './611.js'`) dan SELURUH e2e gagal timeout. Cek port 3000 dulu (`bug-023`).
- **`npm run seed:reset` WAJIB sesudah mengubah `fixtures/seed.ts`.**
- **Jangan menulis asersi e2e bernilai absolut.** Suite berbagi satu mock store secara serial (`workers:1`). Pakai `.first()`, baseline yang dibaca di test itu sendiri, atau `toBeGreaterThanOrEqual` (`bug-024`). Semua e2e yang berpindah rute memakai `waitForURL(...)`; `expect.timeout` 15s.
- AI 100% **mock** lewat `getGenerator()` di `lib/ai/index.ts`.
- **`openwolf designqc` tidak ada di CLI 2.0.1** walau OPENWOLF.md menyebutnya. Untuk screenshot: spec Playwright sementara, lalu hapus specnya.
- `lib/data/index.ts` menyentuh `node:fs` saat modul dimuat — **jangan impor barrel `@/lib/data` dari Edge runtime.**

### Definisi selesai slice 2A

Spec §18. Ringkasnya: `npm run verify` EXIT_CODE=0 · landing tetap server-rendered (bukti View Source) · tukar palet mengubah halaman tanpa reload/flash · kesepuluh palet lolos gate kontras · nol hex literal di komponen tema · proporsional di 390/768/1440px dengan screenshot · alur slice 1 termasuk kirim lead masih lolos · ganti tema menghormati penolakan agen.

### Pekerjaan lain yang menunggu (tidak memblokir slice 2A)

1. **Verifikasi manual §14 spec slice 1 — sisa 2 butir:** bandingkan 7 layar slice 1 dengan `Listingku App.dc.html` (Leads & Settings sudah); view-source landing yang dipublish.
2. `leads.updateStatus` + dropdown status di tabel (ditunda oleh keputusan user; `LeadStatus` punya 6 nilai, belum ada kode yang menulisnya).
3. Situs profil `{subdomain}.listingku.app` — Settings sudah MENGISI datanya, belum ada yang membacanya. Butuh middleware subdomain.
4. Unggah logo di tab Tampilan masih placeholder — pipeline media selalu mengikat aset ke `projectId`, jadi aset milik profil belum punya tempat.
5. Pengiriman email notifikasi lead (`notifyOnLead` tersimpan, belum ada yang mengirim).
6. Aset `public/brand/listingku-mark.png` masih placeholder.

---

## 📁 Active architecture

- **Stack:** Next.js 15 App Router (monolith) · Tailwind v4 + token DS via `@theme inline` · komponen DS di-port + Radix · Zod + react-hook-form · `lucide-react` · `next/font/google` Archivo · `qrcode` · Vitest + RTL + Playwright. Node 24.19.0, npm 11.17.0 (pnpm tidak terpasang).
- **Entitas:** `projects` (pemilik landing: blocks/seo/theme/ai_content) · `house_types` (spek + ai_content sendiri) · `media` · `leads` · `events` · `ai_usage` · `agent_profiles` (di-seed).
- **Pola yang ditegakkan project-wide:**
  - UI tidak pernah menyentuh sumber data — selalu lewat `lib/data/repo.ts`.
  - Baca lewat Server Component, tulis lewat Server Action → repo → `revalidatePath`.
  - **Setiap action yang mengubah data wajib memverifikasi baris target milik user sesi sebelum menyentuh apa pun** (`requireOwnedProject`). Task 8 sempat melewatkan ini dan siapa pun bisa menghapus media user lain.
  - Action mengembalikan `ActionResult<T>` (`{ok:true,data}` / `{ok:false,fieldErrors}`, error generik di key `_`), bukan melempar; seluruh badan action dibungkus try/catch, dan pemanggil wajib memeriksa hasilnya. Jangan `startTransition(() => void action(...))` — rejection-nya hilang diam-diam.
  - Blocks menyimpan **referensi** (mediaId, houseTypeId), bukan salinan harga/foto.
  - Field teks kosong = pakai default AI; mengisi = override. "Use AI suggestion" cukup menghapus override.
  - Ketiga tema berbagi content JSON identik — hanya layout/gaya yang berbeda.
  - Copy wajib patuh aturan DS: **Anda** formal, **kami**, sentence case, tanpa emoji, tanpa tanda seru, angka gaya Indonesia.

---

## ⚠️ External blockers (don't block coding)

- ~~Desain landing publik~~ **TERSELESAIKAN 2026-08-19** — user menyerahkan 10 file desain (Claude Design `b83ace24-6494-4409-9908-45979e7de301`). Lihat 🚀 Next phase. Desain **situs profil agen** masih belum ada; sampai itu datang situs profil tetap wireframe.
- Webfont Neue Haas Grotesk berlisensi dan belum tersedia; Archivo dipakai sebagai pengganti.
- `public/brand/listingku-mark.png` masih placeholder. Aset asli ada di project Claude Design (`assets/listingku-mark.png`); ambil lewat `DesignSync` dari sesi utama, bukan subagent.
- Supabase, Gemini API key, dan domain `listingku.app` belum diperlukan sama sekali di slice 1.

---

## 🔧 Useful commands

```bash
npm run dev              # dev server, tanpa layanan eksternal
npm run build            # harus bersih sebelum menyatakan selesai
npm run seed:reset       # hapus .data/store.json, kembali ke fixture
npx vitest               # unit test
npx playwright test      # spec tulang punggung

# Baca ulang design dari Claude Design (tool DesignSync)
# projectId: 8059d123-0b3d-4faf-b7be-b76ce3506622
# file utama: "Listingku App.dc.html"
```

---

## 📚 References (read IF needed)

- `docs/superpowers/specs/2026-08-16-listingku-frontend-slice1-design.md` — **spec slice 1, baca ini sebelum koding**
- `CLAUDE.md` — ringkasan produk + arsitektur
- `Product Requirements Document (PRD).md` — PRD v3.0 lengkap
- `Flow Onboarding & Alur Produk Listingku (MVP — Landing per Primary Property).md` — alur Fase 0–9
- `.wolf/cerebrum.md` — User Preferences + Do-Not-Repeat + Decision Log
- `.wolf/anatomy.md` — indeks file hemat token
- `.wolf/buglog.json` — bug + fix yang sudah diketahui
