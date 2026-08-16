# STATUS — listinganku

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-08-16

---

## ✅ Done

**Dokumentasi & perencanaan**
- `CLAUDE.md` ditulis — ringkasan produk + arsitektur terencana, disuling dari PRD v3.0 + flow doc Fase 0–9.
- Design system + 11 layar aplikasi diimpor dan dibaca penuh dari Claude Design project `8059d123-0b3d-4faf-b7be-b76ce3506622` lewat tool `DesignSync`.
- **Spec slice 1 disetujui dan ditulis:** `docs/superpowers/specs/2026-08-16-listingku-frontend-slice1-design.md`.
- **Implementation plan slice 1 selesai + self-review:** `docs/superpowers/plans/2026-08-16-listingku-frontend-slice1.md` — 18 task TDD, tiap task berakhir commit.

**Belum ada satu baris kode aplikasi.** Repo masih berisi docs + tooling saja; Next.js belum di-scaffold.

---

## 🚀 Next phase

**Goal:** Mengeksekusi `docs/superpowers/plans/2026-08-16-listingku-frontend-slice1.md` task demi task — lewat `superpowers:subagent-driven-development` (satu subagent per task) atau `superpowers:executing-plans` (inline).

**Urutan 18 task:** 1 scaffold+token · 2 komponen DS · 3 primitif Radix · 4 utilitas murni · 5 model blocks · 6 lapisan data+seed · 7 sesi+login+dashboard · 8 pipeline media · 9 skema Zod+wizard · 10 detail project+sheet tipe · 11 `resolve.ts` · 12 tema wireframe+renderer · 13 landing SSR+SEO · 14 interaktivitas landing · 15 AI mock+layar generate · 16 block editor · 17 publish+QR · 18 spec Playwright tulang punggung.

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
  - Blocks menyimpan **referensi** (mediaId, houseTypeId), bukan salinan harga/foto.
  - Field teks kosong = pakai default AI; mengisi = override. "Use AI suggestion" cukup menghapus override.
  - Ketiga tema berbagi content JSON identik — hanya layout/gaya yang berbeda.
  - Copy wajib patuh aturan DS: **Anda** formal, **kami**, sentence case, tanpa emoji, tanpa tanda seru, angka gaya Indonesia.

---

## ⚠️ External blockers (don't block coding)

- **Repo belum di-init git.** Spec belum bisa di-commit. Tawarkan `git init` ke user sebelum mulai koding.
- Desain landing publik + situs profil belum ada — user akan menyediakan. Sampai itu datang, keduanya wireframe.
- Webfont Neue Haas Grotesk berlisensi dan belum tersedia; Archivo dipakai sebagai pengganti.
- Supabase, Gemini API key, dan domain `listingku.app` belum diperlukan sama sekali di slice 1.

---

## 🔧 Useful commands

```bash
# Belum ada package.json — perintah di bawah berlaku setelah scaffold
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
