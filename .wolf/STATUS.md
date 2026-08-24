# STATUS — listinganku

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-08-23 (Spec slice 3A "pipeline brief" disetujui — `project.brief` terpisah dari `blocks[].props`, fakta di atas AI & copy di bawah AI, grounding ditegakkan di lapisan render. Sebelumnya 2026-08-23 Perbaikan warna semantik: kontrak peran token, palet mengikuti tema, latar panggung. Sebelumnya 2026-08-19 Slice 2K: kesepuluh tema landing DIBANGUN ULANG dengan DOM+CSS sendiri dari file desain, landing jadi MOBILE-ONLY 390px, konten kanonik seragam, papan banding `/preview`.)
>
> **Tiga keputusan user 2026-08-19 (TERTUTUP):** (1) tiap tema punya DOM sendiri, ditranskrip 1:1 dari `design/project/NN *.dc.html` — bukan satu set komponen yang diwarnai ulang; (2) landing **mobile-only**: satu lebar 390px, di layar besar bingkai DIPUSATKAN bukan dilebarkan; (3) copy hero **seragam** untuk kesepuluh tema supaya perbandingan murni soal tampilan.
>
> **Lihat hasilnya:** `npm run dev` lalu buka **`/preview`** (papan banding 10 tema berdampingan) atau `/preview/{tema}` (satu tema penuh). Halaman publik tetap `/parkspring-gading`.
>
> **JANGAN memakai `accent` sebagai warna TEKS di atas `bg`/`surface`** — pakai `accent-ink`. Tiap token latar punya token tulisan pasangannya; kontrak lengkapnya ada di header `lib/landing/palettes.ts` dan ditegakkan `tests/unit/theme-token-pairs.test.ts`.
>
> **JANGAN menambahkan media query `min-width` di `lib/landing/**`.** Lapisan desktop lama (kolom baca 720px + bingkai 1080px) sudah dihapus; menambahkannya kembali membatalkan keputusan (2).

---

## ✅ Done — Slice 2K (2026-08-19)

**Verifikasi:** `npm run verify` **EXIT_CODE=0** — unit **367/367**, `next build` bersih, e2e **35 passed + 1 skipped**.

**1. Konten kanonik.** `fixtures/seed.ts` Parkspring ditulis ulang dari `design/project/10 Tropis Hangat.dc.html`: Kelapa Gading, developer `Parkspring Land` (nama fiktif — jangan pakai nama perusahaan nyata untuk data demo berisi statistik & testimoni karangan), tipe **Villa 3,2 M / Medea 2,6 M / Grand 4,5 M**, 6 USP judul+penjelasan, 6 fasilitas nama+keterangan, 6 akses, 5 keterangan galeri, 4 promo, legenda masterplan, 2 testimoni, 6 FAQ. Kesepuluh tema memakai konten yang SAMA PERSIS.

**2. Kontrak blok diperluas** (`blocks.ts` + `resolve.ts`): `highlights.items` → `{title, desc}[]`, `facilities.items` → `{name, desc}[]` (override; kosong = pakai `project.facilities`), `gallery.captions`, `floorPlans.legend` + `houseTypes`, `hero.location` (terpisah dari `hero.subtitle`). Panel editor menyesuaikan.

**3. Mobile-only.** `lib/landing/landing.css` ditulis ulang: `.lp{max-width:390px;margin-inline:auto}` + `.lp::before` fixed sebagai latar dari palet. Sticky bar dikunci ke bingkai, bukan viewport, dan ikut tema (dulu memakai tombol dashboard). Nav pil `.lp__pills` DIHAPUS (tidak ada di satu pun file desain, memakai warna dashboard).

**4. Sepuluh tema, sepuluh DOM.** `lib/landing/themes/<nama>/{blocks.tsx, theme.css, index.ts}` untuk kesepuluhnya; `THEME_IMPL` di `themes/index.ts` kini `Record` penuh (bukan `Partial`) supaya tema tanpa komponen gagal kompilasi. Bersama: `themes/shared/parts.tsx` (`Ph`/`Img`/`initials`, kelas netral `lp-ph`/`lp-img`) dan `themes/slots.ts` (`gallerySlots`/`planSlots`).

**5. Papan banding.** `app/preview/page.tsx` (grid 10 iframe) + `app/preview/[theme]/page.tsx`, keduanya lewat `lib/landing/LandingView.tsx` yang juga dipakai halaman publik. Pratinjau `track={false}` — melihat tema sendiri tidak menghitung visitor. Keduanya `robots: noindex`.

**6. Empat bug ditemukan & diperbaiki** (`bug-031`..`bug-034`): spesifisitas warna tautan menutup warna tombol di kesepuluh tema; "terapkan urutan bawaan tema" menghapus seluruh isi blok; galeri & denah tidak pernah tampil karena `media: []`; batas panjang perintah heredoc.

### Ciri tiap tema yang harus bertahan

| # | Tema | Yang tidak boleh hilang |
|---|---|---|
| 01 | premiumDark | Latar hampir hitam, aksen emas, serif ringan, sudut 2px, eyebrow bernomor lewat CSS counter |
| 02 | editorialWhite | Kertas hangat, satu kata miring di judul, NOL radius, tipe unit sebagai DAFTAR bab, `@counter-style lp-bab` |
| 03 | corporateBlue | Pita biru menyambung header→hero→**form lead di dalam hero**, kartu membulat, strip statistik |
| 04 | softLuxury | Krem, Marcellus, radius 14–28px, bayang lembut, tipe unit sebagai kartu yang DIGESER |
| 05 | boldRetail | Pita kuning, Anton kapital, garis tebal 2–3px, aksen oranye, pita hitam untuk unit & testimoni |
| 06 | architectural | Abu beton, Space Grotesk + Space Mono, garis rambut, tombol `[ kurung siku ]`, unit sebagai LEMBAR SPESIFIKASI |
| 07 | natureCalm | Sage, hero LENGKUNG (radius 200px), rata tengah, pita bersudut 26px, tombol pil, unit di pita hijau |
| 08 | classicNavy | Blok hero NAVY, Playfair, komposisi RATA TENGAH, aksen emas hanya di satu tombol |
| 09 | playfulPastel | Blok pastel radius besar, Fredoka, semua tombol pil, kartu USP berganti pastel (`data-slot` 0–3) |
| 10 | tropicalWarm | Terakota hangat, DM Serif, kartu 14px, unit bertab (tema rujukan copy) |

---

---

## ✅ Done — Perbaikan warna semantik (2026-08-23)

**Pemicu:** user melaporkan "beberapa tema warnanya tak sesuai, backgroundnya hitam, primary vs secondary berantakan, warnanya jadi gak semantic" + screenshot pratinjau editor.

**Verifikasi:** unit **410/410** (dari 367) — `npx tsc --noEmit` bersih untuk seluruh kode produksi — audit kontras DOM di kesepuluh tema lewat papan `/preview`: **1.642 simpul teks diperiksa, 0 gagal** (sebelumnya 254 gagal, 56 di antaranya di bawah 2,5:1). `npm run build` + e2e **BELUM** dijalankan karena `next dev` masih hidup di port 3000 (lihat `bug-023`).

**Empat bug, akar yang berbeda-beda** (`bug-035`..`bug-038` di buglog):

1. **`bug-035` — overlay abu di pratinjau editor.** `.lp::before {position:fixed; z-index:-1}` dipakai sebagai latar di luar bingkai 390px; `EditorShell` memakai elemen `.lp` yang SAMA lalu `transform: scale(.72)`. Transform membuat `.lp` jadi containing block untuk keturunan `fixed` **dan** stacking context, jadi pseudo itu berbalik menutupi seluruh pratinjau. Sekarang digerbang `.lp[data-lp-standalone]::before`, penanda hanya dipasang `LandingView`. Warnanya juga bukan lagi `color-mix(bg 52%, #0e1013)` (lumpur `#898683`) melainkan token palet baru **`--lp-backdrop`**.
2. **`bug-036` — palet natureCalm menyetel `accent` = `contrast` = `feature` = `#4a6047`,** padahal temanya memakai `feature` sebagai kartu sage pucat lalu menulis dengan `accent` di atasnya: 82 simpul di bawah AA, sembilan di antaranya **1,00:1**. `feature` dikembalikan ke `#dfe3d5` dan `contrast` ke `#2c3128` (keduanya nilai yang memang dipakai file desain 07).
3. **`bug-037` — tema dan palet dua field yang berdiri sendiri.** Data live tersimpan `premiumDark` + `natureCalm`. `setThemeAction` sekarang ikut menulis `palette = THEME_DEFAULT_PALETTE[theme]`; PalettePicker tetap ada untuk penyimpangan yang disengaja. `.data/store.json` sudah dirapikan.
4. **`bug-038` — scrim hero tropicalWarm** mulai dari `transparent 30%`, jadi di atas placeholder krem (project belum punya foto) badge 2,70:1 dan subjudul 2,67:1. Scrim dikuatkan; sekarang 7,4–13,8:1 di atas placeholder, foto terang, maupun foto gelap.

**Tiga token palet baru:** `backdrop`, `accent-ink` (aksen sebagai TULISAN di atas bg/surface — identik dengan `accent` di enam palet), `on-accent-soft`. `ink-faint`/`ink-soft` digelapkan sampai lolos 4,5:1, dan `--lp-quiet`/`--lp-dim` yang mengencerkannya ke arah bg jadi alias `ink-faint`. Sekitar 30 deklarasi di kesepuluh `theme.css` dipasangkan ulang ke token yang sah; aturan `a { color: accent }` di lima tema jadi `inherit`.

**Dua tes baru:** `tests/unit/theme-token-pairs.test.ts` (memindai kesepuluh `theme.css` x kesepuluh palet — peran token + 4,5:1) dan `tests/unit/editor-theme-palette.test.ts` (palet mengikuti tema). `tests/unit/palettes.test.ts` diperluas dari 6 jadi 18 pasangan + hierarki ink + backdrop.


## ✅ Done — Slice 3A: pipeline brief (2026-08-24)

**SELESAI di `10f2fcb`.** 19 commit dari `b40f485`. `npm run verify` EXIT 0 —
unit hijau, build bersih, e2e 36 lulus + 1 di-skip.

Spec `docs/superpowers/specs/2026-08-23-listingku-brief-pipeline-slice3a-design.md`,
plan `docs/superpowers/plans/2026-08-23-listingku-brief-pipeline-slice3a.md`.
Jejak eksekusi lengkap (14 laporan task + semua ruling) di
`.superpowers/sdd/2026-08-23-listingku-brief-pipeline-slice3a/` — git-ignored,
boleh dihapus kapan saja.

Alurnya sekarang `input kaya → AI menyusun → editor merapikan`, bukan lagi
`input tipis → AI menebak → agen membangun ulang halaman`.

**Yang masuk:** `Project.projectType` + `Project.brief` (JSONB) · preset section
deterministik per tipe · lokasi terstruktur (dataset offline + `/api/places` +
combobox ARIA) · wizard step 1 dirombak, step 2 jadi **Materi landing page** dengan
lima panel materi · `GenerateInput.brief` + `AiContentSchema` bertambah
`subheadline`/`cta` · `resolve()` menyisipkan brief ke rantai `pick()`.

### Invarian yang WAJIB dijaga siapa pun yang menyentuh ini

**Fakta di ATAS AI, copy di BAWAH AI.** `resolve()` untuk `access`, `facilities`,
dan `pricePromo` **tidak pernah membaca `ai.*`** — dan `AiContentSchema` tidak punya
field untuk fakta sama sekali, jadi AI tidak punya kandidat data untuk dikirim ke
sana. Review akhir memverifikasi kebocoran ini **struktural tidak mungkin**, bukan
sekadar belum ketemu jalannya. Jangan menambah field angka ke `AiContentSchema`,
dan jangan memberi fallback `ai.*` ke ketiga blok itu.

`NearbyItem.minutes` bertipe `number | null` dan Zod menolak string. Input kosong
di panel WAJIB tersimpan `null`, bukan `0` — `0` terender `"0 mnt"` di halaman
properti, angka yang tidak pernah dikatakan agen.

**Nol file `lib/landing/themes/` tersentuh** sepanjang slice ini. Dipertahankan.

### Yang ditunda ke 3B

Tab Materi di halaman detail · `MediaType` += `site_plan`, `location_map` ·
`BlockType` += `about` (menambal `aiContent.description` yang di-generate lalu
dibuang) · label CTA sebagai data + `ctaGoals` yang menentukan tombol mana tampil.

Tiga field brief yang UI-nya sudah ada tapi **belum dibaca AI**: `heroEmphasis`,
`promo.name`, `notes`. Sambungkan saat prompt Gemini asli ditulis.

### ⚠️ Blocker eksternal yang masih terbuka

`data/id-regions.json` baru berisi **40 kecamatan starter**. Sumber dan lisensi
dataset penuh (~7.300 kecamatan) belum diputuskan. Bentuk barisnya
(`{district, city, province}`) sengaja stabil — dataset penuh cukup mengganti isi
file, nol perubahan kode. **Sebelum rilis wajib diganti**, kalau tidak agen di luar
40 kecamatan itu tidak menemukan lokasinya.

---

## 🚀 Next phase

Pilih salah satu:

1. **Slice 3B** — spec-nya belum ditulis; mulai dari brainstorming di atas daftar
   "ditunda ke 3B".
2. **Tutup dataset wilayah** (blocker di atas) — pekerjaan data murni.
3. **Gabungkan ke `slice-1-frontend`** lewat PR. `gh` CLI tidak terpasang di mesin
   ini; siapkan judul + body lalu pakai URL compare GitHub.

### Pekerjaan lain yang menunggu

**Kerja slice 2K belum di-commit ke `slice-1-frontend`** — masih di branch
`slice-2-templates-mobile`.

0. **Jalankan `npm run verify`** (hentikan `next dev` dulu — `bug-023`) untuk menutup perbaikan warna 2026-08-23: build + e2e belum dijalankan. `npm run seed:reset` dulu kalau store sudah termutasi.
1. **Foto asli.** Kesepuluh tema masih memakai placeholder berlabel karena `media: []`. Pipeline unggah sudah jalan (Task 8) — begitu ada foto, `Img` otomatis menggantikan `Ph` tanpa sentuh tema. Kalau ingin melihat tema dengan foto sungguhan, unggah lewat halaman detail project.
2. **Sisir tema di layar sungguhan.** Papan `/preview` memakai iframe 390px; buka `/preview/{tema}` di ponsel untuk memastikan target sentuh dan panjang teks Indonesia (kata panjang seperti "Ketersediaan") tidak memecah tombol.
3. **Situs profil agen** `{subdomain}.listingku.app` — Settings sudah MENGISI datanya, belum ada yang membacanya. Butuh middleware subdomain + desain (desainnya belum ada).
4. **`leads.updateStatus`** + dropdown status di tabel (ditunda oleh keputusan user).
5. **Unggah logo** di tab Tampilan masih placeholder — pipeline media selalu mengikat aset ke `projectId`, aset milik profil belum punya tempat.
6. **Email notifikasi lead** (`notifyOnLead` tersimpan, belum ada yang mengirim).
7. Aset `public/brand/listingku-mark.png` masih placeholder.

### Catatan penting untuk sesi berikut

- **Jangan jalankan `npm run build`/`npm run verify` selagi `next dev` hidup** — `.next` rusak dan SELURUH e2e timeout (`bug-023`). Cek port 3000 dulu.
- **`npm run seed:reset` WAJIB sebelum e2e** kalau store sudah termutasi run sebelumnya (publish.spec memublikasikan casa-verde; landing-ssr.spec menuntutnya masih draft).
- **`npm run seed:reset` juga WAJIB sesudah mengubah `fixtures/seed.ts`.**
- **Dev server memegang store di memori.** Mengubah seed lalu me-refresh browser TIDAK cukup — restart dev server-nya.
- **Jangan menulis asersi e2e bernilai absolut** — satu mock store bersama, serial (`workers:1`).
- AI 100% **mock** lewat `getGenerator()` di `lib/ai/index.ts`.
- `lib/data/index.ts` menyentuh `node:fs` saat modul dimuat — **jangan impor barrel `@/lib/data` dari Edge runtime.**

---

## 📜 Riwayat: slice 1 + slice 2A (arsip)

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

### Slice 2A — fondasi tema & Tropis Hangat

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
  - **Kesepuluh tema berbagi content JSON yang identik** — hanya layout/gaya dan urutan section
    yang berbeda. Tiap tema punya set komponennya sendiri di `lib/landing/themes/<nama>/`;
    komponen tema TIDAK boleh menulis warna literal (ditegakkan `theme-no-literal-colors.test.ts`)
    dan TIDAK boleh memakai media query `min-width` (landing mobile-only, 390px).
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
npm run seed:reset && npm run verify   # unit + build + e2e (dev server HARUS mati dulu)

# Melihat kesepuluh tema:
#   /preview          papan banding 10 tema berdampingan
#   /preview/{tema}   satu tema penuh (premiumDark, editorialWhite, corporateBlue,
#                     softLuxury, boldRetail, architectural, natureCalm,
#                     classicNavy, playfulPastel, tropicalWarm)
#   /parkspring-gading  halaman publik sungguhan

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
