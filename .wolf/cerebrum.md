# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-08-18

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Berkomunikasi dalam Bahasa Indonesia (istilah teknis tetap Inggris). Balas dalam bahasa yang sama.
- Menjawab singkat dan cepat ("sudah okee", "iya boleh ditunda", "lanjut"). Sajikan pilihan konkret dengan rekomendasi tegas, bukan survei opsi netral — dia memilih rekomendasi hampir setiap kali.
- **Mendesain di Claude Design (claude.ai/design), bukan Figma.** Sebelum mengasumsikan tidak ada desain, tanyakan atau cek — dia sempat memilih "fungsional dulu, poles belakangan" lalu ternyata sudah punya design system lengkap + 11 layar jadi.
- Mengerjakan front-end lebih dulu dengan data dummy, backend menyusul — tapi minta fondasi produksi, bukan prototype sekali pakai.
- Menyediakan desain bertahap: bagian yang belum ada desainnya minta dibuat **wireframe** dulu, jangan digarap visualnya karena akan diganti.

## Key Learnings

- **Project:** listinganku
- Repo has no application code yet — only PRD, onboarding flow doc, and AI-tooling scaffolding (OpenWolf/graphify/Codex/OpenCode configs). CLAUDE.md (2026-08-16) is a condensed spec distilled from the PRD + flow doc for future implementation sessions; treat it as the architecture/product source of truth until the Next.js app is actually scaffolded.
- Key product decision to remember: landing pages are generated **per Primary Property (Project)**, not per house type — one project with N house types = one landing page with N sections. Don't build per-house-type routes/pages.
- **Design ada di Claude Design**, dibaca lewat tool `DesignSync`. projectId `8059d123-0b3d-4faf-b7be-b76ce3506622`, file utama `Listingku App.dc.html` (11 layar, ~105KB) + design system `listingku-design-system-adfd85b5`. `get_file` mengembalikan JSON dengan field `content`; file besar disimpan ke tool-results, decode dulu dengan node sebelum dibaca.
- **Jebakan palette:** `uploads/Instruksi Prompt UI Listingku untuk pen.dev` menetapkan minimalist biru `#2563EB` — **dokumen itu usang**. Yang berlaku adalah evergreen `#233D2D` (suara utama) + oranye `#D2421A` (konversi saja) + leaf `#00803A` (mark & sukses saja, tidak pernah jadi fill tombol/permukaan).
- Design system memuat **aturan konten yang mengikat**, bukan sekadar visual: Bahasa Indonesia formal **Anda** (kapital) dan **kami**, tidak pernah *kamu*/*saya*; sentence case; **tanpa emoji, tanpa tanda seru**; angka gaya Indonesia (`Rp 2,45 M`, `1,2jt`, `09.00 WIB`).
- DS hanya mendefinisikan 6 komponen (Button, Card, Chip, Banner, Input, NavLink) dan menyatakannya eksplisit. Tabs/Switch/Toast/Dialog/Sheet/Accordion/Table harus datang dari Radix dan dicat token DS.
- `Canvas.dc.html` dan `Canvas-2.dc.html` di project design **kosong** — jangan buang waktu membacanya lagi.
- **JSON-LD lewat `dangerouslySetInnerHTML` butuh escape manual.** `JSON.stringify()` biasa tidak meng-escape `<`, jadi string apa pun yang berasal dari input pengguna (nama project, dsb.) dan memuat `</script>` bisa memutus tag `<script>` di level parser HTML — parser HTML mengenali `</script` murni dari teks mentahnya, tanpa peduli isi/atribut `type`. Pola aman: `JSON.stringify(data).replace(/</g, '\\u003c')` sebelum dipasang ke `__html` (`lib/landing/seo.ts:jsonLdScript`). `<title>`/meta tags TIDAK butuh ini — itu children React biasa, auto-escaped ke entities HTML.
- **Next.js membekukan route file (`sitemap.ts`, `robots.ts`, route handler) jadi statis di build time secara default** kalau tidak ada API dinamis (cookies/headers) yang terlihat — baca data lewat panggilan fungsi biasa ke `db` (bukan `fetch()`) tidak dianggap dependency dinamis oleh Next. Untuk route yang datanya bisa berubah di runtime tanpa rebuild (mis. `sitemap.ts` di atas mock store), wajib `export const dynamic = 'force-dynamic'`. Cek lewat tabel rute `next build` (`○` statis vs `ƒ` dinamis) — dev mode (`next dev`) tidak akan pernah menampakkan bug ini karena dev selalu re-eksekusi tiap request.
- **`next start` butuh `.next` yang valid dari `next build` TERAKHIR** — menjalankan `next dev` (termasuk lewat `npx playwright test`, yang men-start dev server via `webServer.command`) di antara `next build` dan `next start` merusak `.next` (BUILD_ID hilang). Selalu `npm run build` PERSIS sebelum `next start` untuk verifikasi produksi, tanpa `next dev` di antaranya.
- Server Component dinamis (`[slug]/page.tsx` tanpa `generateStaticParams`) tetap `ƒ` (server-rendered per request) secara default — beda dengan file route statis di atas. `cache()` dari `'react'` aman dipakai untuk menyatukan panggilan data antara `generateMetadata` dan komponen halaman (dipanggil dua kali secara terpisah kalau tidak).
- **Playwright e2e terhadap `next dev` webServer: panggilan PERTAMA ke sebuah Server Action membayar kompilasi on-demand (~10s+ terukur) yang melewati default `expect` timeout Playwright (5s).** Test submit pertama di sebuah file gagal dari cold; test submit tepat sesudahnya lolos karena action sudah warm. Test dalam satu file jalan serial (`fullyParallel` default `false`), jadi yang kena cold-compile selalu test PERTAMA yang memicu action itu. Fix: `expect: { timeout: 15_000 }` di `playwright.config.ts` — bukan menyentuh test, kondisi yang di-assert tidak berubah. Gejala khas di snapshot kegagalan: tombol submit masih `[disabled]` (pending tak pernah selesai), form utuh, tanpa pesan error — bedakan dari action yang benar-benar error (itu me-*re-enable* tombol dan menampilkan pesan).

- **E2e Playwright dari plan yang BELUM PERNAH dijalankan hampir selalu punya bug test-authoring (bukan bug app).** Empat pola yang muncul di Task 16–18: (1) race sesi — `click('Kirim magic link')` lalu `page.goto(rute-dashboard)` tanpa `waitForURL(/dashboard$/)` → middleware pantul ke /login; (2) `getByLabel` substring — `getByLabel('Judul')` ikut cocok 'Subjudul', pakai `{exact:true}`; (3) race navigasi `next dev` — klik tombol atau baca `page.url()` sebelum navigasi commit; selalu `waitForURL(...)` dulu; (4) label ganda — CTA header + tile grid "Add house type" dua tombol identik, pakai `.first()`. **Snapshot `error-context.md` (accessibility tree saat gagal) adalah alat diagnosis tercepat — baca itu, jangan menebak.**
- **`<Link href><Button>Label</Button></Link>` menghasilkan DUA elemen ber-accessible-name sama (role link DAN role button, nested).** `getByRole('button',{name})` bisa resolve ke tombol lama saat navigasi in-flight lalu mengekliknya (re-navigate, bukan aksi tujuan) — panel tujuan tampak "tidak bereaksi". Tunggu `waitForURL` ke halaman tujuan sebelum menarget tombolnya.
- **Satu mock store bersama (`.data/store.json`) tanpa isolasi per-test = e2e WAJIB serial (`workers:1`).** Worker paralel berebut state global (publish.spec ubah casa-verde→published vs landing-ssr.spec assert draft). Serial + urutan file abjad Playwright membuat asersi selalu mendahului mutasi. Jangan kembalikan ke paralel tanpa isolasi sungguhan.
- **`renameSync` (atomic write) di Windows sesekali gagal EPERM/EACCES saat file tujuan terkunci sejenak (antivirus/indexer/pembaca).** Muncul cuma di bawah beban (suite penuh menulis snapshot bertubi-tubi), jadi run terisolasi menyembunyikannya. Bungkus retry transien (`Atomics.wait` untuk tidur sinkron di jalur non-async). Berlaku untuk semua rename-over-existing yang jalan di Windows.
- **Kode di plan implementasi bisa punya cacat yang baru ketahuan saat dieksekusi**, walau task awal mulus. Task 16: plan memanggil `<BlockRenderer projectId=...>` (prop tak ada → tsc gagal) dan membungkus blok interaktif di `<button>` (DOM invalid). Verifikasi tipe/API/DOM terhadap kode NYATA sebelum menyalin kode plan mentah — `next build` menangkap yang tipe, mata menangkap yang DOM.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-08-17] **Aset logo `public/brand/*.png` yang diminta task 7 ("unduh dari project Claude Design") tidak bisa dipenuhi dari sesi subagent** — tidak ada tool DesignSync/akses project Claude Design di context subagent, hanya di sesi utama. Disintesis 3 PNG placeholder (wordmark + mark, palette evergreen/oranye) lewat `node_modules/sharp` langsung dari script sementara, bukan didownload. Kalau butuh aset asli, jalankan `DesignSync` dari sesi utama (bukan subagent) lalu re-export ke `public/brand/`.
- [2026-08-17] Server Component async (`app/(dashboard)/layout.tsx`, `.../page.tsx`) bisa dites langsung di Vitest+jsdom tanpa server Next sungguhan: panggil fungsinya sebagai async function (`await DashboardPage()`), lalu `render()` hasil JSX-nya dengan RTL. `next/image` dan `next/link` merender apa adanya di jsdom tanpa mock tambahan. `redirect()` dari `next/navigation` di-mock supaya `throw` bisa ditangkap `rejects.toThrow` — variabel yang dipakai di dalam factory `vi.mock` wajib dibungkus `vi.hoisted()`, kalau tidak kena "Cannot access 'x' before initialization" karena factory di-hoist ke atas file.

- [2026-08-18] npm cache di Windows bisa membengkak sampai puluhan GB (terukur **42GB**) dan memenuhi disk sistem — Playwright lalu gagal `ENOSPC: no space left on device` saat menulis trace (bukan bug test). Kalau e2e gagal ENOSPC / disk penuh: cek `df -h .`, lalu `npm cache clean --force` (bebaskan cache dulu, jangan hapus `node_modules`). `.next` (~190MB) juga aman dihapus.
- [2026-08-18] Mocking `node:fs` di Vitest lewat `vi.mock('node:fs', {...actual, renameSync: mock})` TIDAK meng-intercept named import `renameSync` yang dipakai modul lain (spy 0 kali dipanggil, fungsi asli tetap jalan). Untuk menguji fungsi yang membungkus builtin fs, pakai **seam dependency-injection** (terima fungsi sebagai parameter, default = builtin) alih-alih mem-mock `node:fs`.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

Detail lengkap + alasan ada di `docs/superpowers/specs/2026-08-16-listingku-frontend-slice1-design.md` §15.

- **[2026-08-16] Repository seam + Server Actions**, bukan Zustand/localStorage atau mock HTTP layer. Landing publik wajib SSR untuk SEO; store di klien akan memaksa penulisan ulang halaman saat Supabase masuk, dan lapisan HTTP tidak dipakai arsitektur final (Server Component memanggil Supabase langsung).
- **[2026-08-16] Mock store di-snapshot ke `.data/store.json`.** Bukan sekadar kenyamanan — HMR Next.js me-reset state level modul, jadi tanpa snapshot data yang diketik hilang.
- **[2026-08-16] `blocks`/`seo`/`theme`/`ai_content` pindah dari `house_types` ke `projects`.** Blok skema di PRD adalah peninggalan sebelum v3.0; karena satu landing = satu project, tidak ada baris `house_types` yang bisa memiliki halaman itu.
- **[2026-08-16] Respons AI dipecah saat disimpan** — bagian proyek ke `projects.ai_content`, tiap `houseTypes[]` ke baris `house_types` masing-masing. Menyimpan utuh membuat entri yatim saat tipe dihapus dan membuat editor menulis ke indeks array, bukan ke baris yang benar.
- **[2026-08-16] Blocks menyimpan referensi (mediaId, houseTypeId), bukan salinan harga/foto.** Membuat US-B3 otomatis terpenuhi: ubah harga di detail tipe, landing live ikut berubah tanpa menyentuh editor.
- **[2026-08-16] Field teks kosong = pakai default AI, mengisi = override.** Konsekuensinya tombol "Use AI suggestion" (US-C2) bukan fitur terpisah — ia cukup menghapus override.
- **[2026-08-16] Komponen hybrid: port DS 1:1 + Radix untuk sisanya.** Menulis focus trap, ARIA, dan keyboard nav sendiri adalah tempat bug aksesibilitas paling sering lolos; tapi Button/Card/Chip tetap di-port karena itu identitas brand.
- **[2026-08-16] Pratinjau editor memakai `BlockRenderer` sungguhan, bukan frame skematik seperti di file design.** US-F1 menuntut pratinjau identik dengan live; dua representasi akan berdivergensi begitu tema asli masuk. Chrome design (header PRATINJAU, toggle DESKTOP/MOBILE, ring evergreen) tetap dipertahankan.
- **[2026-08-16] Tabrakan slug di root** (`/{project-slug}` vs `/dashboard`) diselesaikan dengan daftar slug terlarang + suffix angka, bukan URL scoped `/u/{agen}/{slug}`. PRD Open Question #2 dengan demikian dijawab.
