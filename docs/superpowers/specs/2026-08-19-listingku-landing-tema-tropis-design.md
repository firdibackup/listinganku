# Design — Listingku Landing Slice 2: sistem tema + Tropis Hangat

> Status: disetujui 2026-08-19. Menggantikan tema `wireframe` dari slice 1.
> Spec ini sengaja berdiri sendiri — tidak ada konteks percakapan yang dibutuhkan
> untuk mengeksekusinya di device lain.

---

## 1. Tujuan & posisi slice ini

Slice 1 menutup alur end-to-end (Login → Project → Tipe Rumah → AI → Editor →
Publish → landing live) dengan landing publik berupa **wireframe berstruktur** —
placeholder yang sengaja tidak didesain, menunggu desain asli dari user. STATUS.md
mencatatnya sebagai blocker eksternal.

Blocker itu sekarang terbuka. User menyerahkan 10 file desain landing page.
Slice ini membangun **fondasi sistem tema** dan **satu tema penuh** di atasnya.

### Yang masuk slice ini (2A)
- Lapisan palet: 20 token peran, 10 palet, dapat ditukar saat runtime.
- Model blok diperluas: 3 blok baru, 3 blok diperluas.
- Registry tema naik dari peta komponen menjadi objek (urutan, font, chrome, palet bawaan).
- Tema **Tropis Hangat** lengkap: 14 komponen blok + Header + Footer, mobile-first, responsive.
- Editor: pemilih palet, konfirmasi urutan saat ganti tema, panel untuk blok baru.
- Migrasi `ThemeName`, field `Project.palette`, seed baru.
- Penghapusan tema `wireframe`.

### Yang ditunda (desainnya sudah ada, tinggal dikerjakan)
- Sembilan layout sisanya (01–09) — satu slice masing-masing, lihat §19.
- Situs profil `{subdomain}.listingku.app` — masih menunggu middleware subdomain.

---

## 2. Sumber desain

Claude Design, project **`b83ace24-6494-4409-9908-45979e7de301`**
("10 Design Landing Page Variatif"), dibaca lewat tool `DesignSync`.
Di device baru jalankan `/design-login` lebih dulu — auth DesignSync per-device.

| File | Tema | Aksen |
|---|---|---|
| `00 Index.dc.html` | daftar isi + deskripsi tiap varian | — |
| `01 Premium Gelap.dc.html` | latar gelap, aksen emas, hero foto penuh, sticky CTA harga | `#c9a227` |
| `02 Editorial Putih.dc.html` | headline serif dulu, tipe unit sebagai daftar editorial | `#1b4d3e` |
| `03 Korporat Biru.dc.html` | form lead di dalam hero, tipe unit bertab, promo countdown | `#0f3d6e` |
| `04 Soft Luxury Beige.dc.html` | kartu membulat, tipe unit digeser, galeri bertab | `#8a6b45` |
| `05 Bold Retail.dc.html` | tipografi besar, promo di depan, sticky CTA WhatsApp | `#ffd400` |
| `06 Arsitektural Beton.dc.html` | nuansa teknis, tipe unit sebagai lembar spesifikasi | `#8a8880` |
| `07 Nature Calm.dc.html` | hero melengkung, fasilitas sebelum tipe unit | `#4a6047` |
| `08 Klasik Navy.dc.html` | komposisi terpusat, serif klasik, trust lebih kuat | `#12233f` |
| `09 Playful Pastel.dc.html` | blok pastel, copy santai, pil CTA mengambang | `#4a3fa8` |
| **`10 Tropis Hangat.dc.html`** | **terracotta + hijau, lokasi naik ke atas, tipe unit di blok hijau — TEMA SLICE INI** | `#b4552f` |

`00 Index` menyatakan sendiri premis yang menopang seluruh arsitektur ini:

> "Konten sama — hero, USP, lokasi, fasilitas, tipe unit, galeri, masterplan,
> harga & promo, testimoni, FAQ, tim marketing, CTA dan footer. Yang berbeda:
> gaya visual, urutan section, dan cara tipe unit ditampilkan."

Sepuluh desain berbagi **satu bentuk konten**. Ini persis aturan PRD: *"never build
a theme that requires different content shape."* Karena itu 10 layout tidak berarti
10 model data.

**Semua 10 file mobile-only** — `width:390px`, `$preview:{width:390,height:844}`.
Tidak ada rancangan desktop. Lihat §12.

---

## 3. Keputusan yang mengunci bentuk pekerjaan

Empat keputusan diambil user pada 2026-08-19. Semuanya tertutup — jangan dibuka ulang
tanpa permintaan eksplisit.

**3.1 Cakupan isi = Hybrid.** Enam bagian di desain tidak punya sumber data.
Yang ditambahkan hanya yang bernilai jual tinggi di pasar properti Indonesia:
akses lokasi, harga & promo, testimoni, developer. Masterplan memakai media yang
sudah ada. Tim marketing = satu agen. Form kontak dipertahankan.

**3.2 Sepuluh layout DAN palet yang bisa ditukar.** Bukan salah satu. Arsitekturnya
memisahkan warna dari layout sehingga 10 × 10 = 100 tampilan lahir dari ~20 unit
kerja. Dieksekusi bertahap: fondasi + Tropis Hangat dulu (slice ini), 9 sisanya menyusul.

**3.3 Tema membawa urutan blok bawaannya.** Project baru memakai urutan temanya.
Saat agen ganti tema muncul konfirmasi "Terapkan urutan bawaan tema ini?" — susunan
manual agen tidak boleh hilang diam-diam. Tombol naik/turun di editor tetap ada.

**3.4 Mobile-first, desktop responsive.** Layout mobile mengikuti file desain persis.
Perilaku desktop dirancang di §12 karena tidak ada file desainnya.

---

## 4. Arsitektur tiga lapis

File `.dc.html` memakai inline style. Itu **tidak boleh dibawa apa adanya**: inline
style tidak bisa punya media query (mematikan §3.4), tidak bisa punya `:hover`/`:focus`,
dan membengkakkan HTML SSR di setiap kunjungan.

| Lapis | Bentuk | Frekuensi bangun |
|---|---|---|
| **Konten** | `Block[]` → `resolveBlocks()` → `ResolvedBlock[]` | 1× |
| **Palet** | CSS custom property di `[data-lp-palette]` | 1× (10 palet) |
| **Layout** | Komponen React per tema, **hanya** membaca `var(--lp-*)` | 10× |

Palet menjadi atribut pada root landing:

```tsx
<div className="lp" data-lp-theme={project.theme} data-lp-palette={project.palette}>
```

Ganti palet = ganti satu atribut. Nol JavaScript, nol flash, SSR bersih, pratinjau
editor ikut berubah seketika.

**Aturan mengikat:** komponen tema TIDAK BOLEH menulis nilai warna literal. Setiap
warna lewat `var(--lp-*)`. Satu hex hardcoded akan membuat 9 palet lain rusak di
tempat itu, dan rusaknya tidak kelihatan sampai seseorang menukar palet.

### Alternatif yang ditolak
- **Palet sebagai objek JS + inline style.** Setia pada `.dc.html`, tapi mematikan
  responsive dan state interaktif. Ditolak.
- **Palet sebagai layer Tailwind `@theme`.** Toh hanya menghasilkan CSS var — sama
  saja tapi lebih kaku untuk pilihan runtime per-project. Ditolak.

---

## 5. Kontrak palet — 20 token peran

Token **dinamai menurut peran, bukan menurut terang-gelap.** Inilah yang membuat
palet gelap ("Premium Gelap") bisa dipasang ke layout terang tanpa rusak: di palet
gelap, `--lp-contrast` justru lebih *terang* dari `--lp-bg`, dan kontraknya tetap
sah karena namanya "blok kontras", bukan "blok gelap".

| Token | Peran |
|---|---|
| `--lp-bg` | latar halaman |
| `--lp-surface` | permukaan terangkat / kartu redam |
| `--lp-line` | garis rambut, pemisah grid |
| `--lp-ink` | teks utama |
| `--lp-ink-soft` | teks sekunder / paragraf |
| `--lp-ink-faint` | teks tersier / label kecil |
| `--lp-accent` | aksen utama |
| `--lp-on-accent` | teks di atas aksen |
| `--lp-accent-soft` | teks redam di atas aksen |
| `--lp-contrast` | blok kontras (price bar, blok penutup) |
| `--lp-on-contrast` | teks di atas blok kontras |
| `--lp-on-contrast-soft` | teks redam di atas blok kontras |
| `--lp-contrast-accent` | aksen yang terbaca di atas blok kontras |
| `--lp-feature` | blok fitur (blok tipe unit) |
| `--lp-on-feature` | teks di atas blok fitur |
| `--lp-on-feature-soft` | teks redam di atas blok fitur |
| `--lp-footer` | latar footer |
| `--lp-on-footer` | teks footer |
| `--lp-ph-a` / `--lp-ph-b` | dua warna garis diagonal placeholder media |

### Palet `tropicalWarm` — nilai lengkap

```css
[data-lp-palette="tropicalWarm"]{
  --lp-bg:#faf3ea;             --lp-surface:#efe4d8;        --lp-line:#e5d8c8;
  --lp-ink:#2b2119;            --lp-ink-soft:#6b5c4d;       --lp-ink-faint:#8a7a68;
  --lp-accent:#b4552f;         --lp-on-accent:#faf3ea;      --lp-accent-soft:#f0c3a5;
  --lp-contrast:#2b2119;       --lp-on-contrast:#faf3ea;
  --lp-on-contrast-soft:#b1a08d; --lp-contrast-accent:#e8a26f;
  --lp-feature:#1b4d3e;        --lp-on-feature:#faf3ea;     --lp-on-feature-soft:#9fbfae;
  --lp-footer:#211a13;         --lp-on-footer:#9a8875;
  --lp-ph-a:#e2d3c1;           --lp-ph-b:#dacbb8;
}
```

Semua nilai di atas diangkat verbatim dari `10 Tropis Hangat.dc.html`. Jangan
"dirapikan" — ini palet perancangnya, bukan usulan.

### Prosedur ekstraksi 9 palet lain

Sembilan palet sisanya **tidak boleh dikarang dari kolom aksen di §2.** Ekstrak dari
file desainnya masing-masing lewat `DesignSync get_file`, dengan pemetaan:

1. `--lp-bg` = warna latar div pembungkus 390px (bukan `body`).
2. `--lp-surface` = latar kartu/section redam yang paling sering muncul.
3. `--lp-line` = latar container yang dipakai sebagai garis rambut `gap:1px`.
4. `--lp-ink` / `--lp-ink-soft` / `--lp-ink-faint` = warna teks judul / paragraf / label kecil.
5. `--lp-accent` = warna eyebrow dan tombol utama.
6. `--lp-contrast` / `--lp-feature` = dua warna blok penuh-lebar yang berbeda dari `--lp-bg`.
   Bila sebuah desain hanya punya satu, set keduanya sama.
7. `--lp-ph-a`/`-b` = dua warna `repeating-linear-gradient` placeholder.

Setiap palet wajib lolos §17.3 (kontras).

---

## 6. Tipografi — milik tema, bukan palet

Pasangan font adalah bagian dari identitas layout, bukan warna. "Editorial Putih"
butuh pasangan serif-forward; "Bold Retail" tidak. Kalau font ikut palet, kombinasi
palet × layout akan menghasilkan pasangan yang tidak pernah dirancang siapa pun.

Tropis Hangat: **DM Serif Display** (display) + **DM Sans** (teks).

Dimuat lewat `next/font/google` seperti Archivo yang sudah ada di `app/layout.tsx` —
self-host, tanpa request ke Google saat runtime, tanpa CLS. Semua pasangan font tema
dideklarasikan di satu modul `lib/landing/fonts.ts` pada scope modul (`next/font`
tidak bisa dipanggil kondisional); hanya kelas `.variable` milik tema terpilih yang
dipasang ke root landing. `@font-face` yang tidak terpakai tidak memicu unduhan.

Tema mengekspos dua variabel:

```css
--lp-font-display: var(--font-dm-serif), Georgia, serif;
--lp-font-text:    var(--font-dm-sans), system-ui, sans-serif;
```

---

## 7. Model blok — 3 baru, 3 diperluas

### 7.1 Blok baru

```ts
export type PricePromoBlock = BlockBase<'pricePromo', {
  dpText?: string;            // "10%"
  installmentText?: string;   // "Rp 18 jt"
  promos?: string[];
  note?: string;
}>;

export type TestimonialsBlock = BlockBase<'testimonials', {
  items?: { quote: string; name: string; unit: string }[];
}>;

export type DeveloperBlock = BlockBase<'developer', {
  about?: string;
  stats?: { value: string; label: string }[];   // value string: "40+", "12.000"
}>;
```

`stats.value` bertipe `string`, bukan `number` — desain menampilkan "40+" dan
"12.000". Memaksanya jadi angka akan membuang informasi yang justru dipakai.

### 7.2 Blok yang diperluas

| Blok | Tambahan | Alasan |
|---|---|---|
| `location` | `access?: { time: string; place: string }[]` | Di desain, kartu jarak tempuh berada **di dalam** section Lokasi. Blok terpisah memaksa agen mengurus dua panel untuk satu section yang tak terpisahkan. |
| `floorPlans` | resolved `+ masterplan: Media \| null` | **Tanpa field blok baru.** Masterplan = media `type:'floor_plan'` dengan `houseTypeId === null` (denah per-tipe selalu punya `houseTypeId`). Datanya sudah ada, hanya belum pernah di-resolve. |
| `hero` | `badges?: string[]`; resolved `+ priceFrom`, `+ waNumber`, `+ defaultMessage` | Badge default diambil dari `highlights.items` lalu `project.facilities` (4 pertama). `priceFrom`/`waNumber` menyuplai price bar di bawah hero. |

`hero` menerima `waNumber`/`defaultMessage` yang juga dimiliki `agentCta` — duplikasi
yang disengaja. `BlockRenderer` hanya meneruskan `{ block }` ke komponen tema, jadi
komponen tidak punya jalan lain untuk tahu data di luar bloknya sendiri. Ini mengikuti
preseden `projectId` yang sudah ada di `resolve.ts` (lihat komentarnya di kasus
`agentCta`) — bukan pola baru.

### 7.3 Bentuk akhir

14 blok: `hero`, `gallery`, `highlights`, `houseTypes`, `specs`, `facilities`,
`floorPlans`, `location`, `pricePromo`, `developer`, `testimonials`, `faq`,
`agentCta`, `contactForm`.

`BLOCK_LABELS` bertambah: `pricePromo: 'Harga & Promo'`, `developer: 'Developer'`,
`testimonials: 'Testimoni'`.

---

## 8. Batas AI — fakta vs prosa

**`AiContentSchema` tidak berubah sama sekali di slice ini.** Nol migrasi AI.

Itu bukan kebetulan, melainkan konsekuensi dari satu garis yang ditarik sengaja:

> **AI menulis prosa pemasaran. Manusia memasok fakta dan klaim.**

Semua field baru di §7 adalah klaim faktual:

| Field | Kenapa tidak boleh AI |
|---|---|
| `location.access` | "3 mnt ke gerbang tol" adalah klaim terukur. AI akan mengarangnya. |
| `pricePromo.*` | Syarat komersial. AI yang mengarang promo bisa membuat agen mempublikasikan penawaran yang tidak pernah ada — masalah hukum, bukan sekadar bug. |
| `developer.about` / `stats` | Sejarah dan angka perusahaan pihak ketiga. |
| `testimonials.items` | **Mutlak tidak boleh AI.** Testimoni fabrikasi yang ditampilkan seolah asli adalah penipuan terhadap pembeli. Field ini hanya boleh diisi agen. |

Ketiga blok baru karena itu **tidak punya rantai `pick(override, ai, fallback)`** —
hanya `override ?? []`. Blok yang kosong tidak dirender sama sekali (§11).

---

## 9. Registry tema

```ts
export type Theme = {
  label: string;                        // "Tropis Hangat"
  order: BlockType[];                   // urutan bawaan
  disabledByDefault: BlockType[];
  fonts: { displayVar: string; textVar: string; className: string };
  defaultPalette: PaletteName;
  components: BlockComponents;
  Chrome: {
    Header: ComponentType<ChromeProps>;
    Footer: ComponentType<ChromeProps>;
  };
};

export const THEMES: Record<ThemeName, Theme>;
export const AVAILABLE_THEMES: ThemeName[] = ['tropicalWarm'];
```

`BlockComponents` tetap diketik `{ [K in ResolvedBlock['type']]: ... }`. Konsekuensinya
TypeScript **memaksa** setiap tema mengimplementasi semua 14 blok — tidak ada tema
yang bisa diam-diam kehilangan section. Ini properti yang sengaja dipertahankan, dan
ini pula alasan tema `wireframe` dihapus (§14).

### Header & Footer masuk tema, bukan blok

Setiap desain menggambar chrome-nya berbeda, dan chrome tidak punya makna sebagai
"blok yang bisa dimatikan agen". `ChromeProps` = `{ project, agent, houseTypes }`.

**Jam operasional dilewati.** Footer desain menampilkan "Senin–Minggu, 09.00–17.00
WIB"; tidak ada fieldnya di `AgentProfile`, dan menambah satu isian lagi menggerus
target Time to Publish <10 menit untuk baris paling tidak bernilai di footer.
Tercatat sebagai terbuka di §21.

---

## 10. Urutan bawaan Tropis Hangat

```
hero → location → highlights → houseTypes → [specs: OFF] → facilities
→ floorPlans → gallery → pricePromo → developer → testimonials → faq
→ agentCta → contactForm
```

Berbeda dari `BLOCK_ORDER` slice 1 (urutan PRD) di tiga titik: **Lokasi naik ke
posisi kedua**, Galeri turun ke bawah Masterplan, dan tiga blok baru masuk sebelum FAQ.

`specs` **mati secara default** karena grid spesifikasi sudah ada di dalam kartu tipe
unit (§11). Menyalakannya menghasilkan tabel perbandingan seluruh tipe berdampingan —
berguna di desktop, tapi bukan bagian desain, jadi agen yang memutuskan.

### Mekanisme ganti tema (§3.3)

`defaultBlocks()` menjadi `defaultBlocksForTheme(theme)`. Saat agen menekan tema lain
di editor: tema berganti seketika (warna + layout), lalu muncul konfirmasi
**"Terapkan urutan bawaan tema ini?"** dengan pilihan Terapkan / Pertahankan susunan saya.
Tidak ada state "dirty" tersembunyi, dan susunan manual tidak pernah hilang tanpa
sepengetahuan agen.

---

## 11. Tema Tropis Hangat — spesifikasi per section

Ukuran piksel diambil dari `10 Tropis Hangat.dc.html`; **baca file itu saat
mengimplementasi tiap komponen**, spec ini menetapkan struktur dan pemetaan token,
bukan menyalin ulang seluruh CSS-nya.

Metrik bersama: section standar `padding:30px 20px`; eyebrow `11px / letter-spacing
.18em / --lp-accent / margin-bottom 8px`; H2 `--lp-font-display / 29px / line-height 1.2`.

| # | Section | Blok | Latar | Catatan kunci |
|---|---|---|---|---|
| — | **Header** | Chrome | `--lp-accent` | `project.name` (display 20px) + `project.location` di-uppercase (11px, ls .1em) |
| 1 | **Hero** | `hero` | foto + gradien | 500px. Gradien `180deg, transparan 30% → --lp-contrast 78%`. Badge: `rgba(--lp-on-accent,.16)` + `backdrop-filter:blur(6px)`. H1 display 40px/1.08 |
| 2 | **Price bar** | `hero` | `--lp-contrast` | Bagian dari komponen Hero, bukan blok tersendiri. Label + `priceFrom` (display 30px, `--lp-contrast-accent`) + tombol WhatsApp `--lp-accent` |
| 3 | **Lokasi** | `location` | `--lp-bg` | Alamat, peta (210px, radius 14px, titik `--lp-accent` + ring `.16`), lalu kartu akses scroll-x `min-width:126px` — waktu display 22px `--lp-accent` |
| 4 | **USP** | `highlights` | `--lp-bg` | Daftar bergaris rambut: container `--lp-line` + `gap:1px`, baris `--lp-bg`. Nomor urut display 20px `--lp-accent`. Item `string` dipakai sebagai judul; **baris deskripsi di desain dihilangkan** — `highlights.items` selalu `string[]`, tidak pernah pasangan judul+deskripsi |
| 5 | **Tipe Unit** | `houseTypes` | `--lp-feature` | Tab per tipe (aktif: `--lp-bg`/`--lp-feature`; nonaktif: transparan + border `.35`). Kartu aktif: foto utama, nama display 24px, harga `--lp-accent`, **grid spesifikasi 2 kolom** dari `landArea/buildingArea/bedrooms/bathrooms/carport`, catatan dari `shortDescription`. Interaktif → Client Component |
| 6 | **Spesifikasi** | `specs` | `--lp-bg` | OFF default. Tabel perbandingan semua tipe |
| 7 | **Fasilitas** | `facilities` | `--lp-bg` | Grid 2 kolom, kartu `--lp-surface`, foto 104px + nama. `facilities` hanya `string[]` — **tidak ada deskripsi per fasilitas**, kartu dirancang tanpa baris itu |
| 8 | **Masterplan** | `floorPlans` | `--lp-bg` | `masterplan` media 1:1. Legenda cluster **dihilangkan** (tidak ada datanya). Denah per-tipe tetap tampil di bawahnya |
| 9 | **Galeri** | `gallery` | `--lp-bg` | Scroll-snap-x, item 230px, gambar 250px. **Caption dihilangkan** (`Media` tidak punya field caption) |
| 10 | **Harga & Promo** | `pricePromo` | `--lp-accent` | Harga besar display 38px dari `priceFrom`. Dua kartu DP/cicilan `rgba(0,0,0,.15)`. Daftar promo `rgba(0,0,0,.13)`. Eyebrow `--lp-accent-soft` |
| 11 | **Developer** | `developer` | `--lp-bg` | Nama dari `project.developer`, paragraf `about`, 3 kartu statistik `--lp-surface` (nilai display 23px `--lp-accent`) |
| 12 | **Testimoni** | `testimonials` | `--lp-bg` | Kartu `--lp-surface`, kutipan display 19px/1.45, avatar 38px bulat |
| 13 | **FAQ** | `faq` | `--lp-bg` | Akordeon bergaris rambut. Baris terbuka `--lp-surface`, penanda `+`/`−` `--lp-accent`. Interaktif → Client Component |
| 14 | **Tim Marketing** | `agentCta` | `--lp-surface` | **Satu kartu agen**, bukan tiga. `agent.fullName` + peran + tombol WhatsApp (`--lp-feature`) dan Telepon (garis) |
| 15 | **Penutup + Form** | `contactForm` | `--lp-contrast` | Headline penutup desain + `ContactForm` yang sudah ada + tombol WhatsApp |
| — | **Footer** | Chrome | `--lp-footer` | Nama project, alamat, kontak agen, tautan lompat, copyright. **Tanpa jam operasional** |

### Penyimpangan yang disengaja dari file desain

1. **"Tim Marketing" jadi satu agen.** Desain menggambar tiga orang. Multi-agen
   eksplisit di luar scope MVP (`CLAUDE.md` → Out of Scope).
2. **Blok penutup gelap menampung form kontak.** Desain #10 sama sekali tidak punya
   form — hanya WhatsApp + "Jadwalkan Survey". Form adalah pipeline lead yang sudah
   jalan (`submitLeadAction` → halaman `/leads`) dan sudah ada tesnya; menghapusnya
   demi kesetiaan visual adalah kemunduran fungsi. Slot penutup diisi headline desain
   + form + tombol WhatsApp.
3. **Legenda masterplan, caption galeri, deskripsi per fasilitas, dan baris deskripsi
   pada USP dihilangkan** — tidak ada sumber datanya, dan §3.1 memutuskan tidak
   menambah field untuk keempatnya.
4. **Harga hardcoded "Rp 2,6 M" dan "Legalitas: SHM" tidak disalin.** Harga diturunkan
   dari `min(houseTypes.price)` lewat `formatRupiahShort`. Legalitas tidak ada di skema
   dan tidak ditambahkan — mengklaim SHM untuk unit yang belum tentu SHM adalah klaim
   hukum palsu.

### Blok kosong tidak dirender

Ketiga blok baru tidak punya fallback AI (§8). Bila `promos`, `items`, atau `stats`
kosong, komponennya **mengembalikan `null`** — bukan section kosong berjudul. Ini juga
berlaku untuk `location.access`, `floorPlans.masterplan`, dan `hero.badges`.

---

## 12. Responsive — mobile-first

File desain hanya menetapkan 390px. Perilaku di atas itu dirancang di sini, dengan
aturan yang konsisten dan bukan improvisasi per-section:

| Breakpoint | Aturan |
|---|---|
| **< 640px (dasar)** | Persis file desain. Semua nilai piksel di §11 berlaku apa adanya |
| **≥ 640px** | Grid 2 kolom → 3. Scroll-x (akses, galeri) tetap scroll-x. Hero 500px → 560px |
| **≥ 900px** | Konten dibatasi `max-width:1120px` terpusat. Galeri scroll-x → grid 3 kolom. Akses → grid 6 kolom. Blok Tipe Unit jadi 2 kolom: tab + daftar di kiri, kartu detail di kanan. Fasilitas 3 kolom. Hero 640px, H1 skala naik |
| **≥ 1200px** | Padding section 30px → 56px. Masterplan dan denah berdampingan |

Teks tetap dibatasi `max-width:68ch` di semua ukuran — paragraf selebar 1120px tidak
terbaca. Ukuran font display naik lewat `clamp()`, bukan media query bertingkat.

Sticky CTA (`StickyCtaBar`, sudah ada) tetap hanya muncul di bawah 900px.

---

## 13. Data & migrasi

### 13.1 `ThemeName`

```ts
export type ThemeName =
  | 'premiumDark' | 'editorialWhite' | 'corporateBlue' | 'softLuxury' | 'boldRetail'
  | 'architectural' | 'natureCalm' | 'classicNavy' | 'playfulPastel' | 'tropicalWarm';
```

Mengikuti konvensi repo: identifier Inggris camelCase, label Indonesia (seperti
`BlockType` + `BLOCK_LABELS`).

Nilai lama `'modern' | 'showcase' | 'luxury'` ada di seed, snapshot store, dan belasan
tes. Ditangani `normalizeTheme(raw: string): ThemeName`, dipanggil dari `repairShape()`
di mock store:

- Nilai yang **sudah sah** dilewatkan apa adanya.
- Nilai **lama** (`'modern'`/`'showcase'`/`'luxury'`) dan nilai **asing** apa pun → `'tropicalWarm'`.

Ini **bukan** pemetaan menyeluruh. Begitu `editorialWhite` dibangun di slice 2B,
project yang memilihnya harus tetap memilikinya — fungsi yang memetakan semua nilai
ke `'tropicalWarm'` akan diam-diam mengembalikan setiap project ke tema yang salah.

### 13.2 `PaletteName` & `Project.palette`

Sepuluh nama palet sejajar dengan `ThemeName`. `Project.palette: PaletteName` baru;
project yang belum punya nilai mendapat `THEMES[project.theme].defaultPalette` lewat
`repairShape()`.

`AgentProfile.colorScheme` **tidak disentuh** — itu milik situs profil agen, urusan lain.

### 13.3 Seed

`fixtures/seed.ts` diisi konten yang mengisi keempat belas blok, termasuk `access`,
`pricePromo`, `developer`, dan `testimonials`. Konten diambil dari
`10 Tropis Hangat.dc.html` (Parkspring Kelapa Gading) supaya hasil render bisa
dibandingkan mata langsung dengan file desain.

> **`npm run seed:reset` WAJIB dijalankan setelah mengubah `fixtures/seed.ts`.**
> `repairShape()` hanya mengisi tabel yang HILANG — tabel yang ada tapi kosong dan
> field baru pada baris lama tidak diperbaiki, jadi store lama diam-diam menyembunyikan
> seed baru. Ini sudah pernah menggigit (STATUS.md).

---

## 14. Penghapusan tema `wireframe`

Konsekuensi langsung dari §9: menambah 3 blok berarti `wireframe` juga harus
mengimplementasinya atau `tsc` merah. Itu kerja mati untuk tema yang sejak awal
sementara — slice 1 menyebutnya "wireframe berstruktur, desain aslinya menyusul".

`lib/landing/themes/wireframe/` (11 komponen + index) dihapus. `AVAILABLE_THEMES`
menjadi `['tropicalWarm']`; sembilan tema lain tampil **disabled** di pemilih tema
sampai dibangun, dengan keterangan yang jujur. `tests/unit/block-renderer.test.tsx`
dialihkan ke tema baru.

Aturan `.lp__section:nth-child(even){background:var(--stone)}` di `landing.css` ikut
hilang — itu peretasan wireframe. Setiap tema mengatur latar section-nya sendiri (§11).

---

## 15. Editor

| Perubahan | Isi |
|---|---|
| Pemilih tema | 10 tema; 9 disabled dengan keterangan |
| **Pemilih palet** (baru) | Baris swatch 10 palet, `aria-pressed`, menulis `Project.palette` |
| **Konfirmasi urutan** (baru) | Muncul saat ganti tema (§10) |
| Panel `pricePromo` | DP, cicilan, daftar promo (tambah/hapus baris) |
| Panel `testimonials` | Kutipan, nama, tipe unit — dengan keterangan bahwa isian ini tidak pernah diisi AI |
| Panel `developer` | Paragraf + 3 statistik |
| Panel `location` | Alamat, URL peta, **daftar akses** (waktu + tempat) |

Pratinjau editor tetap memakai `BlockRenderer` yang sama dengan halaman live, kini
dibungkus `data-lp-theme`/`data-lp-palette` supaya palet ikut berubah di pratinjau.

---

## 16. Struktur direktori

```
lib/landing/
  blocks.ts                    (+3 tipe blok, +BLOCK_LABELS, defaultBlocksForTheme)
  resolve.ts                   (+3 case, location.access, floorPlans.masterplan, hero.*)
  fonts.ts                     BARU — deklarasi next/font per tema
  palettes.ts                  BARU — PaletteName + daftar + label
  themes/
    index.ts                   (Theme object, THEMES, AVAILABLE_THEMES)
    tropicalWarm/
      index.ts                 order, fonts, defaultPalette, components, Chrome
      Header.tsx  Footer.tsx
      Hero.tsx                 (+ price bar)
      Location.tsx  Highlights.tsx  HouseTypes.tsx (client)  Specs.tsx
      Facilities.tsx  FloorPlans.tsx  Gallery.tsx  PricePromo.tsx
      Developer.tsx  Testimonials.tsx  Faq.tsx (client)  AgentCta.tsx
      ContactFormBlock.tsx
      theme.css                layout-only; NOL nilai warna literal
    wireframe/                 DIHAPUS
styles/landing/
  palettes.css                 BARU — 10 × 20 token
  landing.css                  (dipindah dari lib/landing/, hack nth-child dibuang)
components/editor/
  PalettePicker.tsx            BARU
  BlockSettingsPanel.tsx       (+4 panel)
```

---

## 17. Pengujian

**17.1 Unit — resolve.** Tiga blok baru: kosong → tidak dirender, terisi → diteruskan.
`location.access` bertahan. `floorPlans.masterplan` memilih media `floor_plan` dengan
`houseTypeId === null` dan **tidak** mengambil denah per-tipe. `hero.badges` jatuh ke
`highlights` lalu `facilities`. `hero.priceFrom` = minimum harga, `null` bila tanpa tipe.

**17.2 Unit — tema & migrasi.** `THEMES` punya 10 kunci; `AVAILABLE_THEMES` =
`['tropicalWarm']`. `normalizeTheme` memetakan `'modern'`/`'showcase'`/`'luxury'`/sampah
→ `'tropicalWarm'`. `defaultBlocksForTheme('tropicalWarm')` menghasilkan 14 blok dengan
urutan §10 dan `specs.enabled === false`.

**17.3 Unit — kontrak palet (penting).** Untuk **setiap** palet: kedua puluh
token terdefinisi (tidak ada yang `undefined`), dan pasangan teks-di-atas-latar
(`ink`/`bg`, `on-accent`/`accent`, `on-contrast`/`contrast`, `on-feature`/`feature`,
`on-footer`/`footer`) memenuhi rasio kontras WCAG AA 4.5:1. Tes ini yang mencegah
palet baru diam-diam menghasilkan teks tak terbaca.

**17.4 Unit — komponen.** Tiap blok baru: render terisi, dan render kosong → tidak
menghasilkan section.

**17.5 Lint kustom — nol hex literal.** Menelusuri `lib/landing/themes/**/*.tsx|css`
mencari `#rrggbb`/`rgb(`/`hsl(` di luar `palettes.css`. Ini penegak aturan §4; tanpanya
pelanggarannya tak terlihat sampai seseorang menukar palet.

**17.6 E2e.** Landing yang dipublish merender keempat belas section. Tab tipe unit
berpindah. Akordeon FAQ membuka. Form kontak tetap membuat lead (regresi §11 poin 2).
Ganti palet di editor mengubah pratinjau. **Ingat: e2e serial (`workers:1`) di atas satu
mock store bersama — jangan menulis asersi bernilai absolut** (jumlah baris, angka
metrik, keunikan nama). Pakai `.first()`, baseline yang dibaca di tes itu sendiri, atau
`toBeGreaterThanOrEqual` (`bug-024`).

**17.7 Jangan jalankan `npm run build`/`verify` selagi `next dev` hidup** — `.next`
rusak (`Cannot find module './611.js'`) dan seluruh e2e gagal timeout. Cek port 3000
dulu (`bug-023`).

---

## 18. Definisi selesai

1. `npm run verify` EXIT_CODE=0 — unit hijau, `npm run build` bersih, e2e hijau.
2. Landing `/{slug}` merender tema Tropis Hangat, tetap **server-rendered** — dibuktikan
   lewat View Source, lengkap meta/OG/JSON-LD/canonical.
3. Menukar palet di editor mengubah seluruh halaman tanpa reload dan tanpa flash.
4. Kesepuluh palet lolos tes kontras §17.3.
5. Lint §17.5 melaporkan nol hex literal di komponen tema.
6. Landing terbaca dan proporsional di 390px, 768px, dan 1440px — diperiksa mata,
   screenshot dilampirkan ke laporan task.
7. Alur penuh slice 1 (Login → … → Publish → landing live) masih lolos, termasuk
   pengiriman lead lewat form.
8. Ganti tema menawarkan urutan bawaan dan menghormati penolakan agen.

---

## 19. Dekomposisi slice berikutnya

**2B–2J — sembilan layout sisanya, satu slice masing-masing.** Tiap slice hanya:
baca `.dc.html`-nya lewat DesignSync, ekstrak palet per §5, tulis 14 komponen +
Header/Footer + urutan + pasangan font, daftarkan di `THEMES`, tambahkan ke
`AVAILABLE_THEMES`.

**Nol perubahan model data, nol perubahan `resolve.ts`, nol perubahan editor.**
Itulah yang dibeli oleh fondasi slice ini. Urutan pengerjaan bebas; `02 Editorial Putih`
adalah kandidat pertama yang baik karena paling jauh secara visual dari Tropis Hangat
dan karenanya paling cepat membongkar asumsi yang tanpa sadar tertanam.

---

## 20. Keputusan yang tercatat

| Keputusan | Alasan |
|---|---|
| Palet = CSS custom property, bukan objek JS | Inline style mematikan responsive dan state interaktif |
| Token dinamai per **peran**, bukan terang-gelap | Satu-satunya cara palet gelap bisa dipasang ke layout terang |
| Font ikut **tema**, bukan palet | Pasangan font adalah identitas layout; kalau ikut palet, lahir kombinasi yang tak pernah dirancang |
| Akses lokasi dilebur ke blok `location` | Di desain ia berada di dalam section Lokasi; blok terpisah = dua panel untuk satu section |
| Masterplan memakai media yang ada | `floor_plan` + `houseTypeId === null` sudah cukup; tanpa field baru |
| Tidak satu pun field baru diisi AI | Semuanya klaim faktual; testimoni fabrikasi adalah penipuan |
| `stats.value` bertipe `string` | Desain menampilkan "40+" dan "12.000" |
| Form kontak menempati blok penutup | Pipeline lead sudah jalan; menghapusnya demi kesetiaan visual = kemunduran fungsi |
| Tim marketing = satu agen | Multi-agen di luar scope MVP |
| Tema `wireframe` dihapus | Kerja mati; TypeScript memaksanya mengimplementasi 3 blok baru |
| Legalitas "SHM" tidak disalin dari desain | Klaim hukum yang belum tentu benar untuk unit mana pun |
| Jam operasional footer dilewati | Tidak ada fieldnya; baris paling tidak bernilai vs biaya Time to Publish |

---

## 21. Diketahui belum terjawab

Tidak ada yang memblokir slice ini.

1. **Jam operasional agen** — bila kelak diinginkan di footer, `AgentProfile.officeHours`
   adalah tempatnya, plus satu isian di Settings → Profil.
2. **Caption media** — `Media` tidak punya field caption; galeri di semua 10 desain
   menampilkannya. Tambahkan `Media.caption` bila galeri terasa telanjang.
3. **Deskripsi per fasilitas** — `project.facilities: string[]` hanya nama. Naik ke
   `{ name, desc, mediaId }[]` bila kartu fasilitas terasa kosong.
4. **Legenda masterplan** — butuh pemetaan cluster→warna yang belum ada model datanya.
5. **Foto per fasilitas** — pipeline media selalu mengikat aset ke `projectId`, jadi
   secara teknis mungkin; yang belum ada adalah cara menautkan satu media ke satu
   nama fasilitas.
