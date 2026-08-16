# Flow Onboarding & Alur Produk Listingku (MVP — Landing per Primary Property)

Dokumen ini menjelaskan **tahap demi tahap** apa yang terjadi saat agen properti menggunakan Listingku untuk pertama kali — dari selesai login sampai landing page pertama live. Alur ini dirancang mengikuti prinsip produk: agen fokus pada *"saya ingin menjual properti ini"*, bukan "saya sedang mengatur website".

> **Konsep utama (v3.0): landing page dibuat per Primary Property (Project), bukan per tipe rumah.** Misalnya Primary Property "ParkSpring Gading" memiliki 3 tipe rumah (Villa, Midea, Grand) — maka dihasilkan **satu landing page** di `listingku.app/parkspring-gading` yang berisi ketiga tipe rumah sebagai section di dalamnya (kartu tipe unit, spesifikasi per tipe, denah per tipe). Agen hanya membuat satu landing untuk satu proyek.

---

## Ringkasan Alur Besar

Secara garis besar, perjalanan user pertama kali melewati enam fase:

```
Login → Wizard Setup Profil (1x saja, 5 langkah) → Situs Profil Live → Buat Project → Tambah Tipe Rumah + Foto → Generate AI → Edit Landing → Publish & Share
```

Fase Wizard Setup Profil hanya terjadi **sekali** saat pertama kali. Setelah itu, setiap proyek berikutnya cukup melalui Create Project → Tambah Tipe Rumah → Generate → Publish, yang ditargetkan selesai dalam **< 10 menit**. Website Profil Agen kini bagian dari lingkup MVP ini, bukan iterasi berikutnya.

---

## Fase 0 — Login Pertama

Agen mendaftar dengan email (magic link) atau login via Google OAuth melalui Supabase Auth. Setelah login berhasil untuk pertama kalinya, sistem mengecek apakah **profil agen sudah lengkap**.

- **Jika profil sudah lengkap** → langsung masuk Dashboard.
- **Jika profil belum lengkap (user baru)** → di-redirect ke **Wizard Setup Website Profil** (Fase 1).

---

## Fase 1 — Wizard Setup Website Profil (Hanya Sekali, ±3–4 menit)

Dengan masuknya Website Profil Agen ke MVP, wizard mengikuti desain penuh 5 langkah (sesuai dokumen produk asli), dengan **pratinjau live di samping** yang berubah seketika saat agen memilih tema/logo/warna:

| Langkah | Layar | Apa yang diisi | Setelah Submit |
|---|---|---|---|
| 1 | **Profil Agen** | Nama lengkap, foto profil (upload), nomor WhatsApp (menjadi tujuan CTA semua landing & kontak profil), email | Auto-save, lanjut ke langkah 2 |
| 2 | **Branding** | Nama website agensi personal (mis. "Andi Property"), upload logo, pilih skema warna utama — pratinjau berubah langsung | Auto-save, lanjut ke langkah 3 |
| 3 | **Pilih Tema** | Pilih salah satu dari 5 tema: Modern, Luxury, Minimal, Corporate, Creative — pratinjau penuh tampil | Tema tersimpan, lanjut ke langkah 4 |
| 4 | **URL/Domain** | Tentukan subdomain, mis. `firdi.listingku.app` — dicek ketersediaan real-time; jika bentrok tampil saran alternatif | Subdomain di-claim, lanjut ke langkah 5 |
| 5 | **Data Opsional** | About Me, pengalaman, pencapaian, statistik (total closing, total listing, wilayah spesialis), layanan — **bisa diskip**, diisi nanti | Wizard selesai, masuk Dashboard |

Setiap langkah memiliki tombol **Skip** — jika agen terburu-buru, ia boleh melewati wizard dan dashboard tetap bisa dipakai. Pengisian profil bisa dilanjutkan kapan saja lewat menu **Settings → Website Profil**. Begitu subdomain ter-claim dan nama situs terisi, situs profil sudah dapat di-publish.

> Kenapa nomor WhatsApp wajib? Karena hampir semua CTA landing menggunakan tombol "Chat WhatsApp" yang mengarah ke `wa.me/{nomor}`. Tanpa nomor ini, tombol CTA tidak bisa berfungsi.

---

## Fase 2 — Dashboard (Pusat Kontrol)

Setelah wizard selesai, agen mendarat di Dashboard dengan tampilan awal:

1. **Kartu metrik kosong**: Total Projects: 0, Total Leads: 0, Total Visitors: 0.
2. **Kartu "Website Anda sudah live"** dengan link situs profil (`firdi.listingku.app`) dan tombol "Kelola Profil".
3. **Empty state besar** dengan prompt mencolok: *"Belum ada listing. Buat Project pertama Anda dalam hitungan menit →"* + tombol primer **"+ Create Project"**.
4. **Aksi cepat**: New Project, (Media Library — placeholder), Pengaturan.

Di sini filosofi "terpimpin" bekerja: agen tidak perlu mencari-cari tombol; aksi dominan adalah membuat Project — sementara situs profilnya sudah berjalan sendiri dari hasil wizard.

---

## Fase 3 — Create Project / Primary Property (Wizard 3 Langkah)

Agen klik "+ Create Project" dan mengisi proyek properti (mis. "ParkSpring Gading") dalam wizard 3 langkah dengan progress bar:

| Langkah | Isi |
|---|---|
| **Basic Info** | Nama Project, lokasi (kota/alamat), developer (string bebas), deskripsi singkat (2–3 kalimat), fasilitas umum proyek (pilih dari checklist: kolam renang, taman, security 24 jam, masjid, dsb.) |
| **Fasilitas & Media** | Upload foto umum proyek (masterplan, fasilitas, lingkungan) — opsional, bisa diskip |
| **Review & Save** | Ringkasan data, tombol "Simpan Project" |

Setelah tersimpan:
- Status Project = **Draft**.
- Agen otomatis diarahkan ke **halaman detail Project** dengan ajakan langsung: **"+ Add House Type"**.

> Catatan: Project di sini sekaligus merupakan **Primary Property** — satu entitas yang nantinya menjadi satu landing page.

---

## Fase 4 — Tambah Tipe Rumah (Isi Landing, Bisa Berulang)

Di halaman detail Project, agen menambahkan tipe rumah satu per satu (mis. "Villa", "Midea", "Grand") dengan klik "+ Add House Type":

1. **Spesifikasi**: nama tipe, harga jual, luas tanah, luas bangunan, jumlah kamar tidur, kamar mandi, carport.
2. **Media**: upload 1–20 foto (interior/eksterior) + file denah (floor plan / site plan), drag untuk menentukan foto utama.
3. **Review & Simpan** — House Type tersimpan status **Draft**.

Setiap tipe rumah yang ditambahkan akan muncul sebagai **kartu** di halaman detail Project. Tipe rumah boleh ditambah berkali-kali sesuai kebutuhan proyek (1 hingga banyak tipe). **Setiap tipe rumah BUKAN landing terpisah** — semua tipe menjadi konten/section di dalam satu landing page Primary Property.

Begitu minimal satu tipe rumah terisi lengkap, layar menampilkan tombol besar berikutnya: **"Generate AI"**.

---

## Fase 5 — Generate AI (±5–15 detik)

Agen klik **"Generate AI"**. Yang terjadi di balik layar:

1. Sistem mengumpulkan semua data tipe rumah (spesifikasi + foto masing-masing tipe) serta nama/deskripsi/fasilitas Project sebagai konteks.
2. Memanggil **Gemini 2.5 Flash** dengan `responseSchema` (structured JSON output) — **satu kali per Primary Property**.
3. AI mengembalikan JSON lengkap:

```json
{
  "headline": "ParkSpring Gading — Hunian Villa Modern di Jantung Kota",
  "description": "Deskripsi proyek 300+ kata yang menjual...",
  "houseTypes": [
    { "name": "Villa", "shortDescription": "...", "sellingPoints": ["..."] },
    { "name": "Midea", "shortDescription": "...", "sellingPoints": ["..."] },
    { "name": "Grand", "shortDescription": "...", "sellingPoints": ["..."] }
  ],
  "sellingPoints": ["Dekat sekolah internasional", "Akses tol 5 menit", "..."],
  "faq": [{"q": "Sertifikatnya apa?", "a": "SHM."}, ...],
  "seo": {"title": "ParkSpring Gading — Dijual & Disewa di BSD", "description": "..."},
  "captions": {"instagram": "...", "facebook": "...", "whatsapp": "..."}
}
```

4. JSON tersimpan sebagai konten Primary Property (termasuk blok konten per tipe rumah), lalu **satu landing page otomatis ter-generate** dari blok-blok preset: **Hero → Gallery → Highlights → House Types (kartu per tipe, klik melompat ke section detail tipe) → Specifications per Tipe → Facilities → Floor Plans → Location → FAQ → CTA WhatsApp → Form Kontak**.
5. Agen langsung masuk ke **Editor Landing Page** untuk meninjau hasilnya.

Jika AI gagal/error: tampil pesan error + tombol **Retry**; agen tetap bisa mengisi konten **manual** — AI tidak pernah memblokir publish.

---

## Fase 6 — Block Editor (Review & Customisasi, ±2–3 menit)

Tampilan editor split: **kiri** = pratinjau landing seperti live, **kanan** = panel blok.

Agen meninjau blok satu per satu:
- **Klik blok Hero** → panel kanan menampilkan field judul, subjudul, gambar latar → agen bisa mengedit.
- **Klik blok Gallery** → pilih/ganti foto dari galeri yang sudah diunggah, pilih layout (carousel/grid).
- **Klik blok House Types** → atur urutan tampil tipe rumah, sembunyikan tipe tertentu, edit deskripsi singkat per tipe.
- **Klik blok FAQ** → edit pertanyaan/jawaban hasil AI.
- **Klik blok CTA** → pastikan nomor WhatsApp benar, ubah pesan default WA.
- **Klik blok Form** → aktifkan/nonaktifkan form kontak.
- **Urutan blok** → panah naik/turun; blok bisa di-toggle aktif/nonaktif.
- **Tema** → pilih antara Modern / Showcase / Luxury, pratinjau berubah seketika.

Tidak ada drag-and-drop bebas, tidak ada pengaturan gaya manual — editor *terpimpin* agar desain tetap profesional.

Setelah puas, klik **"Preview"** (tab baru, render identik dengan live).

---

## Fase 7 — Publish (Satu Klik)

1. Agen klik **"Publish"** → dialog konfirmasi muncul.
2. Konfirmasi → status landing = **Published**, permalink aktif.
3. URL diberikan dan **otomatis tersalin ke clipboard**:

   `https://listingku.app/parkspring-gading`
   *(subfolder di domain utama — satu landing per Primary Property, terbaik untuk SEO di tahap awal)*

4. Begitu live, sistem otomatis: memperbarui **sitemap.xml**, menambahkan meta title/description (dari AI), Open Graph tags, **JSON-LD** (schema properti + FAQPage), dan canonical tag.
5. **Footer landing menampilkan link ke situs profil agen** — internal linking yang memperkuat SEO kedua halaman (profil ↔ landing saling ter-link).
6. Muncul opsi lanjutan:
   - **Download QR Code** (PNG/SVG) — untuk brosur, kartu nama, banner.
   - **Copy Link / Share** — link + caption media sosial hasil AI (IG, FB, WA) siap ditempel.

---

## Fase 8 — Setelah Publish (Operasional Berjalan)

Sekarang agen tinggal **membagikan** dua aset digital: link/QR landing page properti **dan** link situs profil (`firdi.listingku.app`) untuk calon pembeli yang ingin mengenal agennya lebih jauh. Saat ada pengunjung:

| Kejadian | Sistem | Agen Melihat |
|---|---|---|
| Orang buka landing | Event `visitor` dicatat | Angka visitor di Dashboard/Analytics |
| Orang klik tombol WhatsApp | Event `whatsapp_click` (link tracking) | Angka klik WA |
| Orang isi form kontak | Lead baru tersimpan, terasosiasi ke Primary Property (plus tipe rumah yang diminati jika dipilih) | Notifikasi "New Lead" + daftar Leads (nama, HP, pesan); status bisa diubah: New → Contacted → Interested → Negotiation → Deal/Lost |

Siklus berulang untuk proyek berikutnya: **Dashboard → + Create Project → Tambah Tipe Rumah → Generate AI → Edit → Publish**, target tetap di bawah 10 menit per proyek.

---

## Visualisasi Alur Lengkap

```
┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Login      │───►│ Wizard Setup     │───►│  Dashboard       │
│ (Supabase)  │    │ 5 langkah, 1x saja│    │ (metrik+CTA+     │
└─────────────┘    └───────┬──────────┘    │  link profil)    │
         ┌─────────────────┘                └───────┬──────────┘
         ▼
┌──────────────────────────┐
│ Profil agen live:        │
│ firdi.listingku.app      │
│ (Home/About/Katalog/     │
│  Contact + 5 tema)       │
└──────────────────────────┘
                                                   │ + Create Project
┌─────────────────┐   ┌──────────────┐    ┌───────▼───────┐
│  Preview/QR/    │◄──│   PUBLISH    │◄──│  Block Editor │
│  Share (WA/IG)  │   │  (1 klik)    │    │ (review AI,   │
└────────┬────────┘   └──────┬───────┘    │  edit blok)   │
         │                   │            └───────▲───────┘
         ▼                   │                    │
┌────────────────┐           │     ┌──────────────┘
│ Landing live:  │           │     │  Generate AI (Gemini)
│ listingku.app/ │           │     │  → 1 konten JSON proyek
│ parkspring-    │           │     │    + blok per tipe rumah
│ gading         │           │     │    auto-generated
│ (link footer → profil    │     │             │ + Add House Type
│  agen)                     │     │
└───────┬────────┘           │     └───────┬───────────
        │                    │             │
        │  visitor / WA click│    ┌────────▼───────────
        │  form submit ──────┼───►│ Tambah Tipe Rumah │
        ▼                    │    │ (spes + upload    │
┌────────────────┐           │    │  foto & denah)    │
│  Leads &       │◄──────────┘    └────────▲──────────
│  Analytics     │                         │
└────────────────┘                  ┌──────┘
                              ┌─────▼────────────┐
                              │ Create Project   │
                              │ (wizard 3 langkah)│
                              └──────────────────┘
```

---

## Waktu Target per Fase (North Star: Time to Publish)

| Fase | Waktu Target | Keterangan |
|---|---|---|
| Wizard setup profil (1x saja) | ±3–4 menit | Wizard 5 langkah, bisa diskip; situs profil langsung live |
| Create Project | ±1–2 menit | Wizard 3 langkah, auto-save |
| Tambah tipe rumah + upload foto | ±3–4 menit per tipe | Tergantung kesiapan foto di HP agen; isi semua tipe proyek |
| Generate AI + masuk editor | ±15 detik | AI berjalan ~5–15 detik (satu kali per proyek) |
| Edit landing & publish | ±2–3 menit | Review saja; edit opsional |
| **Total per proyek** | **< 10 menit** | Target North Star ≥50% landing Primary Property |

---

*Catatan: Flow di atas adalah MVP lengkap — Website Generator (landing per Primary Property, tipe rumah sebagai konten di dalamnya) + Website Profil Agen, sesuai keputusan produk terbaru (v3.0). Fitur berikutnya yang menunggu iterasi: Media Library global, AI Image Studio (Enhance, Remove Object), custom domain, billing/kuota, dan CRM lanjutan — masing-masing mengikuti pola wizard/flow terpimpin yang sama.*
