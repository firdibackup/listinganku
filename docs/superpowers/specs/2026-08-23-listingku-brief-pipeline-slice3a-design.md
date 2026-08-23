# Design — Listingku Slice 3A: pipeline brief (Content Planner → AI → landing)

> Status: disetujui 2026-08-23 (isi desain dan file spec).
> Spec ini sengaja berdiri sendiri — tidak ada konteks percakapan yang dibutuhkan
> untuk mengeksekusinya di device lain.

---

## 1. Tujuan & posisi slice ini

Slice 1 menutup alur end-to-end (Login → Project → Tipe Rumah → AI → Editor →
Publish). Slice 2 membangun sistem tema dan sepuluh tema penuh. Keduanya
meninggalkan satu cacat alur yang baru terlihat setelah landing-nya jadi bagus:

**Agen tidak punya tempat untuk menaruh bahan mentahnya sebelum AI jalan.**

Akibatnya alurnya berbunyi `Input tipis → AI menebak → agen membangun ulang
halaman di editor` — kebalikan dari janji produknya. Slice ini membalik arahnya
menjadi `Input kaya → AI menyusun → editor hanya merapikan`.

### Yang masuk slice ini (3A)

- `Project.projectType` + `Project.brief` (JSONB) sebagai wadah bahan mentah.
- Preset section deterministik per tipe project.
- Lokasi terstruktur: dataset wilayah offline + `/api/places` + combobox.
- Wizard step 1 dirombak, step 2 menjadi **Materi landing page** (Content Planner).
- `GenerateInput` menerima `brief`; `AiContentSchema` bertambah `subheadline` + `cta`.
- `resolve()` menyisipkan brief ke rantai `pick()` — fakta di atas AI, copy di bawah AI.

### Yang ditunda ke 3B

- Tab **Materi** di halaman detail project (materi berat: foto per fasilitas,
  masterplan, site plan, peta).
- `MediaType` += `site_plan`, `location_map`.
- `BlockType` += `about` beserta sepuluh komponen temanya.
- Label CTA sebagai data + `ctaGoals` yang mengubah tombol mana yang tampil.

### Properti yang menentukan batas slice ini

**3A tidak menyentuh satu pun file di `lib/landing/themes/`.** Sepuluh tema yang
baru selesai diaudit kontras (2026-08-23) tidak ikut bergerak. Setiap keputusan
di §5 dan §6 dipilih untuk mempertahankan properti ini; kalau plan implementasi
sampai membuka file tema, plan-nya menyimpang dari spec.

---

## 2. Masalah yang diperbaiki — temuan di kode, bukan dugaan

Sebagian besar yang tampak seperti "fitur baru" ternyata sudah ada di
`lib/landing/blocks.ts` dan sudah bisa disunting di editor:

| Kebutuhan | Sudah ada |
|---|---|
| Fasilitas custom + keterangan | `FacilitiesBlock.items: { name, desc }[]` |
| "Dekat dengan apa" + waktu tempuh | `LocationBlock.access: { time, place }[]` |
| Promo terstruktur | `PricePromoBlock { dpText, installmentText, promos[], note }` |
| Masterplan terpisah dari denah tipe | `FloorPlansBlock.masterplan` + `legend[]` |
| Keunggulan terpisah dari fasilitas | `HighlightsBlock.items: { title, desc }[]` |
| Section schema `{ type, props, settings }` | `BlockBase<T, P> { id, type, enabled, variant?, props }` |

Yang benar-benar bolong ada empat:

1. **Semua materi itu hanya bisa diisi setelah generate AI, di editor.** Itulah
   sumber keluhan "agen membangun ulang halaman".
2. **AI tidak pernah melihatnya.** `GenerateInput = { project, houseTypes }` —
   AI hanya menerima nama, `location` sebagai string, `description`, dan
   `facilities: string[]`. Nearby, promo, dan keterangan fasilitas tak terlihat.
   Karena itu copy-nya generik, dan karena itu pula AI *bisa* mengarang jarak.
3. **`location` masih `string` telanjang** — tidak bisa dipakai SEO/schema/peta.
4. **Fakta dan copy tinggal di tempat yang sama.** Semantik `blocks[].props`
   sudah terlanjur "override AI": terisi = matikan AI untuk field itu. Kalau
   wizard menulis fakta ke sana, mengetik fakta = mematikan AI diam-diam, dan
   tombol "Use AI suggestion" jadi bohong.

Temuan sampingan yang ikut ditambal di 3B: **`aiContent.description` ("deskripsi
300+ kata yang menjual") di-generate lalu dibuang** — hanya dipakai meta SEO di
`lib/landing/seo.ts:15`, tidak pernah tampil di halaman, karena tidak ada blok
yang merendernya.

---

## 3. Enam keputusan yang mengunci bentuk pekerjaan

| # | Keputusan | Ditolak |
|---|---|---|
| 3.1 | Materi dibagi: ringan di wizard, berat di halaman detail (3B) | Semua di step 2; step 2 hanya memilih section |
| 3.2 | Fakta disimpan di `project.brief` terpisah dari `blocks[].props` | Menulis langsung ke `blocks[].props` |
| 3.3 | Autocomplete lokasi dari dataset administratif offline + nama kawasan bebas | Google Places; Nominatim/OSM |
| 3.4 | Rekomendasi section = preset deterministik per tipe project | Panggilan AI kedua; tanpa rekomendasi |
| 3.5 | Satu `BlockType` baru (`about`), dan itu pun di 3B | Nol blok baru; `about` + `sitePlan` |
| 3.6 | Dipecah dua slice: pipeline (3A) lalu kedalaman (3B) | Satu spec; tiga slice |

Alasan lengkap tiap penolakan ada di §16.

---

## 4. Model data

### 4.1 Dua field baru di `projects`

```ts
// lib/data/types.ts
export type ProjectType = 'perumahan' | 'apartemen' | 'ruko' | 'kavling' | 'villa';

export interface Project {
  // ...yang sudah ada
  projectType: ProjectType | null;
  location: string;      // TETAP — kini string tampilan turunan
  brief: ProjectBrief;   // JSONB
}
```

`projectType` sengaja **di luar** `brief`: dipakai memilih preset section,
ditampilkan di kartu project, dan nanti jadi filter dashboard. Mengubur atribut
yang perlu dibaca daftar ke dalam blob JSONB menyusahkan tanpa imbalan.

`project.location` **dipertahankan apa adanya.** Semua kode yang ada
(`hero.subtitle`, `lib/landing/seo.ts`, JSON-LD) terus jalan tanpa disentuh.
Bedanya kini dia string turunan yang dirakit dari `brief.location`
(`"Gading Serpong, Kelapa Dua, Kabupaten Tangerang"`), masih boleh disunting manual.

### 4.2 `ProjectBrief`

```ts
// lib/data/types.ts
export type NearbyCategory =
  | 'tol' | 'sekolah' | 'mall' | 'rumahSakit'
  | 'stasiun' | 'bandara' | 'pusatBisnis' | 'lainnya';

export type HeroEmphasis = 'promo' | 'lokasi' | 'konsep' | 'harga';
export type CtaGoal = 'whatsapp' | 'lihatTipe' | 'lihatPromo' | 'form';

export interface LocationDetail {
  /** Nama kawasan, diketik bebas: "Gading Serpong". Boleh kosong. */
  area: string;
  district: string;   // kecamatan — dari dataset
  city: string;       // kota/kabupaten — dari dataset
  province: string;   // dari dataset
  /**
   * Alamat jalan lengkap, opsional, diisi di panel Lokasi step 2:
   * "Jl. Boulevard Raya, Kelapa Gading, Jakarta Utara 14240".
   * Dataset administratif berhenti di kecamatan, jadi ini satu-satunya tempat
   * alamat presisi bisa hidup. Seed Parkspring memindahkan
   * `blocks.location.props.address` ke sini.
   */
  address: string;
}

export interface NearbyItem {
  category: NearbyCategory;
  name: string;              // "Tol Jakarta–Merak"
  /** null = agen tidak tahu. Lihat §6.2 — null TIDAK PUNYA cara jadi angka. */
  minutes: number | null;
}

export interface BriefFacility {
  name: string;
  desc: string;
  /** Diisi di 3B. Di 3A selalu []. */
  mediaIds: string[];
}

export interface BriefPromo {
  /** Nama promo utama. Bahan AI untuk CTA ("Dapatkan Free BPHTB"), tidak dirender. */
  name: string;                 // "Free BPHTB"
  /**
   * Butir promo yang TAMPIL di halaman, satu baris per butir. Sebuah project
   * lazimnya punya beberapa (seed Parkspring punya empat), jadi ini array —
   * bukan satu string yang diturunkan dari `name`.
   */
  items: string[];
  detail: string;               // catatan di bawah daftar
  validUntil: string | null;    // ISO date, contoh "2026-09-30"
  dpText: string;               // "10%" atau "Rp 200 jt"
  installmentText: string;      // "Rp 18 jt/bln"
}

export interface ProjectBrief {
  version: 1;
  location: LocationDetail | null;
  nearby: NearbyItem[];
  highlights: string[];
  facilities: BriefFacility[];
  promo: BriefPromo | null;
  heroEmphasis: HeroEmphasis | null;
  ctaGoals: CtaGoal[];
  /** Materi bebas per section. Bahan AI, tidak pernah dirender langsung. */
  notes: Partial<Record<BlockType, string>>;
}

export function emptyBrief(): ProjectBrief {
  return {
    version: 1, location: null, nearby: [], highlights: [],
    facilities: [], promo: null, heroEmphasis: null, ctaGoals: [], notes: {},
  };
}
```

Tiga keputusan yang tertanam di bentuk ini:

**`minutes: number | null`, bukan string.** Ini yang menegakkan aturan "AI tidak
boleh mengarang jarak" secara struktural, bukan lewat imbauan di prompt: kalau
agen tidak tahu waktu tempuhnya nilainya `null`, dan `null` tidak punya cara jadi
angka. Lihat §6.2.

**`notes` berkunci `BlockType`.** Materi bebas per section tidak menjadi belasan
field baru — satu peta, kuncinya tipe blok yang sudah ada. Menambah section baru
tidak pernah menambah kolom.

**`version: 1`.** Pintu migrasi untuk JSONB, dibaca sebelum apa pun yang lain.

### 4.3 `project.facilities` tetap hidup

`Project.facilities: string[]` **tidak dihapus**. Action penyimpan brief
menyinkronkannya: `project.facilities = brief.facilities.map(f => f.name)`.
Tanpa ini `lib/landing/seo.ts` dan rantai fallback `facilities` yang sudah ada
patah, dan seluruh seed lama jadi tidak valid.

### 4.4 Zod

`lib/schemas/project.ts` bertambah `ProjectBriefSchema` (cermin persis tipe di
atas) dan `ProjectDraftSchema` bertambah `projectType` opsional + `brief` opsional.
`ProjectPublishSchema` **tidak** menuntut brief — brief kosong tidak boleh
memblokir publish (§9.4).

---

## 5. Rantai resolve — fakta di atas AI, copy di bawah AI

Garis pemisahnya: **fakta = data yang jadi salah kalau diubah. Copy = kalimat
yang boleh diperbaiki.**

| Blok / field | Rantai | Jenis |
|---|---|---|
| `location.access` | `props` → **`brief.nearby`** → `[]` | fakta |
| `facilities.items` | `props` → **`brief.facilities`** → `project.facilities` | fakta |
| `pricePromo.dpText` | `props` → **`brief.promo.dpText`** → `''` | fakta |
| `pricePromo.installmentText` | `props` → **`brief.promo.installmentText`** → `''` | fakta |
| `pricePromo.promos` | `props` → **`brief.promo.items`** → `[]` | fakta |
| `pricePromo.note` | `props` → **komposisi dari brief.promo** → `''` | fakta |
| `location.address` | `props` → **`brief.location.address`** → `project.location` | fakta |
| `testimonials.items` | `props` → `[]` — tanpa AI, seperti sekarang | fakta |
| `hero.title` | `props` → `ai.headline` → `project.name` | copy |
| `hero.subtitle` | `props` → **`ai.subheadline`** → `project.location` | copy |
| `hero.defaultMessage` | `props` → **`ai.cta.whatsappMessage`** → template lama | copy |
| `agentCta.defaultMessage` | `props` → **`ai.cta.whatsappMessage`** → template lama | copy |
| `highlights.items` | `props` → `ai.sellingPoints` → **`brief.highlights`** → `[]` | copy |
| `faq.items` | `props` → `ai.faq` → `[]` | copy |

`highlights` ada di sisi **copy** — brief di *bawah* AI, bukan di atas. "Bebas
banjir" adalah klaim yang perlu dirangkai, bukan angka yang harus dipertahankan:
agen menulis mentah, AI merapikan, dan tulisan mentah agen tetap jadi jaring
pengaman kalau AI gagal atau dilewati. Itu persis janji produknya — agen bukan
copywriter.

### 5.1 `pick()` digeneralisasi, bukan diganti

`pick(override, ai, fallback)` sekarang punya rantai empat lapis di `highlights`.
Tambahkan `pickFirst<T>(...candidates: (T | undefined)[]): T` dengan logika
`isAbsent` yang **sama persis**, lalu biarkan `pick` menjadi pembungkus tiga
argumen di atasnya. Semua call site lama tidak berubah.

### 5.2 Komposisi yang tidak sepele

```ts
// access — HANYA yang punya menit. Lihat §5.3.
access: brief.nearby
  .filter((n) => n.minutes !== null)
  .map((n) => ({ time: `${n.minutes} mnt`, place: n.name }))

// pricePromo.note — detail + masa berlaku
note: [
  brief.promo.detail,
  brief.promo.validUntil ? `Berlaku sampai ${formatDateLong(brief.promo.validUntil)}` : '',
].filter(Boolean).join(' · ')
// -> "Gratis BPHTB untuk unit tertentu · Berlaku sampai 30 September 2026"
```

**`"mnt"`, bukan `"menit"`.** Seed Parkspring memakai `time: '3 mnt'` — disalin
dari `design/project/10 Tropis Hangat.dc.html`. Memakai "menit" akan membuat render
seed berbeda (melanggar §12.2) dan memanjangkan string di kartu akses yang sempit
di lebar 390px.

**`formatDateLong()` sudah ada** di `lib/format.ts` dan menghasilkan persis
`"30 September 2026"` (memakai getter UTC, konsisten dengan formatter lain di sana
supaya SSR dan hidrasi tidak berbeda). Tidak perlu helper baru.

Satu ketelitian pada baris `hero.defaultMessage` di tabel §5: "props" di situ
berarti **props milik blok `agentCta`**, bukan props hero. `resolve()` hari ini
memang membaca `ctaProps` dari blok `agentCta` untuk mengisi hero
(`lib/landing/resolve.ts` — `const ctaProps = byId('agentCta')?.props`), supaya
nomor dan pesan WhatsApp tidak perlu diketik dua kali. Perilaku itu dipertahankan.

### 5.3 Nearby tanpa waktu tempuh tidak menjadi kartu akses

`lib/landing/themes/tropicalWarm/Location.tsx:26` merender `a.time` di div-nya
sendiri; `time: ''` menghasilkan kartu akses tanpa waktu di sepuluh tema.

Keputusan: **item tanpa `minutes` tidak masuk `access`.** Blok itu secara harfiah
kartu waktu — kartu waktu tanpa waktu adalah kartu rusak. Alternatifnya sepuluh
suntingan penjaga di sepuluh `Location.tsx`, yang melanggar properti §1.

Item itu **tidak hilang**: tetap dikirim ke AI sebagai konteks ("dekat Sekolah
XYZ"), jadi tetap muncul di kalimat. Planner memberi tahu ini di tempat (§9.2),
sekaligus mengajarkan perilaku yang benar — isi menitnya.

### 5.4 Label CTA tetap milik tema

Label CTA hardcoded per tema **dan berbeda per posisi**: `tropicalWarm/Hero.tsx:44`
berbunyi "Hubungi Marketing", `tropicalWarm/AgentCta.tsx:27` berbunyi "WhatsApp",
premiumDark punya kata-katanya sendiri. Semuanya hasil transkrip 1:1 dari file
desain masing-masing.

Di 3A `ctaGoals` **tetap dikumpulkan dan tetap dikirim ke AI** — jadi headline dan
pesan WhatsApp diarahkan ke tujuan yang benar — tapi yang menjadi data hanya
**pesan WhatsApp default**, yang memang sudah berupa data hari ini. Nol suntingan
tema. Label CTA dan `ctaGoals` yang mengubah tombol mana yang tampil adalah
pertanyaan struktural, sepaket dengan pekerjaan tema di 3B.

---

## 6. Kontrak AI & grounding

### 6.1 Perubahan kontrak

```ts
// lib/ai/generator.ts
export interface GenerateInput {
  project: Project;
  houseTypes: HouseType[];
  brief: ProjectBrief;   // baru
  delayMs?: number;
  forceFail?: boolean;
}

// lib/ai/schema.ts — AiContentSchema bertambah
subheadline: z.string().min(1),
cta: z.object({ whatsappMessage: z.string().min(1) }),
```

`ProjectAiContent` di `lib/data/types.ts` ikut bertambah dua field yang sama.
Pembacaan wajib toleran terhadap `aiContent` lama yang belum punya keduanya
(`ai?.subheadline` sudah `undefined`-safe lewat `pick`).

`lib/ai/mock.ts` **wajib ikut membaca brief** — kalau tidak, e2e "halaman publik
memuat nearby dan promo yang diketik agen" lolos tanpa membuktikan apa pun.
Mock menurunkan `headline` dari `brief.location.area`, `sellingPoints` dari
`brief.highlights` + nama fasilitas, dan `cta.whatsappMessage` dari `ctaGoals`,
semuanya deterministik.

### 6.2 Grounding ditegakkan di lapisan render, bukan di prompt

Bagian terpenting dari desain ini. Aturan "AI tidak boleh mengarang jarak" tidak
dititipkan ke prompt. Tiga penjaga struktural:

1. `minutes: number | null` — tidak ada field untuk dikarang ke dalamnya.
2. `resolve()` untuk `access`, `facilities`, dan `pricePromo` **tidak pernah
   membaca `ai.*`** (§5). Model yang berhalusinasi sekalipun tidak punya jalur
   ke angka di halaman.
3. `AiContentSchema` tidak punya satu pun field angka. AI hanya mengembalikan prosa.

Aturan di prompt tetap ditulis, sebagai lapis kedua:

> Gunakan hanya fakta yang ada di `brief` dan `houseTypes`. Jangan menyebut angka,
> jarak, waktu tempuh, harga, atau nama tempat yang tidak ada di sana. Jika
> `minutes` bernilai null, sebut tempatnya tanpa angka.

---

## 7. Preset section per tipe project

```ts
// lib/landing/sectionPreset.ts
export const SECTION_PRESET: Record<ProjectType, BlockType[]>;
```

Isi (yang **menyala**; sisanya mati):

| Tipe | Menyala |
|---|---|
| perumahan | hero, highlights, houseTypes, facilities, location, floorPlans, gallery, pricePromo, developer, faq, agentCta, contactForm |
| apartemen | + specs; sisanya sama dengan perumahan |
| ruko | hero, highlights, houseTypes, specs, location, pricePromo, floorPlans, gallery, developer, faq, agentCta, contactForm (tanpa facilities) |
| kavling | hero, highlights, location, floorPlans, gallery, pricePromo, developer, faq, agentCta, contactForm (tanpa houseTypes, specs, facilities) |
| villa | identik dengan perumahan |

`villa` **sengaja** punya preset yang identik dengan `perumahan` — section yang
dibutuhkan memang sama. Tipenya tetap ada karena `projectType` bukan hanya kunci
preset: dia ikut dikirim ke AI sebagai konteks (copy villa berbeda nada dari copy
perumahan) dan tampil di kartu project. Preset yang kebetulan sama bukan alasan
menggabungkan dua tipe yang berbeda di mata agen.

`testimonials` **selalu mati** di semua preset. Testimoni tidak boleh datang dari
AI (sudah ditegakkan di `resolve()`), jadi menyalakannya secara default hanya
menyodorkan section kosong sampai agen mengisinya sendiri.

Preset **hanya menyentuh flag `enabled`.** Urutan tetap milik tema
(`BLOCK_ORDER_BY_THEME`) — aturan yang sudah ditegakkan sejak slice 2 dan tidak
dibuka ulang di sini.

### 7.1 Kapan preset diterapkan

- Otomatis saat **step 1 disimpan**, karena di situlah `projectType` baru diketahui.
- Step 2 menampilkan hasilnya. Tombol **"Gunakan rekomendasi"** tetap ada persis
  seperti sketsa council dan berfungsi sebagai *pulihkan* setelah agen mengubah-ubah.
- Kalau agen kembali ke step 1 dan **mengganti** `projectType`, preset baru
  ditawarkan lewat **konfirmasi**, tidak diterapkan diam-diam — pola yang sama
  dengan "Terapkan urutan bawaan tema ini?" di editor. Menimpa suntingan manual
  agen tanpa bertanya adalah cacat yang sudah pernah diperbaiki di `applyThemeOrder`.

---

## 8. Step 1 — Basic info

| Field | Bentuk | Catatan |
|---|---|---|
| Nama project | Input, wajib | placeholder `Contoh: ParkSpring Gading` |
| Tipe project | Chip pilih-satu | perumahan · apartemen · ruko & komersial · kavling · villa |
| Lokasi | `LocationCombobox` (§11) | menulis `brief.location` + menurunkan `project.location` |
| Developer | Input + `<datalist>` | sumber: developer dari project user sendiri |
| Ceritakan singkat tentang project ini | Textarea 3 baris | → `project.description` |

Helper di bawah textarea: *Tidak perlu membuat copywriting. Tulis informasi
seadanya, kami yang menyusunnya jadi copy marketing.*

Developer memakai `<datalist>` bawaan browser, bukan komponen: nilainya satu baris
dan sumbernya project user sendiri — tidak sepadan dengan biaya combobox kustom.
Combobox kustom hanya untuk lokasi, yang butuh tampilan dua baris.

Seluruh copy tunduk pada aturan DS: **Anda** formal, **kami**, sentence case,
tanpa emoji, tanpa tanda seru, angka gaya Indonesia.

---

## 9. Step 2 — Materi landing page

Judul layar: **Materi landing page**. Lead: *Beritahu kami apa yang Anda punya.
Kami yang menyusunnya menjadi landing page.*

### 9.1 Bentuk

Satu daftar baris section. Tiap baris: checkbox aktif · label · ringkasan materi ·
chevron. **Terkuncup semua secara default** — panel materi hanya muncul saat baris
diklik (progressive disclosure). Di atas daftar: tombol **Gunakan rekomendasi**.

Di bawah daftar: ringkasan **Materi yang Anda punya** — lokasi, jumlah nearby,
jumlah keunggulan, jumlah fasilitas, ada/tidak promo — plus satu baris yang
menunjuk ke depan: *Foto diunggah di halaman project.*

### 9.2 Panel materi (lima section)

| Section | Isi panel |
|---|---|
| Hero | penekanan (radio: promo · lokasi · konsep · harga) + tujuan CTA (checkbox, multi) |
| Keunggulan | daftar baris bebas, tambah/hapus |
| Fasilitas | chip preset (`FACILITY_OPTIONS`) + tambah fasilitas (nama + keterangan) |
| Lokasi | ringkasan lokasi step 1 (baca saja) + nearby (kategori · nama · menit) + tempel URL peta |
| Promo | ada promo? + nama · detail · berlaku sampai · DP · cicilan |

Panel Lokasi menampilkan hint di baris nearby yang menitnya kosong: *Tanpa waktu
tempuh, tempat ini menjadi bahan tulisan, tidak tampil sebagai kartu akses.*
(§5.3.)

### 9.3 Sembilan section lain

Hanya on/off **plus satu baris catatan bebas** yang tersimpan ke
`notes[blockType]`. Itu yang memberi setiap section bahan kontennya sendiri tanpa
membangun empat belas panel khusus.

### 9.4 Kosong tidak pernah memblokir

Setiap panel opsional. Step 3 menampilkan satu baris menenangkan: *Materi yang
kosong akan kami susun dari informasi yang ada.* Publish tidak pernah menuntut
brief — prinsip "AI tidak boleh memblokir publish" berlaku penuh untuk materi juga.

### 9.5 Batas yang sengaja — periksa plan terhadap ini

Step 2 **tidak punya**, dan tidak boleh tumbuh punya:

- reorder section (urutan milik tema),
- field copy per blok — tidak ada input "Hero Title" / "Hero Subtitle",
- apa pun yang menyentuh tampilan (warna, spasi, varian layout).

Begitu salah satunya muncul di plan implementasi, plan-nya menyimpang. Ini syarat
yang membedakan Content Planner dari page builder.

**"+ Tambah section" hanya membuka tipe blok yang preset-nya matikan** — bukan
section karangan sendiri. Tipe section betulan-baru butuh komponen renderer di
sepuluh tema, jadi tidak mungkin menjadi aksi di dalam wizard.

---

## 10. Step 3 — Review

Ringkasan yang sudah ada, ditambah: tipe project, lokasi terstruktur, jumlah
section aktif, dan ringkasan materi dari §9.1. Tombol tetap **Simpan project**.

---

## 11. Lokasi — dataset, endpoint, komponen

### 11.1 Dataset

`data/id-regions.json`, level **kecamatan**: ~38 provinsi / ~514 kota-kabupaten /
~7.300 kecamatan. Level kelurahan sengaja tidak diambil — ~83.000 baris, tidak
sepadan dengan manfaatnya.

Bentuk baris: `{ district, city, province }` (nama lengkap, tanpa kode wilayah —
kode tidak dipakai di mana pun di MVP).

**Pendensi eksternal:** dataset ini belum ada di repo. Sumber dan lisensinya harus
diputuskan sebelum implementasi. Tidak menghalangi item lain di slice ini.

### 11.2 Endpoint

`app/api/places/route.ts` — `GET /api/places?q=`. Normalisasi lowercase + tanpa
diakritik, cocok prefix lalu substring, maksimal 8 hasil.

Route ini membaca `request.url`, yang seharusnya sudah cukup membuatnya dinamis —
beda dari `sitemap.ts` yang tidak menyentuh API dinamis apa pun dan karena itu
butuh `force-dynamic`. **Wajib diverifikasi lewat tabel rute `next build`** (`ƒ`
dinamis vs `○` statis), bukan diasumsikan: `next dev` tidak akan pernah
menampakkan kesalahan ini karena dev selalu re-eksekusi tiap request.

### 11.3 Komponen

`components/wizard/LocationCombobox.tsx` — listbox inline yang ditulis sendiri
dengan pola ARIA combobox (`role="combobox"` + `aria-expanded` +
`aria-activedescendant`, listbox `position:absolute` di bawah input). **Bukan Radix
Popover**, karena dua alasan: `@radix-ui/react-popover` tidak terpasang (repo hanya
punya accordion, dialog, switch), dan Popover memindahkan fokus ke dalam
kontennya — kebalikan dari yang dibutuhkan combobox, yang menuntut fokus TETAP di
input supaya pengetikan berlanjut. Ini pengecualian yang beralasan terhadap
preferensi "ambil dari Radix": Radix tidak punya primitif combobox.

Dicat token DS, memakai `.ds-field__input` yang sama dengan `components/ds/Input.tsx`
supaya bentuk fieldnya identik dengan field lain di wizard.

Dua field, bukan satu: **nama kawasan** (bebas, "Gading Serpong") di atas hasil
administratif. Nama kawasan komersial bukan unit administratif dan tidak akan
pernah ada di dataset mana pun.

Debounce 200 ms di klien.

### 11.4 Yang tidak didapat

Tanpa provider berbayar tidak ada lat/lng, tidak ada "Pilih di Map", tidak ada
embed peta otomatis. `LocationBlock.mapUrl` tetap ditempel manual oleh agen,
seperti hari ini. Dibungkus interface `LocationProvider` supaya Google Places bisa
masuk belakangan tanpa menyentuh UI — pola yang sama dengan `getGenerator()` yang
menyiapkan tempat untuk Gemini.

---

## 12. Data & migrasi

### 12.1 `repairShape()` tidak menambal field baris

Sudah tercatat sebagai jebakan berulang: `repairShape()` hanya mengisi tabel level
atas yang hilang. Tabel yang ada tapi kosong, dan **field baris yang baru
ditambahkan**, tidak diperbaiki. Konsekuensi mengikat:

- Setiap pembacaan brief wajib `project.brief ?? emptyBrief()`.
- Setiap pembacaan tipe wajib `project.projectType ?? null`.
- `npm run seed:reset` **wajib** setelah `fixtures/seed.ts` berubah.
- Dev server memegang store di memori — ubah seed lalu refresh browser tidak cukup,
  restart dev server-nya.

### 12.2 Seed sebagai bukti rantainya jalan

`fixtures/seed.ts` hari ini menaruh access, fasilitas, dan promo Parkspring di
`blocks[].props`. Kalau brief hanya ditambahkan di sampingnya, `props` menang dan
rantai brief tidak pernah teruji.

Karena itu ketiganya **dipindahkan** dari `props` ke `brief`, dan halaman publik
wajib terender **identik** dengan sebelumnya. Kesepuluh tema bergantung pada
konten kanonik Parkspring (disalin dari `design/project/10 Tropis Hangat.dc.html`),
sehingga kemiripan render sebelum-sesudah menjadi tes rantai paling meyakinkan
yang bisa didapat tanpa biaya tambahan.

Verifikasi: papan `/preview` (sepuluh iframe berdampingan) sebelum dan sesudah.

---

## 13. Pengujian

### Unit (Vitest)

- `SECTION_PRESET` — satu tes per tipe project; `testimonials` mati di semuanya.
- **Rantai `resolve()` per field** — yang paling berharga di slice ini. Untuk tiap
  baris tabel §5: props menang; tanpa props, lapis kedua menang; tanpa keduanya,
  fallback. Khusus fakta: `ai.*` diisi nilai kontras dan **tidak boleh** muncul.
- `pickFirst()` — `isAbsent` identik dengan `pick` (string kosong, whitespace,
  array kosong dianggap absen).
- §5.3 — nearby ber-`minutes: null` tidak muncul di `access`, tapi muncul di
  payload yang dikirim ke generator.
- `ProjectBriefSchema` — tolak `minutes` string, terima `null`.
- Pencarian places — normalisasi diakritik, cap 8.

### Tes yang PASTI patah dan harus ikut diperbarui

Sudah diverifikasi lewat grep, bukan dugaan — merombak step 1 dan menamai ulang
step 2 mematahkan tiga file:

| File | Yang patah |
|---|---|
| `tests/unit/create-project-wizard.test.tsx` | enam asersi `'Fasilitas dan media'` (baris 53, 80, 86, 101, 111, 124) |
| `tests/e2e/spine.spec.ts` | `getByLabel('Lokasi').fill()` (18) — Lokasi jadi combobox; `getByLabel('Deskripsi')` (20, 89) — label berubah |
| `tests/unit/project-actions.test.ts` | aman, tapi tambahkan kasus `projectType` + `brief` |

`tests/e2e/editor.spec.ts:47-48` menyebut "Lokasi" juga, tapi itu **nama blok di
editor**, bukan field wizard — tidak terdampak.

### E2e (Playwright)

Satu alur penuh: wizard 3 langkah dengan materi terisi → generate → publish →
halaman publik memuat nearby dan promo yang diketik agen.

Aturan yang berlaku dan mudah dilanggar:
- `workers: 1`, satu mock store bersama.
- **Tanpa asersi bernilai absolut** — pakai `.first()` untuk kehadiran,
  `toBeGreaterThanOrEqual` untuk metrik yang hanya bertambah.
- `npm run seed:reset` sebelum run kalau store sudah termutasi.
- **Jangan menjalankan `npm run build` / `npm run verify` selagi `next dev` hidup**
  — `.next` rusak dan seluruh e2e timeout.
- `getByLabel` cocok substring; pakai `{ exact: true }` di layar yang punya
  "Nama" dan "Nama fasilitas" berdampingan.

---

## 14. Definisi selesai

- [ ] `projectType` + `brief` ada di tipe, Zod, repo, dan seed; pembacaan aman
      terhadap store lama.
- [ ] Preset section jalan, `testimonials` mati di semua tipe, urutan tetap milik tema.
- [ ] Ganti `projectType` di step 1 meminta konfirmasi sebelum menimpa section.
- [ ] Step 1 punya lima field §8; combobox lokasi jalan dari dataset offline.
- [ ] Step 2 terkuncup secara default, lima panel materi jalan, sembilan section
      lain punya baris catatan.
- [ ] Step 2 tidak punya reorder, tidak punya field copy per blok, tidak menyentuh
      tampilan.
- [ ] `GenerateInput.brief` terkirim; mock membacanya; `subheadline` + `cta` masuk
      `AiContentSchema` dan `ProjectAiContent`.
- [ ] Rantai §5 lengkap dan tertutup unit test, termasuk asersi bahwa `ai.*` tidak
      bisa masuk ke `access`/`facilities`/`pricePromo`.
- [ ] Seed Parkspring pindah ke brief dan `/preview` terender identik.
- [ ] Brief kosong tetap bisa publish.
- [ ] Nol file di `lib/landing/themes/` tersentuh.
- [ ] `npm run verify` hijau (dengan `next dev` mati).

---

## 15. Dekomposisi — slice 3B

Dikerjakan di atas 3A yang sudah terbukti jalan:

1. Tab **Materi** di halaman detail project — foto per fasilitas
   (`BriefFacility.mediaIds`), masterplan, site plan, peta, dan catatan panjang
   per section.
2. `MediaType` += `site_plan`, `location_map`; disalurkan ke blok `floorPlans` dan
   `location` yang sudah ada. Nol komponen tema baru.
3. `BlockType` += `about` — `{ title?, body?, mediaId? }`, rantai
   `props.body → ai.description → brief.notes.about → project.description`.
   Sepuluh komponen tema + CSS + sepuluh entri `BLOCK_ORDER_BY_THEME`. Ini yang
   menambal `aiContent.description` yang sekarang terbuang (§2).
4. Label CTA sebagai data + `ctaGoals` yang menentukan tombol mana yang tampil —
   sepaket, karena keduanya menyentuh sepuluh tema.

---

## 16. Alternatif yang ditolak

**Menulis materi langsung ke `blocks[].props`** (alih-alih `brief` terpisah).
Tanpa field baru dan tanpa migrasi, dan apa yang diketik di wizard langsung
terlihat di editor. Ditolak karena semantik `props` sudah terlanjur "override AI":
setiap materi menjadi override permanen, regenerate tidak berefek, "Use AI
suggestion" jadi bohong, dan intent (penekanan hero, tujuan CTA) tidak punya
tempat tinggal karena bukan konten yang dirender.

**Google Places Autocomplete.** Persis sketsa council, lengkap dengan lat/lng dan
"Pilih di Map". Ditolak untuk MVP: menambah API key + billing ke daftar blocker
yang sudah ada, berbiaya per ketikan, dan menuntut mock di seluruh e2e.
`LocationProvider` menyiapkan tempatnya (§11.4).

**Nominatim/OpenStreetMap.** Gratis dan tanpa key, tapi ToS-nya melarang
autocomplete per-ketikan (maks 1 req/detik, wajib User-Agent identitas dan
atribusi). Polanya jadi tombol "Cari" eksplisit, dan cakupan Indonesia tidak
merata — UX-nya paling jauh dari sketsa.

**Panggilan AI kedua untuk merekomendasikan section.** Ditolak: menambah 5–15
detik tepat di tengah wizard (jalur North Star Time to Publish <10 menit),
menambah biaya per project, melanggar prinsip satu panggilan AI per Primary
Property, dan **tetap** menuntut preset deterministik sebagai fallback — jadi
pekerjaannya harus dikerjakan juga.

**Nol block type baru selamanya.** Paling murah, tapi halaman tetap tanpa satu pun
blok prosa dan `aiContent.description` tetap terbuang. `about` masuk 3B.

**`about` + `sitePlan` sebagai dua blok baru.** Paling setia ke pemisahan
fungsional Floor Plan / Site Plan / Masterplan / Location Map, tapi 20 komponen
tema baru — dan `floorPlans` sudah punya `masterplan` + `legend[]` yang menutupi
sebagian besar kebutuhannya.

**Satu spec untuk sebelas item.** Ditolak karena bagian akhir — blok `about` di
sepuluh tema — akan dikerjakan saat konteks paling penuh, pola yang sudah tercatat
sebagai penyebab cacat plan.

**Tiga slice (data / UI / tema).** Paling rapi secara sifat pekerjaan, tapi slice
data sendirian tidak menghasilkan apa pun yang bisa dilihat agen — brief-nya ada
tapi belum ada layar yang mengisinya, jadi baru terbukti benar setelah slice
berikutnya.

---

## 17. Diketahui belum terjawab

- **Sumber dan lisensi `data/id-regions.json`.** Satu-satunya blocker eksternal
  baru. Harus ditutup sebelum §11 dikerjakan; tidak menghalangi item lain.
- **Lat/lng dan "Pilih di Map"** — butuh provider berbayar. Tertunda sampai ada
  keputusan biaya.
- **Custom section type** (section karangan agen). Butuh renderer di sepuluh tema;
  council menandainya 🟠 Penting, bukan wajib.
- **Autocomplete developer lintas user** (master data developer). Sengaja tidak
  dibuat di MVP — autocomplete dari project user sendiri sudah cukup.
- **Apakah AI boleh mengisi `desc` fasilitas yang dikosongkan agen.** Di 3A tidak:
  fasilitas seluruhnya fakta. Bisa ditinjau ulang kalau hasilnya terasa kosong.
