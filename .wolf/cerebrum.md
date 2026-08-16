# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-08-16

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

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

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
