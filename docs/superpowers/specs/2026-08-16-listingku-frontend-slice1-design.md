# Design — Listingku Front-End Slice 1

**Tanggal:** 2026-08-16
**Status:** Disetujui, siap masuk implementation plan
**Sumber kebenaran:** `Product Requirements Document (PRD).md` (v3.0), `Flow Onboarding & Alur Produk Listingku (MVP — Landing per Primary Property).md`, dan Claude Design project `8059d123-0b3d-4faf-b7be-b76ce3506622` (`Listingku App.dc.html` + design system `listingku-design-system-adfd85b5`).

---

## 1. Tujuan & posisi slice ini

Membangun front-end Listingku sebagai **fondasi produksi** — bukan prototype sekali pakai. Seluruh data slice ini dummy, tapi disembunyikan di balik satu lapisan repository sehingga integrasi Supabase nanti mengganti implementasi lapisan itu saja, tanpa menyentuh satu pun komponen UI.

Slice 1 mengerjakan **satu tulang punggung utuh**, persis jalur North Star PRD (*Time to Publish* < 10 menit):

```
Login → Dashboard → Create Project → Add House Type → Generate AI
      → Block Editor → Publish & Share → Landing publik live
```

Tujuh dari sebelas layar di file design masuk slice ini, semuanya sudah tersambung ke data layer.

### Yang masuk slice 1

| Layar design | Rute | Catatan |
|---|---|---|
| `login` | `/login` | Sesi dummy, bukan auth sungguhan |
| `dashboard` | `/dashboard` | Metrik, kartu situs live, banner lead, daftar project, empty state |
| `create` | `/projects/new` | Wizard 3 langkah, auto-save antar langkah |
| `project` | `/projects/[id]` | Detail + kartu tipe rumah + banner ajakan Generate AI |
| `ai` | `/projects/[id]/generate` | 4 state: idle / loading / error / done |
| `editor` | `/projects/[id]/editor` | Block editor terpimpin |
| `publish` | `/projects/[id]/publish` | URL + salin + QR + caption |
| — | `/{project-slug}` | Landing publik SSR, **wireframe** |

Layar `mobile` di file design bukan rute — ia referensi responsif. Landing publik dan dashboard wajib mengikutinya (sticky CTA bar 390px, dsb).

### Yang ditunda (desainnya sudah ada, tinggal dikerjakan)

- **Slice 2:** wizard profil agen 5 langkah (`onboarding`), Settings 3 tab (`settings`), situs profil publik `{subdomain}.listingku.app` + middleware subdomain — **wireframe**.
- **Slice 3:** layar Leads + kartu analitik (`leads`), tema landing Modern/Showcase/Luxury saat desainnya datang.
- **Di luar MVP:** lihat daftar Out of Scope di `CLAUDE.md`.

**Konsekuensi penundaan wizard profil yang sudah disetujui:** identitas agen (nama, nomor WhatsApp, subdomain, nama situs) berasal dari fixture yang di-seed, bukan input pengguna. Semua CTA WhatsApp tetap berfungsi penuh.

---

## 2. Design system — sumber kebenaran visual & verbal

Design system `listingku-design-system-adfd85b5` adalah otoritas. Token CSS-nya disalin verbatim ke repo.

### Palette — hati-hati, ini bukan yang ada di dokumen pen.dev

Dokumen `uploads/Instruksi Prompt UI Listingku untuk pen.dev` menetapkan minimalist biru `#2563EB`. **Dokumen itu usang.** Design system dan `Listingku App.dc.html` memakai:

- **Evergreen `#233D2D`** — suara utama: nav, headline, body ink, teks tombol sekunder, angka metrik.
- **Oranye `#D2421A`** — konversi saja: tombol primer, underline nav aktif, focus ring, error. **Tidak pernah untuk body copy, tidak pernah untuk nav item saat rest.**
- **Leaf `#00803A`** — hijau logo. Hanya untuk mark dan status sukses. **Tidak pernah jadi fill tombol atau permukaan.**
- Mint `#E5EDE7` (banner, chip, satu kartu aksen per section), Stone `#F3F5F2` (pemisah section), Ash `#D3D8D5` (hairline), Sage `#66736B` (muted), Ink `#121212` (hero gelap, footer).
- Maksimal dua tona latar per halaman.

Catatan: `listingku.svg` di root repo memakai `#008238`, praktis sama dengan `--leaf`. Design system sengaja menurunkan hijau logo ke peran mark-dan-sukses, bukan warna primer. Readme DS menandai ini sebagai pertanyaan terbuka; **kita ikuti DS apa adanya** sampai ada keputusan lain.

### Tipografi

Archivo (Google Fonts) menggantikan Neue Haas Grotesk yang berlisensi. Tiga peran:

- `--font-display` (Archivo) — display 51/56, h1 39/47, h2 30/39
- `--font-text` (Archivo) — h3 18/22, semua label 600 weight, `label-sm` 12px uppercase tracking 0.04em
- `--font-body` (**platform sans stack, bukan Archivo**) — body 18/28, 16/24, 14/20 regular

Body copy tidak pernah mewarisi weight headline. Pemisahan `--font-body` dari Archivo adalah pilihan sadar DS, bukan kelalaian.

### Bentuk, kedalaman, state, motion

- Radius: 4px tombol & input, 8px kartu, 16px hero/media panel, full hanya untuk chip & banner.
- **Kedalaman dari border, bukan shadow.** Kartu = putih, hairline 1px `#D3D8D5`, `--shadow-card` yang praktis tak terlihat. `--shadow-raised` hanya pada kartu interaktif yang di-hover, `--shadow-menu` hanya overlay. Tanpa inner shadow, glow, glass, blur.
- Hover = **pertukaran warna, bukan pemudaran**: primer oranye → evergreen; sekunder putih → mint dengan border menggelap ke evergreen; link evergreen → oranye; nav evergreen → oranye. Press = `translateY(1px)`, tanpa scale, tanpa shadow. Focus = outline oranye 2px, offset 2px. Disabled = opacity 40%.
- Motion: 200ms crossfade warna/border pada `cubic-bezier(.2,.6,.2,1)`, 120ms untuk press dan caret, 320ms untuk panel. **Tanpa bounce, spring, parallax, atau animasi masuk saat scroll.**

### Aturan konten — mengikat, bukan saran

Ini spec, bukan preferensi gaya. Semua copy UI wajib patuh:

- Bahasa Indonesia. Orang kedua formal **Anda** (kapital). Orang pertama jamak **kami**. **Tidak pernah *kamu*, tidak pernah *saya*.**
- Sentence case di mana-mana termasuk tombol dan nav. UPPERCASE hanya untuk `label-sm` (chip, eyebrow, header kolom).
- **Tanpa emoji. Tanpa tanda seru.** Konfirmasi tetap datar: "Permintaan terkirim".
- Tombol kata kerja dulu, 2–3 kata: *Simpan project*, *Generate AI*, *Salin caption*.
- Angka gaya Indonesia: `Rp150.000`, `1.850.000.000`, `Rp 2,45 M`, `3,4×`, `68%`, `1,2jt`. Waktu 24 jam dengan zona: `09.00–18.00 WIB`. Tanggal mengeja bulan: `24 September`.
- Copy form: label frasa benda, hint menenangkan, error dua kata dan tumpul ("Wajib diisi.", "Masukkan email yang valid.").

Copy yang sudah ada di `Listingku App.dc.html` adalah sumber kebenaran; jangan ditulis ulang.

### Ikonografi

Lucide, via `lucide-react`. DS menandai ini sebagai substitusi — ganti bila Listingku punya set sendiri. Ukuran 14–16px di dalam tombol, 18px di baris list, 20–26px sebagai glyph kartu, 34px untuk konfirmasi sukses. Warna: evergreen di permukaan terang, putih di gelap, leaf untuk centang & sukses, oranye untuk toggle accordion dan banner error.

---

## 3. Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 App Router, monolith | SSR untuk landing publik; Server Actions untuk mutasi |
| Runtime | Node 24.19.0, npm 11.17.0 | pnpm tidak terpasang di mesin ini |
| Styling | Tailwind v4 + token DS via `@theme inline` | Token DS tetap satu sumber kebenaran; Tailwind sekadar cara mengaksesnya |
| Komponen brand | **Port 1:1** dari `_ds_bundle.js` | Button, Card, Chip, Banner, Input, NavLink — ini identitas brand, tidak diserahkan ke library |
| Komponen perilaku | Radix (via shadcn), dicat token DS | Dialog, Sheet, Tabs, Switch, Accordion, Toast, Table, Progress, Skeleton — DS tidak mendefinisikannya |
| Validasi | Zod + react-hook-form | Satu skema dipakai klien dan server |
| Ikon | `lucide-react` | Sesuai DS |
| Font | `next/font/google` Archivo 400/500/600/700 | Self-hosted, tanpa request CDN, tanpa layout shift |
| QR | `qrcode` | Server-side, PNG + SVG |
| Test | Vitest + React Testing Library, Playwright | Unit + satu spec tulang punggung |

**Kenapa hybrid komponen:** DS readme tegas — *"there is no Toast, Avatar, Tooltip, Tabs or Switch here because the source defines none."* Sementara layar-layar design memakai tabs, switch, tabel, progress bar, dialog konfirmasi, dan skeleton. Membangun semua itu sendiri berarti menulis focus trap, ARIA, dan keyboard navigation dari nol — tepat di tempat bug aksesibilitas paling sering lolos. Radix menangani perilaku, token DS menangani tampilan.

**Catatan Tailwind preflight:** token DS disalin sebagai variabel murni. `tokens/base.css` milik DS mengandung reset (`*{box-sizing}`, `body{}`) yang akan bertabrakan dengan preflight Tailwind — **resetnya dibuang, utility `.lw-*` (peran tipografi) dipertahankan** karena nilainya persis dipakai di file design.

---

## 4. Arsitektur data — repository seam

UI tidak pernah menyentuh sumber data langsung. Satu kontrak, dua implementasi yang bisa ditukar lewat env var.

```
lib/data/
  types.ts          domain types: Project, HouseType, Media, Lead, EventRow, AgentProfile, AiContent
  repo.ts           interface DataStore { projects, houseTypes, media, leads, events, aiUsage, agentProfile }
  index.ts          factory — DATA_DRIVER=mock | supabase
  mock/
    store.ts        singleton in-memory
    snapshot.ts     persist ke .data/store.json (atomic write: temp + rename)
    seed.ts         fixture awal
    repos.ts        implementasi DataStore
  supabase/         kosong — README menjelaskan apa yang harus diisi
```

**Alur baca:** Server Component memanggil repo langsung. Landing publik `/{slug}` adalah Server Component → SSR sungguhan, `generateMetadata` sungguhan, JSON-LD sungguhan. Ini bentuk akhir yang sama saat Supabase masuk.

**Alur tulis:** Client Component → Server Action → repo → `revalidatePath`. Setiap action mengembalikan `{ok:true, data}` atau `{ok:false, fieldErrors}`; tidak pernah melempar exception ke UI.

**Persistensi:** store di-snapshot ke `.data/store.json` (gitignored) dengan penulisan atomic dan debounce. Ini bukan sekadar kenyamanan — Next.js dev dengan HMR bisa me-reset state level modul, dan snapshot membuat data yang diketik tidak hilang. `npm run seed:reset` menghapus snapshot dan mengembalikan ke fixture.

**Permukaan migrasi Supabase** (berkas yang berubah, dan hanya ini): `lib/data/supabase/*`, `lib/ai/gemini.ts`, target upload media, dan lapisan sesi. Komponen UI tidak disentuh.

---

## 5. Model data — koreksi terhadap skema PRD

Blok skema di PRD menaruh `blocks`, `seo`, `template`, dan `ai_content` di tabel `house_types`, dengan catatan *"landing_pages direpresentasikan implisit oleh house_types.blocks + seo (1:1)"*. Itu peninggalan model sebelum v3.0 — satu landing per tipe rumah. Keputusan inti v3.0 adalah **satu landing per project**, sehingga tidak ada satu pun baris `house_types` yang bisa memiliki halaman itu.

**Koreksi yang berlaku:**

```
projects      (id, user_id, name, slug UNIQUE, location, developer, description,
               facilities[], status: draft|published,
               theme, blocks JSONB, seo JSONB, ai_content JSONB,
               created_at, updated_at, published_at)

house_types   (id, project_id, name, slug, price, land_area, building_area,
               bedrooms, bathrooms, carport, status,
               ai_content JSONB,          -- { shortDescription, sellingPoints[] }
               sort_order, created_at, updated_at)

media         (id, user_id, project_id, house_type_id, type: photo|floor_plan,
               url, size, is_primary, sort_order, created_at)

leads         (id, project_id, house_type_id?, name, phone, email?, message,
               source: form|whatsapp, status: new|contacted|interested|negotiation|deal|lost,
               created_at)

events        (id, project_id, house_type_id?, type: visitor|whatsapp_click|form_submit,
               date, count)

ai_usage      (id, user_id, project_id, model, prompt_tokens, completion_tokens,
               latency_ms, success, error?, created_at)

agent_profiles(id, user_id, site_name, subdomain, theme, logo_url, color_scheme,
               about, stats, services[], whatsapp, is_published)   -- di-seed, diedit di slice 2
```

Waktu disimpan ISO 8601 UTC; harga disimpan integer rupiah. Konvensi Indonesia (`Rp 2,45 M`, `16 Agustus 2026`) hanya berlaku saat ditampilkan.

Perhatikan `leads` dan `events` kini membawa `project_id` (PRD hanya menyebut `house_type_id`) — karena satu landing = satu project, sinyal minat pertama-tama milik project; tipe rumah opsional.

**Kenapa AI content dipecah dan tidak disimpan utuh di project:** Gemini mengembalikan satu JSON berisi array `houseTypes[]`. Bila disimpan utuh, menghapus atau menambah tipe rumah meninggalkan entri yatim, dan panel "Tipe Rumah" di editor akan menulis ke indeks array alih-alih ke baris tipe yang benar. Jadi respons AI **dipecah saat disimpan**: bagian proyek ke `projects.ai_content`, tiap elemen `houseTypes[]` dicocokkan lalu ditulis ke `house_types.ai_content` masing-masing.

---

## 6. Rute & tabrakan slug

```
app/
  layout.tsx                      font, token DS, Toaster
  login/page.tsx
  (dashboard)/
    layout.tsx                    sidebar + kartu profil
    dashboard/page.tsx
    projects/
      new/page.tsx
      [id]/page.tsx
      [id]/generate/page.tsx
      [id]/editor/page.tsx
      [id]/publish/page.tsx
      actions.ts
  (public)/
    [slug]/page.tsx               landing SSR
    [slug]/actions.ts             submit lead, catat event
  sitemap.ts
  robots.ts
```

Route group `(dashboard)` dan `(public)` tidak menambah segmen URL, sehingga `/{slug}` tetap bersih untuk SEO seperti yang diminta PRD.

**Masalah tabrakan.** `/{project-slug}` duduk di root, satu ruang nama dengan `/dashboard`, `/projects`, `/login`. Agen yang menamai proyeknya "Dashboard" akan membajak rute aplikasi. PRD menyadari ini (Open Question #2) tanpa memutuskan.

**Keputusan:** daftar slug terlarang divalidasi saat pembuatan dan penggantian nama project — `dashboard`, `projects`, `login`, `settings`, `leads`, `api`, `_next`, `sitemap.xml`, `robots.txt`, `agent`, `admin`, `app`, `static`, `assets`, `uploads`, `favicon.ico`. Bentrok antar-agen diselesaikan dengan suffix angka (`parkspring-gading-2`). Skema URL tidak berubah.

**Sesi dummy.** `/login` menulis cookie sesi berisi `userId` agen yang di-seed, lalu redirect ke `/dashboard`. Middleware menjaga rute `(dashboard)`. Di file design tombol login menuju onboarding; karena onboarding ditunda ke slice 2, slice 1 langsung ke dashboard.

---

## 7. Model konten landing — blocks, resolve, theme registry

### Blocks menyimpan referensi, bukan salinan

```ts
type BlockType =
  | 'hero' | 'gallery' | 'highlights' | 'houseTypes' | 'specs'
  | 'facilities' | 'floorPlans' | 'location' | 'faq' | 'agentCta' | 'contactForm';

type Block =
  | { id; type:'hero';        enabled; variant?; props:{ title?; subtitle?; mediaId? } }
  | { id; type:'gallery';     enabled; variant?; props:{ layout:'carousel'|'grid'; mediaIds:string[] } }
  | { id; type:'highlights';  enabled; variant?; props:{ items?:string[] } }
  | { id; type:'houseTypes';  enabled; variant?; props:{ order:string[]; hidden:string[] } }
  | { id; type:'specs';       enabled; variant?; props:{} }
  | { id; type:'facilities';  enabled; variant?; props:{} }
  | { id; type:'floorPlans';  enabled; variant?; props:{ mediaIds?:string[] } }
  | { id; type:'location';    enabled; variant?; props:{ address?; mapUrl? } }
  | { id; type:'faq';         enabled; variant?; props:{ items?:{q;a}[] } }
  | { id; type:'agentCta';    enabled; variant?; props:{ waNumber?; defaultMessage? } }
  | { id; type:'contactForm'; enabled; variant?; props:{ askHouseType?:boolean } };
```

Disimpan sebagai array terurut di `projects.blocks`. Urutan array = urutan render. Urutan default sesuai PRD dan `blockDefs` di file design: **Hero → Galeri → Highlights → Tipe Rumah → Spesifikasi per Tipe → Fasilitas → Denah → Lokasi → FAQ → CTA WhatsApp → Form Kontak.**

**Blok menyimpan id media dan id tipe rumah, bukan harga atau foto.** Konsekuensinya persis US-B3: agen mengubah harga Villa di halaman detail, landing yang sudah live ikut berubah pada render berikutnya, tanpa menyentuh editor.

**Field teks opsional, dan itu disengaja.** `props.title` kosong berarti "pakai default AI"; mengisinya berarti override. Maka tombol **"Use AI suggestion"** di US-C2 bukan fitur terpisah — ia menghapus override. Satu aturan, satu tempat.

### resolve.ts — fungsi murni

```
resolve(project, houseTypes, media, blocks) → ResolvedBlock[]
```

Menerapkan, dalam urutan ini: buang blok `enabled:false`; untuk tiap field, rantai `override ?? ai_content ?? kosong`; terapkan `order`/`hidden` pada tipe rumah; resolusi `mediaId` menjadi URL. Tidak menyentuh React — diuji langsung sebagai fungsi.

### Theme registry & renderer tunggal

```
lib/landing/
  blocks.ts          tipe + factory urutan default
  resolve.ts
  BlockRenderer.tsx
  themes/
    index.ts         Record<ThemeName, Record<BlockType, ComponentType>>
    wireframe/       satu-satunya tema di slice 1
```

**Aturan yang tidak boleh dilanggar:** ketiga tema berbagi block/content JSON yang identik dan hanya berbeda layout serta gaya. Tidak boleh ada tema yang menuntut bentuk konten berbeda — kalau itu terjadi, desain temanya yang salah, bukan modelnya.

Picker tema di editor tetap menampilkan Modern / Showcase / Luxury seperti design. `projects.theme` menyimpan nilai `'modern' | 'showcase' | 'luxury'` — **tidak ada nilai `'wireframe'` di data**. Registry-lah yang, selama slice 1, memetakan ketiganya ke set komponen `themes/wireframe/`. Saat desain tema asli datang, yang berubah hanya isi registry; kolom `theme` tidak perlu dimigrasi. Di slice 1 Showcase dan Luxury tampil disabled (opacity 40%, sesuai aturan disabled DS) dengan caption satu baris bahwa keduanya menyusul.

Field `variant` pada Block sudah ada di tipe tapi **belum dipakai di slice 1** — dengan satu set komponen wireframe, tidak ada variasi layout untuk dipilih. US-E2 meminta pemilih variasi blok (Hero style A/B/C); itu baru bermakna setelah tema asli masuk, jadi UI pemilihnya menyusul di slice 3. Slotnya disediakan sekarang supaya tidak perlu migrasi data nanti. Bagian US-E2 yang lain — urutan naik/turun dan toggle aktif — dikerjakan penuh di slice 1.

### Pratinjau editor — penyimpangan yang disetujui dari file design

File design menampilkan pratinjau editor sebagai **frame skematik** (kotak berlabel `HERO · FOTO UTAMA`, `GALERI`, …). Dokumen pen.dev Prompt 7 justru meminta *"landing page render penuh skala desktop"*. Keduanya bertentangan.

**Keputusan:** pertahankan seluruh chrome design — header `PRATINJAU`, toggle DESKTOP/MOBILE, ring evergreen 2px pada blok terpilih, kontainer stone — tapi isinya adalah **render `BlockRenderer` yang sungguhan**, dikecilkan lewat container ber-`transform: scale`. Toggle MOBILE mengubah lebar kontainer ke 390px.

Alasannya: US-F1 menuntut pratinjau identik dengan versi live. Mempertahankan frame skematik berarti memelihara dua representasi halaman selamanya, dan begitu tema aslinya masuk, yang skematik langsung berbohong. Dengan renderer yang sama, pratinjau tidak pernah bisa salah. Di slice 1 landing memang wireframe, jadi yang tampil di editor tetap sederhana — mirip yang digambar, tapi jujur.

### Panel pengaturan blok

File design merinci lima panel: Hero, Galeri, Tipe Rumah, FAQ, CTA WhatsApp. Kelimanya dibangun penuh sesuai design.

Enam sisanya belum punya desain, jadi dibangun minimal dan jujur: Highlights (edit daftar selling point), Denah (pilih media denah yang tampil), Lokasi (alamat + URL peta), Form Kontak (toggle field), sementara Spesifikasi per Tipe dan Fasilitas menampilkan keterangan bahwa isinya diturunkan dari data project/tipe rumah beserta tautan ke tempat mengeditnya. Semua blok tetap bisa diurutkan dan di-toggle aktif.

---

## 8. Landing publik — wireframe berstruktur

**Yang dikerjakan penuh** (arsitektur & SEO, bukan hiasan):

- Server Component murni. `generateMetadata` dari `projects.seo` dengan fallback ke nama + lokasi project.
- Open Graph lengkap; OG image dari media hero atau foto project pertama.
- JSON-LD `RealEstateListing` dengan `offers` per tipe rumah, plus `FAQPage` bila blok FAQ aktif dan berisi.
- Canonical dari `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`).
- `sitemap.ts` dan `robots.ts` — hanya project berstatus `published`.
- Satu `<h1>` (nama project), hierarki `<h2>` per section, alt text pada semua gambar.
- Anchor per tipe rumah (`#villa`) dan pill nav sticky di bawah hero untuk melompat antar tipe.
- Sticky CTA bar di mobile — WhatsApp + Minta Info, persis mock 390px di file design.
- `wa.me/{nomor}?text={pesan}` dari blok CTA, dibungkus pencatat event.

**Yang sengaja polos:** kotak berlabel menggantikan foto, permukaan netral DS, tanpa fotografi, tanpa perlakuan visual per tema. Desain aslinya menyusul dan akan masuk sebagai tema baru di registry — yang diganti hanya lapisan skin.

**CTA dan form berfungsi sejak slice 1** (tambahan disengaja di luar daftar awal): tombol WhatsApp mencatat event `whatsapp_click`, form kontak menulis baris `leads` dan event `form_submit`, kunjungan halaman mencatat `visitor`. Tanpa ini landing jadi jalan buntu, dan biayanya kecil karena repo sudah tersedia. Sisi dashboard-nya — tabel Leads dan kartu analitik — tetap slice 3, sehingga saat layar itu dibangun datanya sudah menumpuk sendiri.

Pencatatan `visitor` lewat komponen klien kecil yang memanggil Server Action sekali per sesi (dijaga `sessionStorage`), bukan efek samping saat render. Bot akan menggelembungkan angkanya; itu diterima untuk MVP.

---

## 9. AI mock

```
lib/ai/
  schema.ts      AiContentSchema (Zod) — cermin persis responseSchema Gemini
  generator.ts   interface ContentGenerator
  mock.ts        implementasi slice 1
```

`AiContentSchema` mengikuti PRD dan flow doc apa adanya: `headline`, `description`, `houseTypes[]{name, shortDescription, sellingPoints[]}`, `sellingPoints[]`, `faq[]{q,a}`, `seo{title,description}`, `captions{instagram,facebook,whatsapp}`.

Mock **menyusun teks dari data proyek yang sebenarnya** — nama, lokasi, developer, fasilitas, harga, luas, jumlah kamar — bukan lorem ipsum. Tiap proyek menghasilkan teks berbeda, sehingga editor terasa nyata dan mitigasi duplicate content di PRD bisa dinilai sejak sekarang. Latensi 3–8 detik.

**Tahapan bercentang di layar loading nyata di mock, tapi akan menjadi estimasi berbasis waktu saat Gemini asli masuk** — panggilan Gemini hanya satu round trip dan tidak melaporkan progress. Dicatat di sini supaya tidak dikira bug nanti.

Jalur gagal dipasang betulan, termasuk tautan **"Lihat state error"** yang sudah ada di design. State error menawarkan "Coba lagi" dan "Isi manual saja"; keduanya berfungsi, dan publish tetap mungkin tanpa konten AI sama sekali. Setiap percobaan — berhasil maupun gagal — menulis satu baris `ai_usage` (US-C3).

---

## 10. Media

File picker → downscale di klien (canvas, sisi terpanjang ~1600px, JPEG q0.82) → Server Action `FormData` → tulis ke `public/uploads/` dengan nama acak (isinya gitignored) → baris `media`.

Validasi: tipe `jpg|png|webp`, ukuran ≤10MB sebelum downscale, 1–20 foto per tipe rumah (PRD US-B2), pesan error spesifik per file. Denah = `media.type='floor_plan'`, foto utama = `media.is_primary`.

Ini meniru semantik Supabase Storage bucket publik bernama acak, jadi migrasinya sebatas mengganti sumber URL. `next/image` bekerja langsung pada `/uploads/...`.

---

## 11. Validasi & mutasi

Satu skema Zod per entitas di `lib/schemas/`, dipakai dua kali: resolver `react-hook-form` di klien, dan gerbang di Server Action. Input klien tidak pernah dipercaya.

Aturan yang ditegakkan: nama project wajib; harga tipe rumah harus angka positif (US-B1); slug lolos daftar terlarang; nomor WhatsApp berformat Indonesia yang valid — validasi terakhir ini berlaku di field "Nomor WhatsApp" pada panel blok CTA di editor, satu-satunya tempat nomor bisa diubah selama wizard profil masih ditunda.

Auto-save wizard di level langkah — tombol Lanjut memanggil action yang meng-upsert draft, sesuai indikator `TERSIMPAN OTOMATIS` di design. Bukan auto-save per ketikan.

---

## 12. Struktur direktori

```
app/                    lihat §6
components/
  ds/                   port 1:1: Button, Card, Chip, Banner, Input, NavLink
  ui/                   Radix dicat token DS: dialog, sheet, tabs, switch,
                        accordion, toast, table, progress, skeleton
  dashboard/            Sidebar, MetricCard, ProjectCard, EmptyState
  editor/               BlockList, BlockSettingsPanel, PreviewFrame, ThemePicker
  wizard/               StepShell, StepProgress
lib/
  data/                 lihat §4
  landing/              lihat §7
  ai/                   lihat §9
  schemas/              zod per entitas
  media/                downscale + helper upload
  format.ts             Rp, luas, tanggal Indonesia
  slug.ts               slugify + reserved + collision
  session.ts            cookie sesi dummy
styles/
  tokens/               salinan verbatim token DS
  globals.css           import token + @theme inline Tailwind
public/
  brand/                logo dari project design
  uploads/              gitignored
fixtures/               seed
tests/
  unit/
  e2e/spine.spec.ts
.data/store.json        gitignored
```

Aset brand (`listingku-logo.png`, `listingku-logo-white.png`, `listingku-mark.png`) diambil dari project Claude Design saat implementasi.

---

## 13. Pengujian

**Unit (Vitest + RTL):**
- `resolve.ts` — rantai override → AI → kosong; blok nonaktif dibuang; urutan dan visibilitas tipe rumah diterapkan
- `slug.ts` — kata terlarang ditolak; bentrok mendapat suffix
- Skema Zod — harga wajib positif; field wajib ditegakkan
- Mock repo — CRUD dan round-trip snapshot
- `AiContentSchema` — mem-parse output mock
- Reducer urutan/toggle blok

**Satu spec Playwright — jalur tulang punggung:** login → buat project → tambah 2 tipe rumah → generate AI → edit hero → publish → buka `/{slug}` dan pastikan `<h1>`, harga, tautan `wa.me`, serta JSON-LD hadir. Satu tes ini menjaga seluruh slice.

Styling wireframe tidak diuji — ia memang sementara.

---

## 14. Definisi selesai

1. `npm run dev` jalan tanpa satu pun layanan eksternal — tanpa Supabase, tanpa API key.
2. Alur penuh bisa diselesaikan di browser dengan data yang diketik sendiri; bertahan setelah dev server restart; `npm run seed:reset` mengembalikan ke bersih.
3. `/{slug}` benar-benar server-rendered — **dibuktikan lewat View Source, bukan diasumsikan** — lengkap dengan meta, OG, JSON-LD, canonical, `sitemap.xml`, `robots.txt`.
4. Jalur gagal AI bisa dicapai, dan publish tetap berhasil dengan konten manual.
5. Tujuh layar cocok dengan `Listingku App.dc.html` — token, spasi, dan copy.
6. Playwright hijau, unit test hijau, `npm run build` bersih.

---

## 15. Keputusan yang tercatat

| Keputusan | Alasan |
|---|---|
| Repository seam + Server Actions, bukan store di klien | Landing publik wajib SSR untuk SEO; store klien akan memaksa penulisan ulang halaman saat Supabase masuk |
| Snapshot ke `.data/store.json` | HMR Next.js me-reset state modul; tanpa snapshot data yang diketik hilang |
| `blocks`/`seo`/`theme`/`ai_content` pindah ke `projects` | v3.0 menetapkan satu landing per project; tidak ada baris `house_types` yang bisa memiliki halaman itu |
| AI content dipecah ke baris tipe rumah | Menghindari entri yatim saat tipe dihapus; editor menulis ke baris yang benar |
| Hybrid komponen: port DS + Radix | DS hanya punya 6 komponen dan menyatakannya eksplisit; menulis focus trap dan ARIA sendiri berisiko |
| Pratinjau editor = render sungguhan | US-F1 menuntut pratinjau identik dengan live; dua representasi akan berdivergensi |
| Landing sebagai wireframe berstruktur | Desain menyusul; arsitektur dan SEO tetap dikerjakan penuh supaya skin tinggal masuk |
| CTA & form landing berfungsi sejak slice 1 | Tanpa itu landing jalan buntu; biayanya kecil dan datanya menumpuk untuk slice 3 |
| Palette DS mengalahkan dokumen pen.dev | Dokumen pen.dev (biru `#2563EB`) usang; DS dan file design memakai evergreen/oranye |

## 16. Diketahui belum terjawab

- **Hijau logo.** Readme DS menandai `#00803A` sebagai pertanyaan terbuka: dipertahankan sebagai token mark-dan-sukses, bukan dilebur ke palette. Kita ikuti DS; kalau ternyata salah, yang berubah hanya token.
- **Font berlisensi.** Archivo menggantikan Neue Haas Grotesk. Bila file webfont aslinya tersedia, hanya `styles/tokens/typography.css` dan konfigurasi font yang berubah.
- **Ikon.** Lucide adalah substitusi yang ditandai DS. Ganti bila Listingku punya set sendiri.
- **PRD Open Question #2** (URL scoped `/u/{agen}/{slug}`) tidak diambil — daftar slug terlarang plus suffix dianggap cukup untuk MVP.
