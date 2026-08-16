# Product Requirements Document (PRD)

## Listingku MVP — Website Generator & Website Profil Agen

| Informasi | Detail |
|---|---|
| **Produk** | Listingku — AI-Powered Property Marketing Platform |
| **Cakupan Dokumen** | MVP Final: Website Generator + Website Profil Agen |
| **Stack** | Next.js 15 App Router (monolith) + Supabase + shadcn/ui |
| **Basis** | Dokumen produk Listingku (Markdown_Listingku), flow onboarding resmi (Fase 0–9), keputusan stack & scope yang disepakati |
| **Penulis** | Manus AI |
| **Versi** | 3.0 (Final — siap sprint) |
| **Tanggal** | 9 Agustus 2026 |
| **Revisi Kunci** | Landing page dibuat per **Primary Property** (Project); tipe rumah menjadi konten/section di dalamnya, bukan satu landing per tipe |

---

## Executive Summary

Listingku adalah platform SaaS pemasaran properti berbasis AI untuk agen properti independen di Indonesia. Visi produk adalah menjadi **"Property Marketing Operating System"** — dengan satu input data proyek/listing, agen mendapatkan seluruh aset pemasaran (landing page, copywriting, SEO, lead capture) dalam hitungan menit. **North Star Metric**-nya adalah **"Time to Publish"**: agen harus bisa mempublikasikan landing page properti profesional dalam waktu **kurang dari 10 menit** dari mulai mengisi data.

PRD final ini mencakup lingkup MVP yang telah disepakati: **Website Generator** (pilar utama) dan **Website Profil Agen** (ditambahkan ke MVP atas keputusan produk terbaru). Alur pengguna mengikuti flow onboarding resmi (Fase 0–9): login (Fase 0) → wizard setup profil 5 langkah satu kali saja (Fase 1) → situs profil live di `{subdomain}.listingku.app` (Fase 1A) → dashboard (Fase 2) → lalu pipeline per **Primary Property**: Create Project (Fase 3) → tambah tipe rumah (Fase 4) → Generate AI (Fase 5) → Block Editor (Fase 6) → Publish satu klik (Fase 7) → Share & QR (Fase 8) → operasional leads/analytics (Fase 9), dengan siklus berulang < 10 menit per Primary Property.

Meskipun dokumen produk jangka panjang merencanakan monorepo Turborepo + Prisma + Cloudflare R2, MVP final ini **disederhanakan menjadi monolith Next.js + Supabase** (database, auth, storage, realtime sekaligus) agar rilis cepat; migrasi ke monorepo tetap terbuka karena skema entitas dibuat konsisten dengan model data jangka panjang. Prinsip desain tetap dipertahankan: **editor terpimpin** (tanpa drag-and-drop bebas), **AI opsional** (tidak pernah memblokir publish), dan **3 tema landing** (5 tema profil agen).

> **One Primary Property → Everything (MVP):** satu input data proyek + daftar tipe rumahnya → AI menghasilkan konten lengkap → **satu landing page profesional live** dengan satu klik publish, berisi semua tipe unit sebagai section di dalamnya → situs profil agen memperkuat kredibilitas dan SEO.

## Problem Statement

Agen properti menghadapi tiga masalah besar dalam memasarkan satu listing: (1) **lambat** — membuat landing page atau iklan profesional biasanya memakan waktu berjam-jam hingga berhari-hari (menulis copy, memilih foto, merakit halaman); (2) **membutuhkan keahlian** — menulis copy yang menjual dan merancang halaman yang terlihat profesional bukan kompetensi utama agen; (3) **terfragmentasi** — foto di galeri HP, copy di catatan, link properti tercecer, sehingga proses promosi manual berulang-ulang untuk setiap tipe rumah dalam satu proyek.

Akibatnya, banyak listing properti — khususnya dari agen independen dan tipe unit baru dalam suatu proyek — terpasarkan dengan minim atau bahkan tanpa media promosi digital sama sekali. Alat builder generik (Wix, Framer) tidak memahami domain properti: mereka menuntut user menjadi *web designer*, sedangkan agen ingin cukup menjadi *penjual rumah*. Selain itu, agen independen umumnya tidak punya identitas digital permanen — calon pembeli yang ingin mengenal agennya lebih jauh tidak menemukan jejak profesionalnya.

**Mengapa sekarang?** Agen properti Indonesia sangat bergantung pada WhatsApp, Instagram, dan Facebook; halaman landing yang siap di-*share* dengan link dan QR code langsung memperpendek jalur dari "melihat" ke "bertanya". AI generative (Gemini Flash dengan structured output) kini cukup murah dan cepat untuk dijadikan copilot otomatis yang berjalan satu kali per tipe unit — membuat solusi ini layak secara biaya unit.

## Goals & Objectives

Tujuan utama MVP adalah membuktikan bahwa agen mau menggunakannya dan bersedia berlangganan setelah merasakan kecepatan publish.

| # | Tujuan | Target |
|---|---|---|
| G1 | Meminimalkan waktu dari input data sampai landing live (*Time to Publish*) | **≥50% landing Primary Property dipublish dalam <10 menit** (North Star) |
| G2 | Membuktikan nilai AI dalam pembuatan konten properti | **≥20% landing dibuat dengan konten AI** |
| G3 | Memastikan hasil terlihat profesional tanpa keahlian desain | **0 template "rusak"** — semua landing mengikuti preset terkurasi, agen hanya mengisi konten |
| G4 | Validasi willingness-to-pay | **100 agen mendaftar** pada 3 bulan pertama (target bisnis) |
| G5 | Volume output untuk membuktikan traksi | **≥200 landing Primary Property dipublikasikan** (setiap landing berisi rata-rata 2–5 tipe unit), **≥1.000 lead** |
| G6 | Kredibilitas digital agen | **≥50 agen menyelesaikan wizard profil** dan memiliki situs profil live (`*.listingku.app`) |

## User Personas

### Persona Utama — "Agen Mandiri" (Andi, 32)

Andi adalah agen properti independen (atau berafiliasi dengan RE/MAX, Ray White, ERA) berusia 28–45 tahun, mengelola 5–25 listing aktif dari berbagai proyek (baru/pre-launch maupun stok developer). Ia berjualan lewat WhatsApp, Instagram, dan Facebook Marketplace; familiar teknologi, namun **bukan web designer dan bukan penulis konten**. Ia juga belum punya kehadiran digital permanen — tidak ada website pribadi, hanya brosur dan akun sosmed. Satu proyeknya biasanya berisi beberapa tipe unit (misalnya 3–5 tipe), dan selama ini ia harus mengirim brosur PDF besar berisi semua tipe ke calon pembeli, menulis ulang deskripsi yang sama di banyak platform, dan kehilangan prospek karena respon lambat. Kebutuhan kuncinya: *"Saya ingin menjual property ini"* — bukan *"saya ingin bermain AI"*.

### Persona Sekunder — "Tim Agen Perusahaan" (Sari, 38)

Sari adalah team leader agen di kantor property. Ia butuh membuat banyak landing untuk tipe unit yang banyak (bisa puluhan tipe per proyek) dengan konsistensi kualitas, dan ingin delegasi pembuatan landing ke junior agent. Ia lebih toleran terhadap langkah tambahan asalkan hasilnya seragam dan bisa di-*share* ke seluruh tim.

> Catatan MVP: UI dioptimalkan untuk Persona Utama. Persona Sekunder dilayani secara implisit lewat batas *listing aktif* per akun (kuota Starter/Pro), tanpa fitur multi-agent di MVP ini. Website Profil Agen memakai 5 tema preset tanpa editor desain bebas, sehingga tetap ramah agen non-desainer.

## User Stories & Requirements

### Epic A — Project Manager (Entitas Proyek)

**US-A1 — Membuat Project**
As a [agen properti], I want to [membuat Project baru dengan nama, lokasi, developer, dan deskripsi singkat], So that [saya punya wadah untuk mengelompokkan semua tipe rumah dalam satu proyek pemasaran].
- Acceptance Criteria:
  - Given saya di dashboard, when saya klik "+ Create Project" dan mengisi nama, lokasi, developer (string), dan deskripsi lalu submit, then Project tersimpan dengan status *Draft* dan saya diarahkan ke halaman detail Project.
  - Given saya memasukkan nama kosong, when saya submit, then saya melihat validasi error pada field nama.
  - Given saya menekan "skip" pada wizard, then Project tetap tersimpan sebagai Draft.

**US-A2 — Melihat dan mengelola daftar Project**
As a [agen properti], I want to [melihat daftar Project saya lengkap dengan status (Draft/Published) dan jumlah House Type], So that [saya bisa menemukan dan melanjutkan listing dengan cepat].
- Acceptance Criteria:
  - Given saya login, when saya membuka Dashboard, then saya melihat kartu-kartu Project beserta badge status dan jumlah tipe unit.
  - Given Project dalam Draft, when saya klik Project, then saya dapat melanjutkan edit atau menambah House Type.
  - Given belum ada Project, when saya membuka Dashboard, then saya melihat prompt mencolok "+ Create First Project".

**US-A3 — Mengedit dan menghapus Project**
As a [agen properti], I want to [mengedit atau menghapus Project], So that [data proyek selalu akurat atau hilang jika batal dipasarkan].
- Acceptance Criteria:
  - Given saya di halaman detail Project, when saya mengubah field lalu Save, then perubahan tersimpan dan reflektif di dashboard.
  - Given Project belum dipublish, when saya pilih Delete dan konfirmasi, then Project dan seluruh House Type di dalamnya terhapus (soft delete disarankan).
  - Given Project sudah Published, when saya pilih Delete, then saya diminta unpublish terlebih dahulu atau konfirmasi dampak pada URL live.

### Epic B — House Type Manager (Tipe Unit)

**US-B1 — Menambah House Type (tipe rumah) dalam Primary Property**
As a [agen properti], I want to [menambah House Type (nama tipe, harga, luas tanah, luas bangunan, kamar tidur, kamar mandi, carport) ke dalam Primary Property], So that [setiap tipe unit punya identitas datanya sendiri sebagai konten/section di dalam landing page Primary Property].
- Acceptance Criteria:
  - Given saya di halaman detail Primary Property, when saya klik "+ Add House Type" dan mengisi spesifikasi lengkap, then House Type tersimpan dengan status *Draft* sebagai anak dari Primary Property.
  - Given saya memasukkan harga bukan angka positif, when saya submit, then saya melihat validasi error.
  - Field wajib MVP: nama tipe, harga, luas tanah, luas bangunan, jumlah kamar tidur, kamar mandi, carport.
  - Satu Primary Property dapat menampung 1 hingga banyak House Type (misalnya "ParkSpring Gading" berisi Villa, Midea, Grand) — semua tampil sebagai section di landing page Primary Property.

**US-B2 — Upload galeri foto dan denah House Type**
As a [agen properti], I want to [mengunggah foto interior/eksterior serta denah (floor plan/site plan) untuk tiap House Type], So that [landing page punya aset visual lengkap].
- Acceptance Criteria:
  - Given saya di detail House Type, when saya upload 1–20 foto (JPG/PNG/WebP, maks 10MB/file), then foto tersimpan di Supabase Storage dan masuk galeri House Type.
  - Given saya upload denah, when saya menandai file sebagai "floor plan", then file tersimpan sebagai aset denah dan tampil di blok Floor Plan landing.
  - Given upload gagal (file >10MB atau format salah), when saya submit, then saya melihat pesan error spesifik per file.

**US-B3 — Mengedit House Type**
As a [agen properti], I want to [mengedit spesifikasi dan foto House Type], So that [data tetap akurat saat ada perubahan harga atau stok].
- Acceptance Criteria:
  - Given saya mengubah harga House Type pada Primary Property yang sudah Published, when saya Save, then perubahan tersimpan; landing page live merefleksikan perubahan pada render berikutnya.

### Epic C — AI Listing Assistant

**US-C1 — Generate konten AI per Primary Property**
As a [agen properti], I want to [menekan tombol "Generate AI" setelah Primary Property memiliki minimal 1 House Type dengan data dan foto lengkap], So that [konten marketing lengkap untuk landing Primary Property terisi otomatis dalam hitungan detik: deskripsi proyek, deskripsi per tipe rumah, selling points, FAQ, SEO title/description, caption media sosial].
- Acceptance Criteria:
  - Given minimal 1 House Type terisi lengkap dan foto terunggah, when saya klik "Generate AI", then sistem memanggil Gemini 2.5 Flash dengan `responseSchema` dan menampilkan indikator loading.
  - Given pemanggilan berhasil, when AI selesai, then hasil JSON tersimpan sebagai *content draft* pada Primary Property (konten umum proyek + blok konten per House Type) dan preview konten tampil di editor.
  - Given pemanggilan gagal/timeout, when error terjadi, then saya melihat pesan error dengan tombol "Retry", tanpa data hilang.
  - AI di-call **sekali per Primary Property** (satu landing); output JSON berisi: `headline` (proyek), `description` proyek (≥300 kata), `houseTypes[]` (konten per tipe: deskripsi singkat, selling points), `sellingPoints` proyek (4–6 butir), `faq` (3–5 Q&A), `seo.title`, `seo.description`, `captions` (Instagram, Facebook, WhatsApp).

**US-C2 — Mengedit konten hasil AI sebelum dipakai**
As a [agen properti], I want to [mengedit teks hasil AI (headline, deskripsi, FAQ, SEO)], So that [konten terasa personal dan akurat sesuai kondisi nyata properti].
- Acceptance Criteria:
  - Given konten AI sudah dihasilkan, when saya membuka editor dan mengubah teks, then perubahan tersimpan di database sebagai override atas default AI.
  - Given saya mengembalikan nilai default, when saya klik "Use AI suggestion", then teks kembali ke hasil AI.

**US-C3 — Pencatatan penggunaan AI**
As a [product owner], I want to [mencatat setiap pemanggilan AI pada tabel usage], So that [nanti dapat dikonversi ke sistem kredit Starter/Pro].
- Acceptance Criteria:
  - Setiap successful call mencatat 1 entri `AIUsage` (userId, model, latency, timestamp). Kuota pemblokiran belum diterapkan di MVP.

### Epic D — Landing Page Generator & Template

**US-D1 — Auto-generate landing page per Primary Property**
As a [agen properti], I want to [landing page Primary Property (satu per proyek) terbuat otomatis begitu kontennya siap], So that [saya tidak perlu merakit halaman dari nol — semua tipe rumah tampil sebagai section di dalamnya].
- Acceptance Criteria:
  - Given Primary Property memiliki konten (AI atau manual) dan minimal 3 foto (gabungan foto proyek + foto House Type), when landing page di-generate, then halaman berisi blok urutan default: Hero → Gallery → Highlights (selling points proyek) → **House Types** (kartu per tipe: foto, nama, harga, spesifikasi singkat, link ke section detail tipe) → Specifications per Tipe → Facilities → Floor Plans → Location → FAQ → Agent CTA → Contact Form.
  - Layout berbasis **template preset (opsi 3 tema MVP: Modern, Showcase, Luxury)**; blok dan properti isi tetap JSON identik, hanya layout/gaya yang berbeda.
  - **Satu URL landing per Primary Property**: `listingku.app/{project-slug}` (bukan per House Type). Setiap House Type adalah section/blok di dalam halaman yang sama.

**US-D2 — Mengganti tema landing**
As a [agen properti], I want to [mengganti tema landing page], So that [tampilan sesuai target pasar properti saya tanpa mengubah konten].
- Acceptance Criteria:
  - Given saya di editor, when saya memilih tema Modern/Showcase/Luxury, then pratinjau berubah dan perubahan tersimpan.

### Epic E — Block Editor (Terpimpin)

**US-E1 — Mengedit teks dan properti blok**
As a [agen properti], I want to [mengklik blok (Hero, Gallery, FAQ, CTA, Form) dan mengedit teks/judul/gambar melalui sidebar pengaturan], So that [saya bisa menyesuaikan konten tanpa mengganggu tata letak].
- Acceptance Criteria:
  - Given saya klik blok Hero, when sidebar terbuka, then saya dapat mengedit title, subtitle, dan gambar latar; semua perubahan tersimpan ke kolom JSON `blocks` pada Primary Property.
  - Dilarang di MVP: drag-and-drop bebas, ubah padding/margin manual, custom CSS — editor bersifat *terpimpin*.

**US-E2 — Mengatur urutan dan variasi blok**
As a [agen properti], I want to [menggeser urutan blok naik/turun dan memilih variasi layout blok (misalnya Hero style A/B/C)], So that [saya punya kontrol terbatas atas cerita halaman].
- Acceptance Criteria:
  - Given saya di editor, when saya klik panah atas/bawah pada blok, then urutan blok berubah dan pratinjau diperbarui.
  - Blok dapat di-*toggle* aktif/nonaktif (sembunyikan blok tanpa menghapus konten).

**US-E3 — Mengatur CTA: WhatsApp dan Form Lead**
As a [agen properti], I want to [menentukan jenis CTA (tombol WhatsApp dan/atau form kontak) di landing page], So that [prospek bisa menghubungi saya lewat channel favorit mereka].
- Acceptance Criteria:
  - Given saya mengatur CTA WhatsApp, when prospek klik tombol, then prospek diarahkan ke `wa.me/{nomor}?text={pesan default}` (pesan default berasal dari konten AI; nomor wajib berasal dari wizard profil).
  - Given saya mengaktifkan form kontak, when prospek mengisi nama, no. HP/WhatsApp, email (opsional), pesan, then lead tersimpan ke Supabase dan terasosiasi ke Primary Property.

### Epic F — Publish & Public Rendering (SSR + SEO)

**US-F1 — Preview landing page**
As a [agen properti], I want to [melihat pratinjau landing page seperti tampil di live], So that [saya yakin halaman siap dipublikasikan].
- Acceptance Criteria:
  - Given saya klik "Preview", when tab baru terbuka, then halaman dirender identik dengan versi live (server-side) — draft status tidak memblokir preview.

**US-F2 — Publish satu klik**
As a [agen properti], I want to [mempublikasikan landing page dengan satu klik], So that [halaman langsung live dan bisa dibagikan ke calon pembeli].
- Acceptance Criteria:
  - Given landing page belum dipublish, when saya klik "Publish" dan konfirmasi, then status menjadi *Published*, permalink aktif, dan saya mendapatkan URL final (salin otomatis ke clipboard).
  - Given landing sudah Published, when saya lakukan perubahan konten, then perubahan langsung terlihat di halaman live tanpa perlu publish ulang (render dinamis).
  - Skema URL MVP (subfolder di domain utama untuk SEO): **`listingku.app/{project-slug}`** — satu landing per Primary Property.

**US-F3 — SEO bawaan per halaman**
As a [product owner], I want to [setiap landing page memenuhi praktik SEO on-page dasar], So that [halaman terindeks Google tanpa konfigurasi manual agen].
- Acceptance Criteria:
  - Setiap halaman SSR memiliki: meta title & description (dari AI, bisa diedit), Open Graph tags (title, description, image), JSON-LD `schema.org/Product`/`RealEstateListing` + FAQPage, canonical tag, sitemap.xml/robots.txt otomatis.
  - Setiap halaman berisi konten unik minimal 300 kata hasil AI (deskripsi proyek + deskripsi tiap tipe rumah).

**US-F4 — QR Code & Share**
As a [agen properti], I want to [mengunduh QR code dan menyalin link landing page], So that [saya bisa menempelkan QR di brosur/kartu nama dan membagikan link di WhatsApp/Instagram].
- Acceptance Criteria:
  - Given landing sudah Published, when saya klik "Generate QR", then saya dapat unduh QR PNG/SVG yang mengarah ke URL landing.
  - Tombol "Copy Link" menyalin URL; tombol share menyalin juga caption media sosial hasil AI (bisa diedit).

### Epic G — Lead Capture

**US-G1 — Menerima dan mengelola lead**
As a [agen properti], I want to [melihat lead yang masuk dari form landing page di dashboard], So that [saya bisa segera menindaklanjuti calon pembeli].
- Acceptance Criteria:
  - Given prospek mengisi form, when submitted, then lead muncul di halaman Leads dengan nama, telepon, pesan, timestamp, dan asosiasi Primary Property (serta tipe rumah yang diminati jika prospek memilih).
  - Saya dapat mengubah status lead: New → Contacted → Interested → Negotiation → Deal/Lost.
  - Notifikasi "New Lead" tampil di Dashboard.

**US-G2 — Lead dari klik WhatsApp**
As a [product owner], I want to [mencatat klik WhatsApp sebagai sinyal lead], So that [analitik mencakup semua sinyal minat (form submit + WA click)].
- Acceptance Criteria:
  - Klik tombol WhatsApp di landing page (link dengan parameter tracking) dicatat sebagai event; jumlah klik WA tampil di analitik landing. (Pencatatan event, bukan CRM penuh — CRM lanjutan di luar MVP.)

### Epic H — Website Profil Agen

**US-H1 — Wizard setup website profil (5 langkah, pertama kali)**
As a [agen properti], I want to [mengisi wizard setup profil: data profil → branding (nama situs, logo, warna) → pilih tema → tentukan subdomain → data opsional (About, statistik, layanan)], So that [saya punya situs profil pribadi di subdomain dalam hitungan menit].
- Acceptance Criteria:
  - Given user baru selesai login dan profil belum lengkap, when masuk wizard, then 5 langkah tampil berurutan dengan preview live di samping (nama situs/logo/tema — pratinjau berubah seketika).
  - Given saya mengisi subdomain, when tersedia, then terkonfirmasi unik; jika sudah dipakai agen lain, tampil error + saran alternatif.
  - Semua langkah bisa di-*skip*; wizard tidak pernah memblokir akses dashboard/landing generator. Profil yang belum lengkap dapat dilengkapi kapan saja lewat Settings.
  - 5 tema tersedia: Modern, Luxury, Minimal, Corporate, Creative — pilihan tersimpan di `agent_profiles.theme`.

**US-H2 — Melihat situs profil publik**
As a [calon pembeli], I want to [membuka `{subdomain}.listingku.app` dan melihat profil agen lengkap], So that [saya bisa mengenal agen dan melihat semua listing aktifnya dalam satu situs].
- Acceptance Criteria:
  - Given subdomain milik agen yang sudah di-publish, when halaman dibuka, then tampil Home (hero + CTA), About, daftar Projects & House Type aktif (katalog internal otomatis dari database), dan Contact (WA + form).
  - Halaman dirender SSR (meta + OG + JSON-LD `Person`/`RealEstateAgent`) dan mobile-first.
  - Katalog Projects hanya menampilkan Primary Property dengan status Published; tiap item menuju landing page publik proyek tersebut (tidak ada lagi landing per House Type).

**US-H3 — Mengedit profil agen setelah setup**
As a [agen properti], I want to [mengubah tema, logo, warna, About, statistik, dan layanan lewat Settings], So that [situs profil tetap mencerminkan brand saya saat berkembang].
- Acceptance Criteria:
  - Given saya di Settings → Website Profil, when mengganti tema/logo/warna/About, then preview berubah dan perubahan tersimpan tanpa publish ulang (render dinamis).
  - Statistik (total closing, total listing, wilayah spesialis) dapat diisi/diubah dan tampil di situs publik.

**US-H4 — Internal linking profil ↔ landing**
As a [product owner], I want to [situs profil menautkan ke semua landing aktif dan sebaliknya landing menampilkan info agen], So that [struktur internal linking memperkuat SEO kedua jenis halaman].
- Acceptance Criteria:
  - Setiap landing page publik menampilkan footer/link menuju situs profil agen.
  - Situs profil menampilkan daftar seluruh Primary Property Published milik agen (link ke landing masing-masing); detail House Type tampil di dalam landing page proyek.

### Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| **Performance** | Render halaman publik (SSR) **< 1,5 detik** P95; halaman dashboard responsif < 2 detik; API AI (generate konten) selesai < 15 detik dengan feedback UI. |
| **Security** | Supabase Auth (magic link + Google OAuth). Semua query publik hanya membaca data `status = Published` via **Row Level Security (RLS)**; endpoint dashboard wajib autentikasi. Input form divalidasi Zod; sanitasi HTML pada konten AI. |
| **Scalability** | Arsitektur monolith Next.js siap menampung 1.000 agen dan 20.000 landing publik pada tahap MVP; DB di Supabase dengan indeks pada `status`, `slug`, `userId`, `subdomain`. |
| **Reliability** | Uptime 99,5% pada MVP; fallback AI: jika Gemini gagal, pengguna tetap dapat mengisi konten manual dan publish (AI tidak boleh memblokir publish). |
| **Usability** | Agen tanpa pelatihan menyelesaikan publish pertama dalam <10 menit (diukur); wizard 1 layar per langkah; tombol aksi utama ("+ Add House Type", "Generate AI", "Publish") selalu terlihat. |
| **Accessibility** | Komponen shadcn/ui default (WAI-ARIA); kontras WCAG AA; navigasi keyboard pada editor. |
| **Responsive** | Landing publik dan dashboard harus tampil baik pada mobile (agen dan calon pembeli mayoritas mobile); landing mobile-first dengan sticky CTA bar. |

## Success Metrics

| Metrik | Definisi | Target MVP (3 bulan) |
|---|---|---|
| Time to Publish (North Star) | Menit dari buka wizard Project sampai klik Publish (mediana) | **< 10 menit untuk ≥50% landing Primary Property** |
| Landing Published | Jumlah landing Primary Property dengan status Published | **≥200** |
| AI Adoption | % landing yang memakai konten hasil AI | **≥20%** |
| Lead Generated | Total lead form + event klik WhatsApp | **≥1.000** |
| AI Reliability | % pemanggilan AI berhasil pada upaya pertama | **≥95%** |
| Registrasi & Aktivasi Profil | Agen yang menyelesaikan onboarding dan wizard profil | **100 agen terdaftar, ≥50 profil live** |
| Retention Sinyal | % agen yang mempublish Primary Property kedua dalam 30 hari | **≥30%** |

Framework utama: **North Star Metric** (Time to Publish) didukung metrik adopsi dan aktivasi (AARRR: Acquisition via landing publik, Activation via first publish + profil live, Retention via listing kedua). Metrik Vanity (registrasi tanpa aktivasi) tidak dihitung sebagai sukses.

## Scope

### In-Scope

1. **Dashboard sederhana** — ringkasan: Total Projects, Total Leads, Total Visitors, kartu "Website Anda sudah live" + link profil, daftar aksi cepat (+ Create Project), empty state prompt "Create First Project".
2. **Website Profil Agen** — wizard setup 5 langkah (profil → branding → 5 tema → subdomain real-time → data opsional), situs publik di `{subdomain}.listingku.app` (Home, About, katalog Primary Property Published, Contact), 5 tema, editor Settings → Website Profil, dan internal linking dua arah dengan landing page.
3. **Project Manager** — CRUD Project (nama, lokasi, developer string, deskripsi, fasilitas umum pilihan), status Draft/Published.
4. **House Type Manager** — CRUD tipe unit dengan spesifikasi lengkap + upload galeri & denah (Supabase Storage).
5. **AI Listing Assistant** — 1 call Gemini 2.5 Flash per Primary Property, `responseSchema` → JSON; override manual; retry; pencatatan AIUsage.
6. **Landing Page Generator** — auto-build dari 9 blok preset; 3 tema (Modern, Showcase, Luxury).
7. **Block Editor terpimpin** — edit teks/gambar per blok, urutan blok, variasi blok, toggle blok; konfigurasi CTA WhatsApp & form.
8. **Publish + SSR public rendering** — dynamic route Next.js, permalink subfolder, sitemap.xml/robots.txt otomatis, meta + OG + JSON-LD + canonical.
9. **Lead capture** — form kontak, pipeline status lead sederhana, notifikasi New Lead, event klik WhatsApp.
10. **QR Code & Share** — unduh QR PNG/SVG, copy link, caption sosmed hasil AI.
11. **Analitik dasar** — visitor, klik WA, submit form per landing (angka ringkas; tanpa grafik kompleks).

### Out-of-Scope

| Ditunda | Alasan |
|---|---|
| Custom domain (`rumahandi.com`) & DNS/wildcard SSL kompleks | Fitur Pro (fase monetisasi); MVP cukup subdomain |
| Brand Kit penuh (favicon, palet kustom) | Perlu selesai dulu fondasi blok & tema |
| Media Library global + AI Image Studio (Enhance, Remove Object) | Proses berat/queue; bukan penghalang publish |
| Halaman Projects & Testimonials terpisah di situs profil | Katalog Projects otomatis masuk MVP; Testimonials masuk backlog |
| Billing, kuota pemblokiran publish & payment gateway | AIUsage pencatatan saja dulu; monetisasi setelah produk tervalidasi |
| CRM pipeline lanjutan, Open House, blog | Roadmap Phase 2 |
| Multi-agent/team workspace, approval workflow | Phase 3 |
| Drag-and-drop editor bebas | Bertentangan dengan prinsip "terpimpin" produk |
| Multi-tenant subdomain untuk landing (bukan profil) | Subfolder cukup untuk SEO awal |

## Technical Considerations

### Stack MVP

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend + Backend | **Next.js 15 (App Router)**, satu monolith | SSR untuk SEO publik; App Router menyatukan dashboard dan publik; deploy Vercel |
| Database + Auth + Storage + Realtime | **Supabase** (Postgres + Auth + Storage + Realtime) | Menggantikan Prisma + Auth.js + Cloudflare R2 untuk MVP: siap pakai, murah, RLS bawaan, upload langsung dari klien |
| UI | **shadcn/ui + Tailwind CSS** | Komponen aksesibel, konsisten, mudah dikustomisasi untuk tema landing/profil |
| AI | **Gemini 2.5 Flash** via REST, `responseSchema` (JSON mode) | Output terstruktur JSON, biaya rendah, latency cepat |
| Validasi | **Zod** | Validasi server & client konsisten |
| QR Code | Library qrcode server-side | Unduh PNG/SVG saat publish |

### Skema Database (Supabase/Postgres)

```sql
users             -- via Supabase Auth (id, email, name, avatar_url, phone, plan)
agent_profiles    (id, user_id, site_name, subdomain UNIQUE, theme,
                   logo_url, color_scheme, about, specialization, experience,
                   services JSONB[], stats JSONB, is_published, created_at)
projects          (id, user_id, name, slug UNIQUE, location, developer, description,
                   facilities JSONB[], status, created_at)
house_types       (id, project_id, name, slug UNIQUE, price, land_area, building_area,
                   bedrooms, bathrooms, carport, status, ai_content JSONB, template,
                   blocks JSONB DEFAULT template_preset, seo JSONB, created_at)
landing_pages     -- direpresentasikan implisit oleh house_types.blocks + seo (1:1);
                  -- dipisahkan menjadi tabel sendiri hanya jika blok butuh versioning
media             (id, user_id, project_id, house_type_id, type, url, size, created_at)
leads             (id, house_type_id, name, phone, email, message, source form|whatsapp,
                   status, created_at)
events            (id, house_type_id, type visitor|whatsapp_click|form_submit, date, count)
ai_usage          (id, user_id, model, prompt_tokens, completion_tokens, latency_ms,
                   success, created_at)
```

Catatan skema: slug proyek unik global dengan suffix user jika bentrok (`/{project-slug}` — satu landing per proyek, bukan lagi per tipe rumah); subdomain agen divalidasi unik global saat wizard. Middleware Next.js mendeteksi subdomain (`Host: {subdomain}.listingku.app`) untuk merender situs profil agen; permintaan ke domain utama merute ke dashboard atau landing publik.

### Alur Arsitektur

```
Agen (Dashboard, /app/*)                 Publik (/, {subdomain}.listingku.app)
┌─────────────────────────┐   publish     ┌───────────────────────────────┐
│ Wizard Profil Agen      │               │ {subdomain}.listingku.app     │
│   (profil/branding/     │── publish ───►│  Home/About/Katalog/Contact   │
│    tema/subdomain)      │               │  → SSR: agent_profiles        │
│ Create Project          │── publish ───►│  → meta, OG, JSON-LD Person   │
│ Add House Type + Upload │               └───────────────────────────────┘
│ "Generate AI" ─► Gemini │               ┌───────────────────────────────┐
│   (responseSchema JSON) │               │ /{project-slug}               │
│ Block Editor (JSON edit)│               │  → SSR: projects              │
│ Publish ─► status+slug  │               │    .blocks + .seo             │
└─────────────────────────┘               │  → blok: Hero…FAQ…CTA +       │
        │ form/CTA ─► leads & events      │    section House Types        │
                                          │  → meta, OG, JSON-LD Real     │
                                          │    EstateListing + FAQPage    │
                                          └───────────────────────────────┘
```

### Pertimbangan Kunci

- **RLS adalah garis pertahanan utama**: policy `select` publik hanya untuk `status = 'published'`; dashboard memakai Supabase client terautentikasi.
- **Media ke Supabase Storage**: upload langsung dari klien (bucket `media`, public false → served via signed URL atau bucket public dengan nama file acak).
- **AI tidak boleh memblokir publish**: konten bisa diisi manual; publish hanya butuh blok terisi, bukan hasil AI.
- **Mitigasi duplicate content**: prompt AI menerima konteks proyek (nama cluster, fasilitas unik) agar teks per listing berbeda; setiap halaman ≥300 kata; canonical + sitemap.
- **Fallback AI**: retry 1x; jika gagal, tampilkan error + opsi isi manual.
- **Keamanan konten**: output AI disanitasi sebelum render (`dangerouslySetInnerHTML` dihindari; render Markdown→RichText terkontrol).
- **Middleware subdomain**: deteksi subdomain via `request.headers.get('host')`; profil agen hanya dirender jika `is_published = true`; wildcard DNS + SSL di Vercel menangani otomatis.

## Design & UX Requirements

**Prinsip UX:** agen fokus ke *"Saya ingin menjual properti ini"*, bukan "saya sedang bermain AI". AI hadir sebagai kopilot otomatis satu klik, bukan chatbot. Alur mengikuti flow onboarding resmi (Fase 0–9) dengan wizard terpimpin di setiap titik masuk.

**Desain sistem:** shadcn/ui default (neutral/zinc) untuk dashboard; tema landing (3) dan tema profil (5) hanya memengaruhi halaman publik. Komponen pakai `Card`, `Button`, `Input`, `Form` (react-hook-form + Zod), `Sheet` (sidebar editor), `Dialog`, `Badge`, `Skeleton`, `Toast` (sonner).

**Navigasi dashboard:** sidebar kiri (Dashboard, Projects, Leads, Pengaturan) + header dengan profil agen. Dashboard menampilkan kartu metrik (Projects, Leads, Visitors), kartu "Website Anda sudah live", dan daftar Project.

**Wizard profil agen (Fase 1):** 5 layar berurutan (Profil → Branding → Tema → Subdomain → Data Opsional), satu layar per langkah dengan progress bar, pratinjau live di samping yang berubah seketika pada pilihan tema/logo/warna, tombol Skip per langkah (wizard tidak pernah memblokir dashboard), dan validasi subdomain unik real-time.

**Wizard Project/House Type (Fase 3–4):** satu layar per langkah dengan progress bar (Basic Info → Fasilitas & Media → Review), tombol Back/Next/Skip, dan auto-save draft antar langkah. House Type ditambahkan sebagai kartu-kartu di halaman detail Primary Property, bukan sebagai wizard mandiri.

**Editor landing (Fase 6, pola "content settings"):** halaman split — kiri pratinjau live (komponen ter-render langsung), blok dikelilingi *hover frame* yang dapat diklik; klik blok membuka `Sheet` kanan berisi form properti blok. Termasuk blok **House Types** yang menampilkan daftar tipe rumah (bisa diatur urutan tampil dan visibilitas per tipe). Tidak ada kanvas bebas, tidak ada resize handle.

**Landing publik:** mobile-first (calon pembeli mayoritas mobile); sticky bar CTA bawah di mobile (WhatsApp + Form); blok FAQ sebagai accordion; galeri carousel; font system/Inter untuk keterbacaan.

**Feedback & empty states:** loading skeleton saat data dimuat, toast success/error, empty state ilustratif dengan CTA primer ("Buat Project pertama Anda"), indikator loading saat AI berjalan.

**Aksesibilitas & responsivitas:** semua komponen shadcn default WAI-ARIA; fokus keyboard; landing publik dan dashboard teruji di viewport 360px–1440px.

## Timeline & Milestones

Estimasi total **±9 minggu** untuk satu developer full-stack (atau 5–6 minggu untuk tim 2 developer). Termasuk wizard profil 5 langkah dan middleware subdomain yang menambah ±1 minggu dari rencana tanpa Website Profil Agen.

| Sprint | Milestone | Deliverable |
|---|---|---|
| **S1 (Minggu 1–2)** | Fondasi & Data | Setup repo Next.js + Supabase + shadcn; skema DB + RLS; Auth; CRUD Primary Property & House Type + upload media; Dashboard ringkas |
| **S2 (Minggu 3–4)** | AI, Generator & Profil Agen | Integrasi Gemini `responseSchema` (per Primary Property) + pencatatan AIUsage; auto-generate landing per proyek (blok: Hero…House Types…CTA, 3 tema); Block Editor terpimpin; wizard profil agen 5 langkah + 5 tema profil |
| **S3 (Minggu 5–6)** | Publish & SEO | Dynamic route publik SSR; middleware subdomain untuk situs profil; SEO meta/OG/JSON-LD; sitemap + robots; publish flow; QR code & share; analitik event dasar; internal linking profil ↔ landing |
| **S4 (Minggu 7–8)** | Hardening & Launch | E2E test Playwright (alur publish + profil end-to-end); load test halaman publik; bug bash; soft-launch ke 10–20 agen beta; iterasi feedback |

## Risks & Mitigation

| Risiko | Dampak | Mitigasi |
|---|---|---|
| AI menghasilkan konten generik/duplikat | SEO thin content, landing terasa sama | Prompt kontekstual per proyek; minimum 300 kata; variasi tema; tinjau kualitas manual di beta |
| Downtime/gagal API Gemini | Agen tidak bisa generate konten | Retry 1x; AI opsional — isi manual tetap bisa publish; catat error untuk perbaikan prompt |
| Domain baru lambat terindeks Google | Traffic organik minim 3–6 bulan | Subfolder untuk authority; sitemap auto-submit; fokus distribusi via WA/IG agen sebagai jalur trafik utama awal |
| RLS keliru memaparkan data draft | Kebocoran data antar agen | Audit policy RLS di awal dan tiap migrasi; test automatik untuk akses publik vs terautentikasi |
| Subdomain bentrok / DNS subdomain belum siap | Agen tidak mendapat situs profil unik | Validasi subdomain unik real-time saat wizard; wildcard DNS + SSL (Vercel menangani otomatis); fallback sementara: profil tampil di `listingku.app/agent/{subdomain}` sampai DNS siap |
| Kualitas desain tema jelek | Nilai "profesional" runtuh | 3 tema landing + 5 tema profil dibuat detail oleh desainer/dev senior; preview screenshot standar per tema |
| Konten sensitif/tidak akurat dari agen | Risiko legal/reputasi | Terms of Use; agen bertanggung jawab atas data; AI hanya membantu copy |
| Wizard profil terlalu panjang (5 langkah) | Drop-off onboarding | Semua langkah diskip-able + pratinjau live sebagai motivasi; profil bisa dilengkapi nanti lewat Settings |

## Dependencies & Assumptions

**Ketergantungan eksternal:** Supabase (plan Pro $25/bulan cukup untuk MVP), Vercel (hosting Next.js + wildcard subdomain + SSL otomatis), Google Gemini API key (biaya rendah di skala MVP), domain `listingku.app`. **Ketergantungan internal:** tidak ada — Website Generator dan Website Profil Agen adalah fondasi; fitur lain (Media Library global, AI Image Studio) dibangun di atas skema entitas yang sama.

**Asumsi kunci:** (1) Agen mengisi data proyek secara jujur dan lengkap; (2) 1 call AI per Primary Property sudah cukup — regenerasi AI tidak diperlukan di MVP (bisa masuk backlog); (3) Trafik publik awal rendah sehingga SSR tanpa ISR sudah memadai; (4) Calon pembeli menerima landing page subfolder domain Listingku sebagai sumber legit (brand Listingku tampil profesional); (5) shadcn/ui + Tailwind cukup untuk merealisasikan 3 tema landing dan 5 tema profil tanpa framework CSS tambahan; (6) Nomor WhatsApp wajib pada wizard profil sehingga CTA semua landing dan kontak profil konsisten; (7) v3.0: satu call AI per Primary Property mencakup konten semua tipe rumah di dalamnya, sehingga biaya AI per landing tetap rendah meski tipe banyak.

**Asumsi migrasi:** keputusan pindah dari monolith Supabase ke monorepo Turborepo + Prisma + R2 dapat dilakukan setelah produk tervalidasi — skema entitas di dokumen ini konsisten dengan model data produk jangka panjang (User, AgentProfile, Project, HouseType, LandingPage, Lead, Media, AIUsage).

## Open Questions

1. **Monetisasi sejak hari pertama atau setelah traksi?** Apakah MVP langsung membayar (trial → berbayar) atau 100% gratis selama beta untuk memaksimalkan volume validasi?
2. **Skema URL final (v3.0 sudah menyederhanakan):** landing kini cukup `/{project-slug}` (misalnya `/parkspring-gading`) — tidak ada lagi path per tipe rumah. Pertanyaan tersisa: apakah perlu versi scoped (`/u/andi/parkspring-gading`) untuk menghindari bentrok antar agen tanpa validasi unik global?
3. **Validasi nomor WhatsApp agen:** apakah perlu verifikasi OTP nomor WA saat setup CTA, atau cukup input bebas (risiko CTA salah nomor)?
4. **Batas upload foto:** 20 per House Type cukup? Apakah perlu kompresi/resize otomatis di sisi server saat upload? Ditambah: apakah perlu foto khusus Primary Property (masterplan, fasilitas) yang terpisah dari foto per tipe?
5. **Bahasa AI:** output AI default Bahasa Indonesia; apakah perlu opsi Bahasa Inggris untuk pasar properti premium/expat (bisa jadi opsi template saja dulu)?
6. **Lead email notifikasi:** apakah agen perlu notifikasi email saat lead masuk di MVP, atau cukup melihat di dashboard (menghemat kompleksitas)?
7. **Template tambahan:** apakah tema landing ke-4/ke-5 masuk MVP atau cukup 3 tema untuk memvalidasi konsep dulu?
8. **Urutan rilis internal:** apakah profil agen harus rilis bersamaan dengan generator (S2) atau cukup paralel di S2–S3 dengan publish profil menyusul di S3?
9. **Deep link tipe rumah:** karena satu landing berisi banyak tipe, apakah perlu anchor/hash section (misalnya `/parkspring-gading#midea") agar prospek bisa langsung melompat ke tipe tertentu dari iklan sosmed?

---

*Dokumen PRD final ini mengikuti template standar skill PRD Generator dan flow onboarding resmi (Fase 0–9) yang telah disepakati. User stories ditulis dalam format standar dengan acceptance criteria yang dapat diuji. Sebelum sprint pertama, pertanyaan terbuka di Bagian 13 perlu didiskusikan dan keputusannya dicatat sebagai update PRD. Dokumen pendamping: Flow_Onboarding_Produk_Listingku.md (alur lengkap per fase) dan flow_onboarding.png (visualisasi diagram alur).*
