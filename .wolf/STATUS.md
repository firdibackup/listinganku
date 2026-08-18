# STATUS — listinganku

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-08-18 (Task 1–13 selesai)

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
- **Task 1–13 selesai**, semua lolos review kecuali 13 (baru selesai, menunggu review). `npm test` **212/212 hijau**, Playwright **8/8 hijau**, `npm run build` bersih. HEAD = `d57bd6a`.
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
- **5 dari 6 task butuh fix round** — mayoritas temuannya cacat di teks plan saya, bukan kesalahan implementer. Plan sudah diperbaiki di sumbernya supaya tidak menurun ke task berikutnya. Task 13 dikerjakan dari brief task-13-brief.md (bukan langsung dari plan), 2 cacat brief ditemukan & ditambal seperti tercatat di atas.

---

## 🚀 Next phase

**Goal:** Melanjutkan eksekusi `docs/superpowers/plans/2026-08-16-listingku-frontend-slice1.md` dari **Task 14** (interaktivitas landing publik — CTA WhatsApp dan form kontak sungguhan di block `agentCta`/`contactForm`, keduanya baru struktur kosong per komentar di `lib/landing/themes/wireframe/AgentCta.tsx`/`ContactFormBlock.tsx`), lewat `superpowers:subagent-driven-development` (satu subagent per task, review per task, review branch penuh di akhir).

**Urutan 18 task:** ~~1 scaffold+token~~ ✅ · ~~2 komponen DS~~ ✅ · ~~3 primitif Radix~~ ✅ · ~~4 utilitas murni~~ ✅ · ~~5 model blocks~~ ✅ · ~~6 lapisan data+seed~~ ✅ · ~~7 sesi+login+dashboard~~ ✅ · ~~8 pipeline media~~ ✅ · ~~9 skema Zod+wizard~~ ✅ · ~~10 detail project+sheet tipe~~ ✅ · ~~11 `resolve.ts`~~ ✅ · ~~12 tema wireframe+renderer~~ ✅ · ~~13 landing SSR+SEO~~ ✅ · **14 interaktivitas landing** ← berikutnya · 15 AI mock+layar generate · 16 block editor · 17 publish+QR · 18 spec Playwright tulang punggung.

**Catatan untuk Task 14:** `db.events.record({projectId, houseTypeId?, type})` **belum dipanggil sama sekali** — Task 13 sengaja tidak mencatat event `visitor` di SSR page load (brief task-13 tidak memintanya, dan mencatat pageview di Server Component yang bisa dipanggil ulang oleh cache/prefetch berisiko dobel-hitung). Task 14 kemungkinan tempat wajarnya untuk `whatsapp_click`/`form_submit`, dan mungkin juga `visitor` — cek spec §14 sebelum mengasumsikan.

### Acceptance criteria
Lihat §14 "Definisi selesai" di spec. Ringkasnya:
1. `npm run dev` jalan tanpa layanan eksternal apa pun (tanpa Supabase, tanpa API key).
2. Alur penuh Login → Create Project → Add House Type → Generate AI → Block Editor → Publish → landing live bisa diselesaikan di browser dengan data yang diketik sendiri, dan bertahan setelah dev server restart.
3. `/{slug}` benar-benar server-rendered — dibuktikan lewat View Source — lengkap meta/OG/JSON-LD/canonical + `sitemap.xml` + `robots.txt`.
4. Jalur gagal AI bisa dicapai dan publish tetap berhasil dengan konten manual.
5. Tujuh layar cocok dengan `Listingku App.dc.html`.
6. Playwright hijau, unit test hijau, `npm run build` bersih.

### Files to create / edit
Struktur lengkap ada di §12 spec. Titik masuk yang paling menentukan:

| Type | File | Content |
|---|---|---|
| new | `lib/data/repo.ts` | Interface `DataStore` — satu-satunya kontrak yang dilihat UI |
| new | `lib/data/mock/` | Store singleton + snapshot ke `.data/store.json` + seed |
| new | `lib/landing/resolve.ts` | Fungsi murni: rantai override → AI → kosong |
| new | `lib/landing/themes/` | Registry `(tema, tipe blok) → komponen`; slice 1 hanya `wireframe/` |
| new | `components/ds/` | Port 1:1 Button, Card, Chip, Banner, Input, NavLink dari `_ds_bundle.js` |
| new | `app/(public)/[slug]/page.tsx` | Landing SSR wireframe |
| new | `styles/tokens/` | Salinan verbatim token DS |

**Env override yang sudah ada:** `LISTINGKU_DATA_DIR` (snapshot store) dan `LISTINGKU_UPLOAD_DIR` (folder upload) — pakai di tes supaya `.data/` dan `public/uploads/` asli tidak tersentuh.

### Closed decisions
- Fondasi produksi, bukan prototype — repository seam + Server Actions.
- Slice 1 = thin slice end-to-end, 7 dari 11 layar, semuanya terwiring.
- `blocks`/`seo`/`theme`/`ai_content` ada di `projects`, **bukan** `house_types` (koreksi terhadap skema PRD).
- Komponen hybrid: port DS 1:1 + Radix untuk Dialog/Sheet/Tabs/Switch/Accordion/Toast/Table.
- Landing publik & situs profil = wireframe berstruktur; desain aslinya menyusul dari user.
- Pratinjau editor memakai `BlockRenderer` sungguhan, bukan frame skematik.
- Palette: evergreen `#233D2D` + oranye `#D2421A`. Dokumen pen.dev (biru `#2563EB`) **usang, jangan dipakai**.

### Open decisions
- Tidak ada yang memblokir. Empat item terbuka yang tidak menghambat ada di §16 spec (hijau logo, font berlisensi, set ikon, URL scoped).

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

- Desain landing publik + situs profil belum ada — user akan menyediakan. Sampai itu datang, keduanya wireframe.
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
