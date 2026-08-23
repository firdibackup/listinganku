# Slice 3A — Pipeline Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memberi agen tempat untuk menaruh bahan mentahnya SEBELUM AI jalan, sehingga alurnya berubah dari `input tipis → AI menebak → agen membangun ulang halaman di editor` menjadi `input kaya → AI menyusun → editor merapikan`.

**Architecture:** Satu field JSONB baru `project.brief` menampung fakta + intent, terpisah dari `blocks[].props` yang semantiknya sudah "override AI". `resolve()` menyisipkan brief ke rantai `pick()` yang sudah ada dengan aturan **fakta di atas AI, copy di bawah AI**. Wizard step 2 berubah dari "Fasilitas dan media" menjadi Content Planner yang mengumpulkan brief; `GenerateInput` menerimanya sehingga AI berhenti menebak.

**Tech Stack:** Next.js 15 App Router · TypeScript · Zod 3 · Vitest 2 + Testing Library · Playwright 1.62 · mock data store (`.data/store.json`) · Tailwind v4 + token DS.

**Spec:** `docs/superpowers/specs/2026-08-23-listingku-brief-pipeline-slice3a-design.md`

## Global Constraints

Berlaku untuk SETIAP task. Tidak diulang di tiap task.

- **NOL file di `lib/landing/themes/` boleh tersentuh.** Kalau sebuah langkah menyuruh membuka file tema, langkah itu salah — hentikan dan laporkan.
- **Copy Bahasa Indonesia formal:** **Anda** (kapital), **kami**; tidak pernah *kamu*/*saya*. Sentence case. **Tanpa emoji, tanpa tanda seru.** Angka gaya Indonesia (`Rp 2,45 M`, `1,2jt`, `09.00 WIB`).
- **Setiap Server Action yang mengubah data wajib memverifikasi baris target milik user sesi** lewat `requireOwnedProject` sebelum menyentuh apa pun.
- **Action mengembalikan `ActionResult<T>`** (`{ok:true,data}` / `{ok:false,fieldErrors}`, error generik di key `_`), tidak pernah melempar. Seluruh badan dibungkus try/catch. Jangan `startTransition(() => void action(...))` — rejection-nya hilang diam-diam.
- **UI tidak pernah menyentuh sumber data** — selalu lewat `db` dari `@/lib/data`.
- **Jangan mengimpor barrel `@/lib/data` dari Edge runtime** — `lib/data/index.ts` menyentuh `node:fs` saat modul dimuat.
- **Jangan jalankan `npm run build` atau `npm run verify` selagi `next dev` hidup** — `.next` rusak dan SELURUH e2e timeout. Cek port 3000 dulu.
- **`npm run seed:reset` wajib** setiap kali `fixtures/seed.ts` berubah, dan sebelum e2e kalau store sudah termutasi.
- **Dev server memegang store di memori** — mengubah seed lalu me-refresh browser tidak cukup, restart dev server-nya.
- **E2e serial (`workers: 1`) di atas satu mock store bersama.** Jangan menulis asersi bernilai absolut; pakai `.first()` untuk kehadiran dan `toBeGreaterThanOrEqual` untuk metrik yang hanya bertambah.
- **CSS dikolokasi per folder komponen** (`components/wizard/wizard.css`), bukan di `styles/globals.css`.
- Jalankan unit test dengan `npx vitest run tests/unit/<file>` (bukan `npm test`, yang menjalankan seluruh suite).

---

## File Structure

**Dibuat:**

| File | Tanggung jawab |
|---|---|
| `lib/landing/sectionPreset.ts` | `SECTION_PRESET` per `ProjectType` + `applySectionPreset()` |
| `lib/places/regions.ts` | Muat dataset wilayah + `searchRegions()` |
| `data/id-regions.json` | Dataset wilayah (starter; diganti dataset penuh nanti) |
| `app/api/places/route.ts` | `GET /api/places?q=` |
| `components/wizard/LocationCombobox.tsx` | Combobox ARIA untuk lokasi |
| `components/wizard/SectionPlanner.tsx` | Daftar section step 2 + toggle + catatan |
| `components/wizard/panels/HeroPanel.tsx` | Penekanan hero + tujuan CTA |
| `components/wizard/panels/HighlightsPanel.tsx` | Daftar keunggulan |
| `components/wizard/panels/FacilitiesPanel.tsx` | Chip preset + fasilitas custom |
| `components/wizard/panels/LocationPanel.tsx` | Alamat + nearby |
| `components/wizard/panels/PromoPanel.tsx` | Promo terstruktur |

**Diubah:** `lib/data/types.ts` · `lib/data/repo.ts` · `lib/data/mock/repos.ts` · `lib/data/mock/snapshot.ts` · `lib/schemas/project.ts` · `lib/schemas/index.ts` · `lib/landing/resolve.ts` · `lib/ai/{schema,generator,mock}.ts` · `app/(dashboard)/projects/actions.ts` · `app/(dashboard)/projects/[id]/generate/actions.ts` · `app/(dashboard)/projects/new/page.tsx` · `components/wizard/CreateProjectWizard.tsx` · `components/wizard/wizard.css` · `fixtures/seed.ts`

**Tes:** `tests/unit/brief-schema.test.ts` · `brief-store.test.ts` · `brief-resolve.test.ts` · `section-preset.test.ts` · `places.test.ts` · `places-route.test.ts` · `location-combobox.test.tsx` · `section-planner.test.tsx` · `material-panels.test.tsx` · (ubah) `create-project-wizard.test.tsx` · `ai-mock.test.ts` · `tests/e2e/brief-pipeline.spec.ts` · (ubah) `tests/e2e/spine.spec.ts`

---

### Task 1: Tipe brief + skema Zod

**Files:**
- Modify: `lib/data/types.ts` (tambah tipe; `Project` baris 59–77; `ProjectAiContent` baris 21–28)
- Modify: `lib/schemas/project.ts`
- Modify: `lib/schemas/index.ts`
- Test: `tests/unit/brief-schema.test.ts`

**Interfaces:**
- Consumes: `BlockType` dari `@/lib/landing/blocks` (sudah ada).
- Produces: `ProjectType`, `NearbyCategory`, `HeroEmphasis`, `CtaGoal`, `LocationDetail`, `NearbyItem`, `BriefFacility`, `BriefPromo`, `ProjectBrief`, `emptyBrief()` dari `@/lib/data/types`. `ProjectBriefSchema`, `PROJECT_TYPES`, `PROJECT_TYPE_LABELS`, `NEARBY_CATEGORIES`, `NEARBY_CATEGORY_LABELS` dari `@/lib/schemas`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/brief-schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ProjectBriefSchema, PROJECT_TYPE_LABELS, NEARBY_CATEGORY_LABELS } from '@/lib/schemas';
import { emptyBrief } from '@/lib/data/types';

describe('ProjectBriefSchema', () => {
  it('menerima brief kosong dari emptyBrief()', () => {
    expect(ProjectBriefSchema.safeParse(emptyBrief()).success).toBe(true);
  });

  it('menerima minutes null — agen yang tidak tahu waktu tempuh bukan error', () => {
    const brief = { ...emptyBrief(), nearby: [{ category: 'tol' as const, name: 'Tol Kelapa Gading', minutes: null }] };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(true);
  });

  it('MENOLAK minutes berupa string — ini penjaga anti-halusinasi, bukan sekadar tipe', () => {
    const brief = { ...emptyBrief(), nearby: [{ category: 'tol', name: 'Tol', minutes: '5 menit' }] };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(false);
  });

  it('menolak kategori nearby di luar daftar', () => {
    const brief = { ...emptyBrief(), nearby: [{ category: 'pantai', name: 'Ancol', minutes: 20 }] };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(false);
  });

  it('notes hanya menerima kunci BlockType yang sah', () => {
    expect(ProjectBriefSchema.safeParse({ ...emptyBrief(), notes: { gallery: 'lima foto drone' } }).success).toBe(true);
    expect(ProjectBriefSchema.safeParse({ ...emptyBrief(), notes: { bukanBlok: 'x' } }).success).toBe(false);
  });

  it('promo.items adalah array — satu project lazimnya punya beberapa butir promo', () => {
    const brief = {
      ...emptyBrief(),
      promo: {
        name: 'Free BPHTB', items: ['Free BPHTB dan AJB', 'Cashback 5%'],
        detail: 'Selama unit tersedia.', validUntil: null, dpText: '10%', installmentText: 'Rp 18 jt/bln',
      },
    };
    expect(ProjectBriefSchema.safeParse(brief).success).toBe(true);
  });

  it('setiap ProjectType punya label untuk ditampilkan', () => {
    expect(Object.keys(PROJECT_TYPE_LABELS)).toEqual(['perumahan', 'apartemen', 'ruko', 'kavling', 'villa']);
  });

  it('setiap NearbyCategory punya label', () => {
    expect(Object.keys(NEARBY_CATEGORY_LABELS)).toHaveLength(8);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/brief-schema.test.ts`
Expected: FAIL — `ProjectBriefSchema`, `PROJECT_TYPE_LABELS`, `NEARBY_CATEGORY_LABELS`, dan `emptyBrief` belum diekspor.

- [ ] **Step 3: Tambahkan tipe di `lib/data/types.ts`**

Ubah import di baris 1 agar `BlockType` ikut terbawa:

```ts
import type { Block, BlockType } from '@/lib/landing/blocks';
```

Sisipkan SETELAH `export interface HouseTypeAiContent { ... }` (sekitar baris 32), sebelum `AgentProfile`:

```ts
export type ProjectType = 'perumahan' | 'apartemen' | 'ruko' | 'kavling' | 'villa';

export type NearbyCategory =
  | 'tol' | 'sekolah' | 'mall' | 'rumahSakit'
  | 'stasiun' | 'bandara' | 'pusatBisnis' | 'lainnya';

export type HeroEmphasis = 'promo' | 'lokasi' | 'konsep' | 'harga';
export type CtaGoal = 'whatsapp' | 'lihatTipe' | 'lihatPromo' | 'form';

export interface LocationDetail {
  /** Nama kawasan, diketik bebas: "Gading Serpong". Bukan unit administratif. */
  area: string;
  district: string;
  city: string;
  province: string;
  /** Alamat jalan lengkap, opsional. Dataset administratif berhenti di kecamatan. */
  address: string;
}

export interface NearbyItem {
  category: NearbyCategory;
  name: string;
  /**
   * null = agen tidak tahu. TIDAK PUNYA cara jadi angka — inilah penjaga
   * struktural yang membuat AI tidak bisa mengarang jarak. Item ber-minutes
   * null tetap dikirim ke AI sebagai konteks tapi tidak dirender sebagai
   * kartu akses (lihat resolve.ts).
   */
  minutes: number | null;
}

export interface BriefFacility {
  name: string;
  desc: string;
  /** Diisi di slice 3B. Di 3A selalu []. */
  mediaIds: string[];
}

export interface BriefPromo {
  /** Bahan AI untuk CTA. Tidak dirender langsung. */
  name: string;
  /** Butir promo yang TAMPIL di halaman, satu baris per butir. */
  items: string[];
  detail: string;
  validUntil: string | null;
  dpText: string;
  installmentText: string;
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

/**
 * repairShape() tidak menambal field BARIS yang baru ditambahkan, jadi snapshot
 * lama membawa `brief: undefined`. Setiap pembacaan brief wajib lewat fungsi ini.
 */
export function emptyBrief(): ProjectBrief {
  return {
    version: 1, location: null, nearby: [], highlights: [],
    facilities: [], promo: null, heroEmphasis: null, ctaGoals: [], notes: {},
  };
}
```

Tambahkan dua field ke `interface Project` (setelah `facilities: string[];`):

```ts
  projectType: ProjectType | null;
  brief: ProjectBrief;
```

Tambahkan dua field ke `interface ProjectAiContent` (setelah `headline: string;`):

```ts
  /** Kalimat pemasaran di bawah judul hero. Opsional: aiContent lama tidak punya. */
  subheadline?: string;
  /** Wording CTA dari AI. Hanya pesan WhatsApp yang jadi data di 3A. */
  cta?: { whatsappMessage: string };
```

- [ ] **Step 4: Tambahkan skema Zod di `lib/schemas/project.ts`**

Tambahkan import di puncak file dan konstanta di bawah `FACILITY_OPTIONS`:

```ts
import { BLOCK_LABELS } from '@/lib/landing/blocks';
import type { NearbyCategory, ProjectType } from '@/lib/data/types';

export const PROJECT_TYPES = ['perumahan', 'apartemen', 'ruko', 'kavling', 'villa'] as const;

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  perumahan: 'Perumahan',
  apartemen: 'Apartemen',
  ruko: 'Ruko & komersial',
  kavling: 'Kavling',
  villa: 'Villa',
};

export const NEARBY_CATEGORIES = [
  'tol', 'sekolah', 'mall', 'rumahSakit', 'stasiun', 'bandara', 'pusatBisnis', 'lainnya',
] as const;

export const NEARBY_CATEGORY_LABELS: Record<NearbyCategory, string> = {
  tol: 'Tol', sekolah: 'Sekolah', mall: 'Mall', rumahSakit: 'Rumah sakit',
  stasiun: 'Stasiun', bandara: 'Bandara', pusatBisnis: 'Pusat bisnis', lainnya: 'Lainnya',
};

const LocationDetailSchema = z.object({
  area: z.string().trim().default(''),
  district: z.string().trim().default(''),
  city: z.string().trim().default(''),
  province: z.string().trim().default(''),
  address: z.string().trim().default(''),
});

const NearbyItemSchema = z.object({
  category: z.enum(NEARBY_CATEGORIES),
  name: z.string().trim().min(1, wajib),
  // `number | null`, TIDAK PERNAH string. Menerima string di sini akan membuka
  // kembali jalur "AI mengarang jarak" yang seluruh desain ini tutup.
  minutes: z.number().int().positive().nullable(),
});

const BriefFacilitySchema = z.object({
  name: z.string().trim().min(1, wajib),
  desc: z.string().trim().default(''),
  mediaIds: z.array(z.string()).default([]),
});

const BriefPromoSchema = z.object({
  name: z.string().trim().default(''),
  items: z.array(z.string().trim().min(1)).default([]),
  detail: z.string().trim().default(''),
  validUntil: z.string().trim().nullable().default(null),
  dpText: z.string().trim().default(''),
  installmentText: z.string().trim().default(''),
});

/** Kunci notes dibatasi ke BlockType yang benar-benar ada, bukan string bebas. */
const NotesSchema = z.record(
  z.enum(Object.keys(BLOCK_LABELS) as [string, ...string[]]),
  z.string().trim(),
);

export const ProjectBriefSchema = z.object({
  version: z.literal(1),
  location: LocationDetailSchema.nullable().default(null),
  nearby: z.array(NearbyItemSchema).default([]),
  highlights: z.array(z.string().trim().min(1)).default([]),
  facilities: z.array(BriefFacilitySchema).default([]),
  promo: BriefPromoSchema.nullable().default(null),
  heroEmphasis: z.enum(['promo', 'lokasi', 'konsep', 'harga']).nullable().default(null),
  ctaGoals: z.array(z.enum(['whatsapp', 'lihatTipe', 'lihatPromo', 'form'])).default([]),
  notes: NotesSchema.default({}),
});
```

Tambahkan dua field ke `ProjectDraftSchema` (di dalam `z.object({ ... })`, setelah `facilities`):

```ts
  projectType: z.enum(PROJECT_TYPES).nullable().default(null),
  brief: ProjectBriefSchema.optional(),
```

`ProjectPublishSchema` **tidak diubah** — brief kosong tidak boleh memblokir publish.

- [ ] **Step 5: Ekspor dari barrel**

Di `lib/schemas/index.ts`, ganti baris pertama:

```ts
export {
  ProjectDraftSchema, ProjectPublishSchema, ProjectBriefSchema, FACILITY_OPTIONS,
  PROJECT_TYPES, PROJECT_TYPE_LABELS, NEARBY_CATEGORIES, NEARBY_CATEGORY_LABELS,
} from './project';
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/brief-schema.test.ts`
Expected: PASS, 8 tes.

Lalu: `npx tsc --noEmit`
Expected: error di `fixtures/seed.ts`, `lib/data/mock/repos.ts`, dan `lib/data/mock/snapshot.ts` karena `Project` sekarang menuntut `projectType` + `brief`. **Itu diharapkan** — Task 2 dan Task 4 yang menutupnya. Jangan menambal dengan `as any`.

- [ ] **Step 7: Commit**

```bash
git add lib/data/types.ts lib/schemas/project.ts lib/schemas/index.ts tests/unit/brief-schema.test.ts
git commit -m "feat(brief): tipe ProjectBrief + ProjectBriefSchema"
```

---

### Task 2: Repo, default store, dan repairShape

**Files:**
- Modify: `lib/data/repo.ts:6` (`NewProject`)
- Modify: `lib/data/mock/repos.ts:57-72` (`projects.create`)
- Modify: `lib/data/mock/snapshot.ts:60-71` (perbaikan tingkat baris di `repairShape`)
- Test: `tests/unit/brief-store.test.ts`

**Interfaces:**
- Consumes: `emptyBrief()`, `ProjectBrief`, `ProjectType` dari Task 1.
- Produces: `NewProject` kini menerima `projectType` dan `brief` opsional; `db.projects.create()` selalu mengembalikan project dengan `brief` terisi.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/brief-store.test.ts`:

```ts
import { afterAll, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db
// dibuat sekali saat modul dimuat) — pola yang sama dengan project-actions.test.ts.
const { dataDirRel } = vi.hoisted(() => {
  const dataDirRel = `.tmp-test-data-brief-store-${process.pid}-${Date.now()}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

import { db } from '@/lib/data';
import { emptyBrief } from '@/lib/data/types';

afterAll(() => rmSync(path.resolve(process.cwd(), dataDirRel), { recursive: true, force: true }));

describe('projects.create — default brief', () => {
  it('project baru selalu punya brief kosong, bukan undefined', async () => {
    const p = await db.projects.create({
      userId: 'usr_brief', name: 'Cluster Brief', location: '', developer: '',
      description: '', facilities: [],
    });
    expect(p.brief).toEqual(emptyBrief());
    expect(p.projectType).toBeNull();
  });

  it('menerima projectType dan brief saat create', async () => {
    const brief = { ...emptyBrief(), highlights: ['Bebas banjir'] };
    const p = await db.projects.create({
      userId: 'usr_brief', name: 'Cluster Terisi', location: '', developer: '',
      description: '', facilities: [], projectType: 'kavling', brief,
    });
    expect(p.projectType).toBe('kavling');
    expect(p.brief.highlights).toEqual(['Bebas banjir']);
  });

  it('brief yang disimpan tidak teraliaskan ke pemanggil', async () => {
    const brief = { ...emptyBrief(), highlights: ['Awal'] };
    const p = await db.projects.create({
      userId: 'usr_brief', name: 'Cluster Clone', location: '', developer: '',
      description: '', facilities: [], brief,
    });
    brief.highlights.push('Disisipkan setelah create');
    const reread = await db.projects.get(p.id);
    expect(reread?.brief.highlights).toEqual(['Awal']);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/brief-store.test.ts`
Expected: FAIL — `p.brief` `undefined`, dan tsc menolak `projectType` di `NewProject`.

- [ ] **Step 3: Perluas `NewProject`**

Di `lib/data/repo.ts` baris 6:

```ts
export type NewProject =
  Pick<Project, 'userId' | 'name' | 'location' | 'developer' | 'description' | 'facilities'>
  & Partial<Pick<Project, 'projectType' | 'brief'>>;
```

- [ ] **Step 4: Isi default di `projects.create`**

Di `lib/data/mock/repos.ts`, tambahkan import nilai (bukan tipe) di puncak:

```ts
import { emptyBrief } from '../types';
```

lalu ubah objek `created` di dalam `async create(input: NewProject)`:

```ts
        const created = {
          ...clone(input),
          projectType: input.projectType ?? null,
          brief: clone(input.brief ?? emptyBrief()),
          id: newId('prj'),
          slug: uniqueSlug(input.name, s.projects.map((p) => p.slug)),
          status: 'draft' as const,
          theme: DEFAULT_THEME,
          palette: THEME_DEFAULT_PALETTE[DEFAULT_THEME],
          blocks: defaultBlocksForTheme(DEFAULT_THEME),
          seo: {},
          aiContent: null,
          createdAt: now(),
          updatedAt: now(),
          publishedAt: null,
        };
```

- [ ] **Step 5: Tambal snapshot lama di `repairShape`**

Di `lib/data/mock/snapshot.ts`, tambahkan `emptyBrief` ke import dari `'../types'`, lalu di dalam `repaired.projects = (repaired.projects as Project[]).map((p) => {` tambahkan dua properti setelah `blocks:`:

```ts
      blocks: Array.isArray(p.blocks) && p.blocks.length ? p.blocks : defaultBlocksForTheme(theme),
      // Field BARIS yang baru ditambahkan tidak pernah ada di snapshot lama.
      // Tanpa dua baris ini, project lama membaca brief undefined dan setiap
      // pembacaan di UI meledak — persis pola specialistArea/notifyOnLead.
      projectType: ((p as { projectType?: unknown }).projectType as Project['projectType']) ?? null,
      brief: isPlainObject((p as { brief?: unknown }).brief) ? (p as Project).brief : emptyBrief(),
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/brief-store.test.ts tests/unit/mock-store.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/data/repo.ts lib/data/mock/repos.ts lib/data/mock/snapshot.ts tests/unit/brief-store.test.ts
git commit -m "feat(brief): brief default di create() dan tambalan repairShape"
```

---

### Task 3: `pickFirst()` + rantai brief di `resolve()`

**Files:**
- Modify: `lib/landing/resolve.ts` (`pick` baris ~46; `resolveBlocks` baris ~87)
- Test: `tests/unit/brief-resolve.test.ts`

**Interfaces:**
- Consumes: `ProjectBrief`, `emptyBrief()` dari Task 1.
- Produces: `pickFirst<T>(...candidates: (T | undefined)[]): T` diekspor dari `@/lib/landing/resolve`. Bentuk `ResolvedBlock` **tidak berubah** — hanya sumber nilainya.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/brief-resolve.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveBlocks, pickFirst } from '@/lib/landing/resolve';
import { defaultBlocksForTheme, updateBlockProps } from '@/lib/landing/blocks';
import { seedStore } from '@/fixtures/seed';
import { emptyBrief } from '@/lib/data/types';
import type { Project, ProjectBrief } from '@/lib/data/types';

function fixture(brief: Partial<ProjectBrief> = {}, overrides: Partial<Project> = {}) {
  const store = seedStore();
  const project: Project = {
    ...store.projects[0],
    blocks: defaultBlocksForTheme('tropicalWarm'),
    brief: { ...emptyBrief(), ...brief },
    ...overrides,
  };
  return {
    project,
    houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
    media: [],
    agent: store.agentProfiles[0],
  };
}

const block = <T extends { type: string }>(blocks: T[], type: string) => blocks.find((b) => b.type === type);

/** aiContent lengkap dengan nilai KONTRAS supaya kebocoran AI ke fakta terdeteksi. */
const noisyAi = {
  headline: 'Judul dari AI',
  subheadline: 'Subjudul dari AI',
  description: 'Deskripsi dari AI',
  sellingPoints: ['USP dari AI'],
  faq: [{ q: 'Dari AI?', a: 'Ya.' }],
  seo: { title: 'T', description: 'D' },
  captions: { instagram: 'i', facebook: 'f', whatsapp: 'w' },
  cta: { whatsappMessage: 'Pesan WA dari AI' },
};

describe('pickFirst', () => {
  it('mengambil kandidat pertama yang hadir', () => {
    expect(pickFirst(undefined, '', '  ', 'terpakai', 'cadangan')).toBe('terpakai');
  });
  it('array kosong dianggap absen, sama seperti pick', () => {
    expect(pickFirst<string[]>([], ['isi'], [])).toEqual(['isi']);
  });
});

describe('FAKTA — brief menang atas AI, dan AI tidak pernah bisa masuk', () => {
  it('nearby ber-minutes menjadi kartu akses dengan satuan "mnt"', () => {
    const input = fixture({
      nearby: [
        { category: 'tol', name: 'Gerbang Tol Kelapa Gading', minutes: 3 },
        { category: 'mall', name: 'Mall Kelapa Gading', minutes: 8 },
      ],
    }, { aiContent: noisyAi });
    const loc = block(resolveBlocks(input), 'location') as { access: { time: string; place: string }[] };
    expect(loc.access).toEqual([
      { time: '3 mnt', place: 'Gerbang Tol Kelapa Gading' },
      { time: '8 mnt', place: 'Mall Kelapa Gading' },
    ]);
  });

  it('nearby TANPA minutes tidak menjadi kartu akses — kartu waktu tanpa waktu adalah kartu rusak', () => {
    const input = fixture({
      nearby: [
        { category: 'tol', name: 'Tol Kelapa Gading', minutes: 3 },
        { category: 'sekolah', name: 'Sekolah Harapan', minutes: null },
      ],
    });
    const loc = block(resolveBlocks(input), 'location') as { access: { place: string }[] };
    expect(loc.access.map((a) => a.place)).toEqual(['Tol Kelapa Gading']);
  });

  it('override di blok tetap menang atas brief', () => {
    const base = fixture({ nearby: [{ category: 'tol', name: 'Dari brief', minutes: 3 }] });
    const blocks = updateBlockProps(base.project.blocks, 'blk_location', {
      access: [{ time: '9 mnt', place: 'Dari editor' }],
    });
    const loc = block(resolveBlocks({ ...base, project: { ...base.project, blocks } }), 'location') as {
      access: { place: string }[];
    };
    expect(loc.access.map((a) => a.place)).toEqual(['Dari editor']);
  });

  it('alamat diambil dari brief.location.address, jatuh ke project.location kalau kosong', () => {
    const withAddress = fixture({
      location: { area: 'Kelapa Gading', district: 'Kelapa Gading', city: 'Jakarta Utara', province: 'DKI Jakarta', address: 'Jl. Boulevard Raya 14240' },
    });
    const a = block(resolveBlocks(withAddress), 'location') as { address: string };
    expect(a.address).toBe('Jl. Boulevard Raya 14240');

    const b = block(resolveBlocks(fixture()), 'location') as { address: string };
    expect(b.address).toBe('Kelapa Gading, Jakarta Utara');
  });

  it('fasilitas dari brief membawa keterangannya', () => {
    const input = fixture({
      facilities: [{ name: 'Clubhouse', desc: 'Lounge & ruang serbaguna', mediaIds: [] }],
    }, { aiContent: noisyAi });
    const f = block(resolveBlocks(input), 'facilities') as { items: { name: string; desc: string }[] };
    expect(f.items).toEqual([{ name: 'Clubhouse', desc: 'Lounge & ruang serbaguna' }]);
  });

  it('promo dari brief mengisi daftar dan menyusun catatan dengan masa berlaku', () => {
    const input = fixture({
      promo: {
        name: 'Free BPHTB',
        items: ['Free BPHTB dan AJB', 'Cashback 5%'],
        detail: 'Selama unit tersedia.',
        validUntil: '2026-09-30',
        dpText: '10%',
        installmentText: 'Rp 18 jt/bln',
      },
    }, { aiContent: noisyAi });
    const p = block(resolveBlocks(input), 'pricePromo') as {
      promos: string[]; note: string; dpText: string; installmentText: string;
    };
    expect(p.promos).toEqual(['Free BPHTB dan AJB', 'Cashback 5%']);
    expect(p.dpText).toBe('10%');
    expect(p.installmentText).toBe('Rp 18 jt/bln');
    expect(p.note).toBe('Selama unit tersedia. · Berlaku sampai 30 September 2026');
  });
});

describe('COPY — AI di atas brief', () => {
  it('keunggulan dari AI mengalahkan keunggulan mentah agen', () => {
    const input = fixture({ highlights: ['bebas banjir'] }, { aiContent: noisyAi });
    const h = block(resolveBlocks(input), 'highlights') as { items: { title: string }[] };
    expect(h.items.map((i) => i.title)).toEqual(['USP dari AI']);
  });

  it('tanpa AI, keunggulan mentah agen tetap tampil — jaring pengaman kalau AI gagal', () => {
    const input = fixture({ highlights: ['bebas banjir', 'one gate system'] });
    const h = block(resolveBlocks(input), 'highlights') as { items: { title: string }[] };
    expect(h.items.map((i) => i.title)).toEqual(['bebas banjir', 'one gate system']);
  });

  it('subjudul hero memakai ai.subheadline saat override kosong', () => {
    const h = block(resolveBlocks(fixture({}, { aiContent: noisyAi })), 'hero') as { subtitle: string };
    expect(h.subtitle).toBe('Subjudul dari AI');
  });

  it('pesan WhatsApp memakai ai.cta.whatsappMessage', () => {
    const c = block(resolveBlocks(fixture({}, { aiContent: noisyAi })), 'agentCta') as { defaultMessage: string };
    expect(c.defaultMessage).toBe('Pesan WA dari AI');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/brief-resolve.test.ts`
Expected: FAIL — `pickFirst` belum diekspor.

- [ ] **Step 3: Tambahkan `pickFirst` dan generalisasi `pick`**

Di `lib/landing/resolve.ts`, ganti seluruh blok `export const pick = ...` dengan:

```ts
const isAbsent = <T>(v: T | undefined): boolean => {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
};

/**
 * Rantai N lapis. Kandidat terakhir adalah fallback dan selalu dipakai kalau
 * semua di depannya absen. Ini generalisasi pick(); logika isAbsent-nya sama
 * persis supaya tidak ada dua definisi "kosong" yang bisa berdivergensi.
 */
export function pickFirst<T>(...candidates: (T | undefined)[]): T {
  for (const c of candidates.slice(0, -1)) if (!isAbsent(c)) return c as T;
  return candidates[candidates.length - 1] as T;
}

/** Rantai yang menopang tombol "Use AI suggestion": override, lalu AI, lalu fallback. */
export const pick = <T>(override: T | undefined, ai: T | undefined, fallback: T): T =>
  pickFirst(override, ai, fallback);
```

Tambahkan dua import di puncak file:

```ts
import { formatDateLong } from '@/lib/format';
import { emptyBrief } from '@/lib/data/types';
```

- [ ] **Step 4: Alirkan brief ke `resolveBlocks`**

Tepat setelah `const ai = project.aiContent;`, tambahkan:

```ts
  // emptyBrief(): snapshot lama tidak punya brief, dan resolveBlocks juga
  // dipanggil dari tes yang membangun Project parsial.
  const brief = project.brief ?? emptyBrief();
  const briefAccess = brief.nearby
    .filter((n) => n.minutes !== null)
    .map((n) => ({ time: `${n.minutes} mnt`, place: n.name }));
  const briefPromoNote = brief.promo
    ? [
        brief.promo.detail,
        brief.promo.validUntil ? `Berlaku sampai ${formatDateLong(brief.promo.validUntil)}` : '',
      ].filter(Boolean).join(' · ')
    : '';
```

- [ ] **Step 5: Sisipkan brief ke tiap rantai**

Ganti `highlightItems` (rantai empat lapis — AI di ATAS brief):

```ts
  const highlightItems: { title: string; desc: string }[] = pickFirst<{ title: string; desc?: string }[]>(
    (byId('highlights')?.props as { items?: { title: string; desc?: string }[] } | undefined)?.items,
    ai?.sellingPoints?.map((title) => ({ title })),
    brief.highlights.map((title) => ({ title })),
    [],
  ).map((it) => ({ title: it.title, desc: it.desc ?? '' }));
```

Ganti `defaultMessage` di atas loop:

```ts
  const defaultMessage = pick(
    ctaProps.defaultMessage,
    ai?.cta?.whatsappMessage,
    `Halo ${agent.fullName}, saya tertarik dengan ${project.name}.`,
  );
```

Di `case 'hero'`, ganti baris `subtitle`:

```ts
          subtitle: pick(p.subtitle as string | undefined, ai?.subheadline, project.location),
```

Di `case 'facilities'`, ganti isi `items` (brief di ATAS AI — AI tidak punya kandidat di sini sama sekali):

```ts
          items: pickFirst<{ name: string; desc?: string }[]>(
            p.items as { name: string; desc?: string }[] | undefined,
            brief.facilities.map((f) => ({ name: f.name, desc: f.desc })),
            project.facilities.map((name) => ({ name })),
          ).map((it) => ({ name: it.name, desc: it.desc ?? '' })),
```

Ganti seluruh `case 'location'`:

```ts
      case 'location':
        out.push({
          id: block.id, type: 'location',
          address: pickFirst(
            p.address as string | undefined,
            brief.location?.address,
            project.location,
          ),
          mapUrl: (p.mapUrl as string | undefined) ?? null,
          access: pickFirst(p.access as { time: string; place: string }[] | undefined, briefAccess, []),
        });
        break;
```

Ganti seluruh `case 'pricePromo'`:

```ts
      case 'pricePromo':
        out.push({
          id: block.id, type: 'pricePromo', priceFrom,
          dpText: pickFirst(p.dpText as string | undefined, brief.promo?.dpText, ''),
          installmentText: pickFirst(p.installmentText as string | undefined, brief.promo?.installmentText, ''),
          promos: pickFirst(p.promos as string[] | undefined, brief.promo?.items, []),
          note: pickFirst(p.note as string | undefined, briefPromoNote, ''),
        });
        break;
```

Di `case 'agentCta'`, ganti `defaultMessage`:

```ts
          defaultMessage: pick(
            p.defaultMessage as string | undefined,
            ai?.cta?.whatsappMessage,
            `Halo ${agent.fullName}, saya tertarik dengan ${project.name}.`,
          ),
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/brief-resolve.test.ts tests/unit/resolve.test.ts`
Expected: PASS keduanya. `resolve.test.ts` yang lama **harus tetap hijau** — kalau merah, rantai lama tidak sengaja berubah.

- [ ] **Step 7: Commit**

```bash
git add lib/landing/resolve.ts tests/unit/brief-resolve.test.ts
git commit -m "feat(brief): rantai resolve — fakta di atas AI, copy di bawah AI"
```

---

### Task 4: Seed Parkspring pindah ke brief (render wajib identik)

**Files:**
- Modify: `fixtures/seed.ts` (helper `project()` baris ~16–27; `PARKSPRING_BLOCKS` baris ~37–120; `seedStore()` baris ~150+)
- Test: `tests/unit/brief-resolve.test.ts` (tambah blok describe regresi)

**Interfaces:**
- Consumes: `ProjectBrief`, `emptyBrief()` (Task 1), rantai resolve (Task 3).
- Produces: `seedStore().projects[0].brief` terisi penuh; `PARKSPRING_BLOCKS` tidak lagi memuat `location.access`, `location.address`, `facilities.items`, `pricePromo.*`.

- [ ] **Step 1: Tulis tes regresi yang gagal**

Tambahkan di akhir `tests/unit/brief-resolve.test.ts`:

```ts
describe('seed Parkspring — render dari brief IDENTIK dengan render lama dari props', () => {
  const seedInput = () => {
    const store = seedStore();
    return {
      project: store.projects[0],
      houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
      media: [],
      agent: store.agentProfiles[0],
    };
  };

  it('kartu akses tetap enam butir dengan teks yang sama persis', () => {
    const loc = block(resolveBlocks(seedInput()), 'location') as {
      address: string; access: { time: string; place: string }[];
    };
    expect(loc.address).toBe('Jl. Boulevard Raya, Kelapa Gading, Jakarta Utara 14240');
    expect(loc.access).toEqual([
      { time: '3 mnt', place: 'Gerbang Tol Kelapa Gading' },
      { time: '8 mnt', place: 'Mall Kelapa Gading' },
      { time: '10 mnt', place: 'LRT Boulevard Utara' },
      { time: '12 mnt', place: 'RS Mitra Keluarga' },
      { time: '15 mnt', place: 'Sekolah & universitas' },
      { time: '35 mnt', place: 'Bandara Soekarno-Hatta' },
    ]);
  });

  it('fasilitas tetap enam butir beserta keterangannya', () => {
    const f = block(resolveBlocks(seedInput()), 'facilities') as { items: { name: string; desc: string }[] };
    expect(f.items).toEqual([
      { name: 'Clubhouse', desc: 'Lounge & ruang serbaguna' },
      { name: 'Swimming Pool', desc: 'Kolam 25 m & kolam anak' },
      { name: 'Taman Tematik', desc: 'Empat taman tropis' },
      { name: 'Jogging Track', desc: 'Lintasan 800 meter' },
      { name: 'Playground', desc: 'Dua titik area anak' },
      { name: 'One Gate System', desc: 'Security 24 jam & CCTV' },
    ]);
  });

  it('promo tetap empat butir dengan DP, cicilan, dan catatan yang sama', () => {
    const p = block(resolveBlocks(seedInput()), 'pricePromo') as {
      promos: string[]; dpText: string; installmentText: string; note: string;
    };
    expect(p.dpText).toBe('10%');
    expect(p.installmentText).toBe('Rp 18 jt/bln');
    expect(p.promos).toEqual([
      'Free BPHTB dan AJB',
      'Cashback 5% untuk pembelian tunai bertahap',
      'Free smart door lock dan CCTV',
      'Free biaya balik nama sertifikat',
    ]);
    expect(p.note).toBe('Promo berlaku untuk pemesanan bulan ini, selama unit tersedia.');
  });

  it('fakta itu benar-benar PINDAH — bukan disalin, supaya rantai brief teruji', () => {
    const blocks = seedStore().projects[0].blocks;
    const locProps = blocks.find((b) => b.type === 'location')!.props as Record<string, unknown>;
    const facProps = blocks.find((b) => b.type === 'facilities')!.props as Record<string, unknown>;
    const promoProps = blocks.find((b) => b.type === 'pricePromo')!.props as Record<string, unknown>;
    expect(locProps.access).toBeUndefined();
    expect(locProps.address).toBeUndefined();
    expect(facProps.items).toBeUndefined();
    expect(promoProps.promos).toBeUndefined();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/brief-resolve.test.ts -t "seed Parkspring"`
Expected: FAIL pada tes "fakta itu benar-benar PINDAH" — props masih terisi.

- [ ] **Step 3: Beri helper `project()` dua parameter baru**

Di `fixtures/seed.ts`, ganti import tipe di puncak (hapus baris `import type { StoreShape } ...` yang lama):

```ts
import { emptyBrief } from '@/lib/data/types';
import type { ProjectBrief, ProjectType, StoreShape } from '@/lib/data/types';
```

Ganti helper `project`:

```ts
const project = (
  id: string, name: string, slug: string, location: string, developer: string,
  description: string, facilities: string[], status: 'draft' | 'published', updatedAt: string,
  blocks: Block[] = defaultBlocksForTheme(DEFAULT_THEME),
  projectType: ProjectType | null = null,
  brief: ProjectBrief = emptyBrief(),
) => ({
  id, userId: SEED_USER_ID, name, slug, location, developer, description, facilities,
  projectType, brief,
  // Palet DITURUNKAN dari tema, tidak ditulis ulang: pasangan tema x palet yang
  // tidak cocok membuat sebagian teks tak terlihat (bug-037).
  status, theme: DEFAULT_THEME, palette: THEME_DEFAULT_PALETTE[DEFAULT_THEME], blocks,
  seo: {}, aiContent: null,
  createdAt: NOW, updatedAt, publishedAt: status === 'published' ? updatedAt : null,
});
```

- [ ] **Step 4: Buang fakta dari `PARKSPRING_BLOCKS` dan pindahkan ke brief**

Di `PARKSPRING_BLOCKS`, **hapus seluruh kunci `location`, `facilities`, dan `pricePromo`**. Sisakan `hero`, `highlights`, `gallery`, `floorPlans`, `developer`, `testimonials`, `faq` persis seperti sekarang.

Tambahkan konstanta baru tepat di bawah `PARKSPRING_BLOCKS`:

```ts
/**
 * Fakta Parkspring — dipindahkan dari blocks[].props ke brief (spec §12.2).
 * Kalau ditaruh di KEDUA tempat, props menang dan rantai brief tidak pernah
 * teruji. Teks di sini wajib sama persis dengan yang dulu ada di props: papan
 * /preview membandingkan sepuluh tema di atas konten kanonik ini.
 */
const PARKSPRING_BRIEF: ProjectBrief = {
  ...emptyBrief(),
  location: {
    area: 'Kelapa Gading',
    district: 'Kelapa Gading',
    city: 'Jakarta Utara',
    province: 'DKI Jakarta',
    address: 'Jl. Boulevard Raya, Kelapa Gading, Jakarta Utara 14240',
  },
  nearby: [
    { category: 'tol', name: 'Gerbang Tol Kelapa Gading', minutes: 3 },
    { category: 'mall', name: 'Mall Kelapa Gading', minutes: 8 },
    { category: 'stasiun', name: 'LRT Boulevard Utara', minutes: 10 },
    { category: 'rumahSakit', name: 'RS Mitra Keluarga', minutes: 12 },
    { category: 'sekolah', name: 'Sekolah & universitas', minutes: 15 },
    { category: 'bandara', name: 'Bandara Soekarno-Hatta', minutes: 35 },
  ],
  highlights: [
    'Lokasi strategis di koridor Boulevard Kelapa Gading',
    'Developer 28 tahun dengan 40 kawasan serah terima',
    'Desain tropis modern dengan ventilasi silang',
    'Legalitas SHM per unit dan PBG lengkap',
  ],
  facilities: [
    { name: 'Clubhouse', desc: 'Lounge & ruang serbaguna', mediaIds: [] },
    { name: 'Swimming Pool', desc: 'Kolam 25 m & kolam anak', mediaIds: [] },
    { name: 'Taman Tematik', desc: 'Empat taman tropis', mediaIds: [] },
    { name: 'Jogging Track', desc: 'Lintasan 800 meter', mediaIds: [] },
    { name: 'Playground', desc: 'Dua titik area anak', mediaIds: [] },
    { name: 'One Gate System', desc: 'Security 24 jam & CCTV', mediaIds: [] },
  ],
  promo: {
    name: 'Free BPHTB',
    items: [
      'Free BPHTB dan AJB',
      'Cashback 5% untuk pembelian tunai bertahap',
      'Free smart door lock dan CCTV',
      'Free biaya balik nama sertifikat',
    ],
    detail: 'Promo berlaku untuk pemesanan bulan ini, selama unit tersedia.',
    validUntil: null,
    dpText: '10%',
    installmentText: 'Rp 18 jt/bln',
  },
  heroEmphasis: 'lokasi',
  ctaGoals: ['whatsapp', 'lihatTipe'],
  notes: {},
};
```

**`validUntil: null` disengaja.** Catatan lama berbunyi "Promo berlaku untuk pemesanan bulan ini, selama unit tersedia." tanpa tanggal; mengisi `validUntil` akan menambahkan " · Berlaku sampai …" dan render tidak lagi identik.

- [ ] **Step 5: Sambungkan ke `seedStore()`**

Ubah pemanggilan project Parkspring:

```ts
      project(
        'prj_parkspring', 'Parkspring', 'parkspring-gading',
        'Kelapa Gading, Jakarta Utara', 'Parkspring Land',
        'Kawasan hunian tropis 8,4 hektar di koridor Boulevard Kelapa Gading. Tiga tipe rumah dengan clubhouse, kolam renang, jogging track, dan one gate system.',
        ['Clubhouse', 'Swimming Pool', 'Taman Tematik', 'Jogging Track', 'Playground', 'One Gate System'],
        'published', '2026-08-10T09:00:00.000Z',
        PARKSPRING_BLOCKS,
        'perumahan',
        PARKSPRING_BRIEF,
      ),
```

Untuk dua project lain, tambahkan argumen ke-10 dan ke-11. `undefined` di posisi `blocks` memakai nilai default parameter:

```ts
        'draft', '2026-08-07T09:00:00.000Z', undefined, 'perumahan',
```

```ts
        'published', '2026-08-02T09:00:00.000Z', undefined, 'perumahan',
```

- [ ] **Step 6: Reset store dan jalankan tes**

```bash
npm run seed:reset
npx vitest run tests/unit/brief-resolve.test.ts tests/unit/resolve.test.ts tests/unit/seo.test.ts tests/unit/block-renderer.test.tsx
```

Expected: PASS semua. Kalau `seo.test.ts` merah, `project.facilities` ikut terhapus — kembalikan, field itu wajib tetap hidup.

- [ ] **Step 7: Verifikasi visual bahwa render benar-benar identik**

```bash
npm run dev
```

Buka `http://localhost:3000/preview`. Kartu akses (6), fasilitas (6), dan promo (4) harus tampil sama di kesepuluh iframe. **Hentikan dev server sebelum langkah build mana pun.**

- [ ] **Step 8: Commit**

```bash
git add fixtures/seed.ts tests/unit/brief-resolve.test.ts
git commit -m "feat(brief): seed Parkspring pindah dari blocks.props ke brief"
```

---

### Task 5: Kontrak AI — `brief` masuk, `subheadline` + `cta` keluar

**Files:**
- Modify: `lib/ai/schema.ts`
- Modify: `lib/ai/generator.ts:4-11` (`GenerateInput`)
- Modify: `lib/ai/mock.ts`
- Modify: `app/(dashboard)/projects/[id]/generate/actions.ts`
- Test: `tests/unit/ai-mock.test.ts` (tambah)

**Interfaces:**
- Consumes: `ProjectBrief`, `emptyBrief()` (Task 1).
- Produces: `GenerateInput.brief: ProjectBrief` (wajib); `AiContent` bertambah `subheadline: string` dan `cta: { whatsappMessage: string }`.

- [ ] **Step 1: Tulis tes yang gagal**

Pastikan puncak `tests/unit/ai-mock.test.ts` mengimpor:

```ts
import { seedStore } from '@/fixtures/seed';
import { AiContentSchema } from '@/lib/ai';
```

Tambahkan di akhir file:

```ts
describe('mockGenerator membaca brief', () => {
  const base = () => {
    const store = seedStore();
    return {
      project: store.projects[0],
      houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
      brief: store.projects[0].brief,
      delayMs: 0,
    };
  };

  it('menyebut kawasan dari brief.location di headline', async () => {
    const out = await mockGenerator.generate(base());
    expect(out.headline).toContain('Kelapa Gading');
  });

  it('menurunkan sellingPoints dari brief.highlights, bukan dari facilities saja', async () => {
    const out = await mockGenerator.generate(base());
    expect(out.sellingPoints).toContain('Lokasi strategis di koridor Boulevard Kelapa Gading');
  });

  it('menyebut nearby yang PUNYA menit beserta angkanya', async () => {
    const out = await mockGenerator.generate(base());
    expect(out.description).toContain('3 menit ke Gerbang Tol Kelapa Gading');
  });

  it('menyebut nearby TANPA menit tanpa angka apa pun', async () => {
    const input = base();
    input.brief = {
      ...input.brief,
      nearby: [{ category: 'sekolah' as const, name: 'Sekolah Harapan', minutes: null }],
    };
    const out = await mockGenerator.generate(input);
    expect(out.description).toContain('dekat Sekolah Harapan');
    expect(out.description).not.toMatch(/\d+\s*menit ke Sekolah Harapan/);
  });

  it('mengarahkan pesan WhatsApp ke tujuan CTA yang dipilih agen', async () => {
    const input = base();
    input.brief = { ...input.brief, ctaGoals: ['lihatPromo'] };
    const out = await mockGenerator.generate(input);
    expect(out.cta.whatsappMessage).toContain('promo');
  });

  it('selalu mengembalikan subheadline yang lolos AiContentSchema', async () => {
    const out = await mockGenerator.generate(base());
    expect(AiContentSchema.safeParse(out).success).toBe(true);
    expect(out.subheadline.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/ai-mock.test.ts`
Expected: FAIL — `brief` bukan properti `GenerateInput`, `out.cta` undefined.

- [ ] **Step 3: Perluas skema AI**

Di `lib/ai/schema.ts`, tambahkan setelah `headline`:

```ts
  subheadline: z.string().min(1),
```

dan sebelum penutup objek:

```ts
  /**
   * Hanya pesan WhatsApp yang menjadi data di 3A. Label CTA tetap milik tema —
   * kesepuluh tema punya wordingnya sendiri hasil transkrip file desain.
   */
  cta: z.object({ whatsappMessage: z.string().min(1) }),
```

- [ ] **Step 4: Tambahkan `brief` ke `GenerateInput`**

Di `lib/ai/generator.ts`:

```ts
import type { HouseType, Project, ProjectBrief } from '@/lib/data/types';

export interface GenerateInput {
  project: Project;
  houseTypes: HouseType[];
  /**
   * Bahan mentah dari agen. Generator WAJIB memakai hanya fakta di sini dan di
   * houseTypes — jangan menyebut angka, jarak, waktu tempuh, harga, atau nama
   * tempat yang tidak ada di keduanya. Kalau `minutes` null, sebut tempatnya
   * tanpa angka.
   */
  brief: ProjectBrief;
  /** Diekspos supaya tes bisa menjalankan mock tanpa menunggu. */
  delayMs?: number;
  forceFail?: boolean;
}
```

- [ ] **Step 5: Buat mock membaca brief**

Di `lib/ai/mock.ts`, tambahkan di atas `paragraphs`:

```ts
/**
 * Nearby menjadi kalimat. Yang punya menit menyebut angkanya; yang tidak punya
 * disebut TANPA angka — cermin dari aturan grounding, dan yang membuat asersi
 * "AI tidak mengarang jarak" bisa diuji di atas mock.
 */
function nearbyPhrase(brief: GenerateInput['brief']): string {
  if (!brief.nearby.length) return '';
  const parts = brief.nearby.map((n) =>
    n.minutes === null ? `dekat ${n.name}` : `${n.minutes} menit ke ${n.name}`,
  );
  return ` Akses harian singkat: ${parts.join(', ')}.`;
}

const CTA_MESSAGE: Record<string, string> = {
  whatsapp: 'saya ingin bertanya tentang',
  lihatTipe: 'saya ingin melihat pilihan tipe unit di',
  lihatPromo: 'saya ingin informasi promo yang berlaku di',
  form: 'saya ingin dihubungi mengenai',
};
```

Di dalam `paragraphs()`, ganti paragraf ketiga (`Kawasan ini dilengkapi …`):

```ts
    `Kawasan ini dilengkapi ${fasilitas}.${nearbyPhrase(input.brief)} Lingkungan cluster tertutup membuat penghuni lebih tenang.`,
```

Di dalam `generate()`, ganti pembongkaran input dan empat field pertama return:

```ts
    const { project, houseTypes, brief } = input;
    const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : 0;
    const area = brief.location?.area || brief.location?.district || project.location.split(',')[0];
    const goal = brief.ctaGoals[0] ?? 'whatsapp';

    return {
      headline: `${project.name} — ${houseTypes.length} tipe hunian di ${area}`,
      subheadline: brief.highlights[0]
        ? `${brief.highlights[0]}.`
        : `Hunian siap huni di ${area} dengan ${houseTypes.length} pilihan tipe.`,
      cta: {
        whatsappMessage: `Halo, ${CTA_MESSAGE[goal] ?? CTA_MESSAGE.whatsapp} ${project.name}.`,
      },
      description: paragraphs(input),
```

dan ganti `sellingPoints` agar mendahulukan keunggulan mentah agen:

```ts
      sellingPoints: [
        ...brief.highlights.slice(0, 3),
        ...project.facilities.slice(0, brief.highlights.length ? 1 : 3),
        `${houseTypes.length} tipe unit dalam satu lokasi`,
        `Harga mulai ${formatRupiahShort(cheapest)}`,
      ].filter(Boolean),
```

- [ ] **Step 6: Kirim brief dari action dan simpan field baru**

Di `app/(dashboard)/projects/[id]/generate/actions.ts`, tambahkan `import { emptyBrief } from '@/lib/data/types';`, lalu:

```ts
    const raw = await generator.generate({ project, houseTypes, brief: project.brief ?? emptyBrief() });
```

dan tambahkan dua field ke objek `aiContent` yang disimpan:

```ts
      aiContent: {
        headline: content.headline,
        subheadline: content.subheadline,
        cta: content.cta,
        description: content.description,
        sellingPoints: content.sellingPoints,
        faq: content.faq,
        seo: content.seo,
        captions: content.captions,
      },
```

- [ ] **Step 7: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/ai-mock.test.ts tests/unit/brief-resolve.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/ai tests/unit/ai-mock.test.ts "app/(dashboard)/projects/[id]/generate/actions.ts"
git commit -m "feat(brief): AI menerima brief, mengembalikan subheadline + cta"
```

---

### Task 6: `SECTION_PRESET` + penerapannya di server action

**Files:**
- Create: `lib/landing/sectionPreset.ts`
- Modify: `app/(dashboard)/projects/actions.ts`
- Test: `tests/unit/section-preset.test.ts`

**Interfaces:**
- Consumes: `ProjectType` (Task 1); `Block`, `BlockType`, `BLOCK_LABELS` dari `@/lib/landing/blocks`.
- Produces: `SECTION_PRESET: Record<ProjectType, BlockType[]>` dan `applySectionPreset(blocks: Block[], type: ProjectType | null): Block[]` dari `@/lib/landing/sectionPreset`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/section-preset.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SECTION_PRESET, applySectionPreset } from '@/lib/landing/sectionPreset';
import { defaultBlocksForTheme, BLOCK_LABELS, updateBlockProps } from '@/lib/landing/blocks';
import { PROJECT_TYPES } from '@/lib/schemas';

const enabledTypes = (blocks: ReturnType<typeof defaultBlocksForTheme>) =>
  blocks.filter((b) => b.enabled).map((b) => b.type);

describe('SECTION_PRESET', () => {
  it('punya entri untuk setiap ProjectType', () => {
    for (const t of PROJECT_TYPES) expect(SECTION_PRESET[t]).toBeDefined();
  });

  it('hanya menyebut BlockType yang benar-benar ada', () => {
    const valid = new Set(Object.keys(BLOCK_LABELS));
    for (const t of PROJECT_TYPES) {
      for (const b of SECTION_PRESET[t]) expect(valid.has(b)).toBe(true);
    }
  });

  it('testimonials MATI di semua preset — testimoni tidak boleh datang dari AI', () => {
    for (const t of PROJECT_TYPES) expect(SECTION_PRESET[t]).not.toContain('testimonials');
  });

  it('kavling tidak menyalakan tipe rumah maupun fasilitas', () => {
    expect(SECTION_PRESET.kavling).not.toContain('houseTypes');
    expect(SECTION_PRESET.kavling).not.toContain('facilities');
  });

  it('ruko tidak menyalakan fasilitas kawasan tapi tetap menyalakan spesifikasi', () => {
    expect(SECTION_PRESET.ruko).not.toContain('facilities');
    expect(SECTION_PRESET.ruko).toContain('specs');
  });

  it('semua preset menyalakan hero dan form kontak', () => {
    for (const t of PROJECT_TYPES) {
      expect(SECTION_PRESET[t]).toContain('hero');
      expect(SECTION_PRESET[t]).toContain('contactForm');
    }
  });
});

describe('applySectionPreset', () => {
  it('menyalakan yang di preset dan mematikan sisanya', () => {
    const out = applySectionPreset(defaultBlocksForTheme('tropicalWarm'), 'kavling');
    expect(enabledTypes(out).sort()).toEqual([...SECTION_PRESET.kavling].sort());
  });

  it('URUTAN tidak berubah — urutan milik tema, preset hanya menyentuh enabled', () => {
    const before = defaultBlocksForTheme('tropicalWarm');
    const after = applySectionPreset(before, 'apartemen');
    expect(after.map((b) => b.type)).toEqual(before.map((b) => b.type));
  });

  it('props TIDAK dibuang — mematikan section bukan alasan menghapus isian agen', () => {
    const before = updateBlockProps(defaultBlocksForTheme('tropicalWarm'), 'blk_facilities', {
      items: [{ name: 'Private Garden', desc: 'Taman pribadi' }],
    });
    const after = applySectionPreset(before, 'kavling');
    const fac = after.find((b) => b.type === 'facilities')!;
    expect(fac.enabled).toBe(false);
    expect((fac.props as { items?: unknown[] }).items).toHaveLength(1);
  });

  it('projectType null mengembalikan blok apa adanya', () => {
    const before = defaultBlocksForTheme('tropicalWarm');
    expect(applySectionPreset(before, null)).toEqual(before);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/section-preset.test.ts`
Expected: FAIL — modul tidak ada.

- [ ] **Step 3: Buat `lib/landing/sectionPreset.ts`**

```ts
import type { Block, BlockType } from './blocks';
import type { ProjectType } from '@/lib/data/types';

/**
 * Section yang MENYALA per tipe project. Yang tidak disebut di sini dimatikan.
 *
 * Deterministik dan bukan panggilan AI: rekomendasi section adalah keputusan
 * tabel, dan panggilan AI kedua akan menambah 5–15 detik tepat di jalur Time to
 * Publish <10 menit — sekaligus tetap menuntut tabel ini sebagai fallback.
 *
 * `testimonials` tidak pernah masuk preset mana pun. resolve() sengaja tidak
 * memberinya fallback AI (testimoni fabrikasi adalah penipuan terhadap calon
 * pembeli), jadi menyalakannya secara default hanya menyodorkan section kosong.
 *
 * URUTAN di sini tidak berarti apa-apa — urutan section milik tema
 * (BLOCK_ORDER_BY_THEME). Preset hanya menyentuh flag `enabled`.
 */
export const SECTION_PRESET: Record<ProjectType, BlockType[]> = {
  perumahan: [
    'hero', 'highlights', 'houseTypes', 'facilities', 'location', 'floorPlans',
    'gallery', 'pricePromo', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Unit apartemen dibandingkan lewat angka (luas, kamar, lantai), jadi tabel
  // spesifikasi menyala — beda dari perumahan yang dibandingkan lewat kartu tipe.
  apartemen: [
    'hero', 'highlights', 'houseTypes', 'specs', 'facilities', 'location',
    'floorPlans', 'gallery', 'pricePromo', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Ruko dijual sebagai unit usaha: tidak ada fasilitas kawasan hunian, dan
  // harga/promo naik lebih awal dalam keputusan pembeli.
  ruko: [
    'hero', 'highlights', 'houseTypes', 'specs', 'location', 'pricePromo',
    'floorPlans', 'gallery', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Kavling adalah tanah: tidak ada tipe rumah, tidak ada spesifikasi bangunan,
  // tidak ada fasilitas kawasan. Site plan (lewat floorPlans) justru yang utama.
  kavling: [
    'hero', 'highlights', 'location', 'floorPlans', 'gallery', 'pricePromo',
    'developer', 'faq', 'agentCta', 'contactForm',
  ],
  // Identik dengan perumahan secara section. Tipenya tetap terpisah karena ikut
  // dikirim ke AI sebagai konteks (nada copy villa berbeda) dan tampil di kartu.
  villa: [
    'hero', 'highlights', 'houseTypes', 'facilities', 'location', 'floorPlans',
    'gallery', 'pricePromo', 'developer', 'faq', 'agentCta', 'contactForm',
  ],
};

/**
 * Menyetel flag `enabled` sesuai preset TANPA menyentuh urutan maupun props.
 * Membuang props di sini akan menghapus isian agen tanpa peringatan — cacat yang
 * sudah pernah diperbaiki di applyThemeOrder().
 */
export function applySectionPreset(blocks: Block[], type: ProjectType | null): Block[] {
  if (!type) return blocks;
  const on = new Set(SECTION_PRESET[type]);
  return blocks.map((b) => ({ ...b, enabled: on.has(b.type) }) as Block);
}
```

- [ ] **Step 4: Terapkan preset di server action**

Di `app/(dashboard)/projects/actions.ts`, tambahkan:

```ts
import { applySectionPreset } from '@/lib/landing/sectionPreset';
```

Di `createProjectAction`, setelah `const project = await db.projects.create({ userId, ...draft });`:

```ts
    // Preset diterapkan di sini karena inilah saat projectType pertama diketahui.
    if (draft.projectType) {
      await db.projects.update(project.id, {
        blocks: applySectionPreset(project.blocks, draft.projectType),
      });
    }
```

Di `updateProjectAction`, ganti baris `await db.projects.update(id, parsed.data);` dengan:

```ts
    // Ganti tipe project = ganti section yang relevan. Wizard SUDAH meminta
    // konfirmasi ke agen sebelum memanggil ini, jadi di sini diterapkan tanpa
    // tanya — tapi HANYA saat nilainya benar-benar BERUBAH, supaya penyimpanan
    // langkah lain tidak menimpa toggle manual agen di step 2.
    const patch = { ...parsed.data };
    const nextType = patch.projectType;
    if (nextType && nextType !== owned.projectType) {
      (patch as { blocks?: typeof owned.blocks }).blocks = applySectionPreset(owned.blocks, nextType);
    }
    await db.projects.update(id, patch);
```

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/section-preset.test.ts tests/unit/project-actions.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/landing/sectionPreset.ts "app/(dashboard)/projects/actions.ts" tests/unit/section-preset.test.ts
git commit -m "feat(brief): preset section deterministik per tipe project"
```

---

### Task 7: Dataset wilayah + pencarian

**Files:**
- Create: `data/id-regions.json`
- Create: `lib/places/regions.ts`
- Test: `tests/unit/places.test.ts`

**Interfaces:**
- Produces: `type Region = { district: string; city: string; province: string }`; `searchRegions(q, limit?)`; `formatRegion(r)`; `composeLocationLabel(d)` — dari `@/lib/places/regions`.

**Catatan blocker eksternal:** dataset penuh (~7.300 kecamatan) belum diputuskan sumber/lisensinya. Task ini men-commit **starter** berisi wilayah yang dipakai seed dan tes. Dataset penuh nanti menggantikan isi file dengan bentuk baris yang sama — **perubahan data murni, nol perubahan kode**.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/places.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { searchRegions, formatRegion, composeLocationLabel } from '@/lib/places/regions';

describe('searchRegions', () => {
  it('mencocokkan nama kecamatan', () => {
    const hits = searchRegions('kelapa gading');
    expect(hits[0].district).toBe('Kelapa Gading');
    expect(hits[0].city).toBe('Jakarta Utara');
  });

  it('mencocokkan nama kota juga, bukan hanya kecamatan', () => {
    expect(searchRegions('tangerang selatan').length).toBeGreaterThan(0);
  });

  it('tidak peka huruf besar-kecil', () => {
    expect(searchRegions('KELAPA GADING')[0].district).toBe('Kelapa Gading');
  });

  it('mendahulukan kecocokan awalan di atas kecocokan tengah', () => {
    const hits = searchRegions('serpong');
    expect(hits[0].district.toLowerCase().startsWith('serpong')).toBe(true);
  });

  it('mengembalikan maksimal 8 hasil', () => {
    expect(searchRegions('an').length).toBeLessThanOrEqual(8);
  });

  it('kueri kosong atau satu huruf tidak mengembalikan apa-apa', () => {
    expect(searchRegions('')).toEqual([]);
    expect(searchRegions('k')).toEqual([]);
  });

  it('kueri tanpa kecocokan mengembalikan array kosong, bukan melempar', () => {
    expect(searchRegions('zzzzqq')).toEqual([]);
  });
});

describe('formatRegion', () => {
  it('merangkai baris kedua combobox', () => {
    expect(formatRegion({ district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten' }))
      .toBe('Kelapa Dua, Kabupaten Tangerang, Banten');
  });
});

describe('composeLocationLabel', () => {
  it('mendahulukan nama kawasan, lalu kecamatan dan kota', () => {
    expect(composeLocationLabel({
      area: 'Gading Serpong', district: 'Kelapa Dua', city: 'Kabupaten Tangerang',
      province: 'Banten', address: '',
    })).toBe('Gading Serpong, Kelapa Dua, Kabupaten Tangerang');
  });

  it('tanpa kawasan, memakai kecamatan dan kota', () => {
    expect(composeLocationLabel({
      area: '', district: 'Kelapa Gading', city: 'Jakarta Utara', province: 'DKI Jakarta', address: '',
    })).toBe('Kelapa Gading, Jakarta Utara');
  });

  it('lokasi kosong menghasilkan string kosong, bukan koma menggantung', () => {
    expect(composeLocationLabel({ area: '', district: '', city: '', province: '', address: '' })).toBe('');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/places.test.ts`
Expected: FAIL — modul tidak ada.

- [ ] **Step 3: Buat `data/id-regions.json`**

```json
[
  { "district": "Kelapa Gading", "city": "Jakarta Utara", "province": "DKI Jakarta" },
  { "district": "Tanjung Priok", "city": "Jakarta Utara", "province": "DKI Jakarta" },
  { "district": "Kebayoran Baru", "city": "Jakarta Selatan", "province": "DKI Jakarta" },
  { "district": "Setiabudi", "city": "Jakarta Selatan", "province": "DKI Jakarta" },
  { "district": "Cilandak", "city": "Jakarta Selatan", "province": "DKI Jakarta" },
  { "district": "Menteng", "city": "Jakarta Pusat", "province": "DKI Jakarta" },
  { "district": "Tanah Abang", "city": "Jakarta Pusat", "province": "DKI Jakarta" },
  { "district": "Cakung", "city": "Jakarta Timur", "province": "DKI Jakarta" },
  { "district": "Kembangan", "city": "Jakarta Barat", "province": "DKI Jakarta" },
  { "district": "Kelapa Dua", "city": "Kabupaten Tangerang", "province": "Banten" },
  { "district": "Curug", "city": "Kabupaten Tangerang", "province": "Banten" },
  { "district": "Cikupa", "city": "Kabupaten Tangerang", "province": "Banten" },
  { "district": "Serpong", "city": "Tangerang Selatan", "province": "Banten" },
  { "district": "Serpong Utara", "city": "Tangerang Selatan", "province": "Banten" },
  { "district": "Pondok Aren", "city": "Tangerang Selatan", "province": "Banten" },
  { "district": "Ciputat", "city": "Tangerang Selatan", "province": "Banten" },
  { "district": "Pinang", "city": "Kota Tangerang", "province": "Banten" },
  { "district": "Cibodas", "city": "Kota Tangerang", "province": "Banten" },
  { "district": "Cilegon", "city": "Kota Cilegon", "province": "Banten" },
  { "district": "Bekasi Selatan", "city": "Kota Bekasi", "province": "Jawa Barat" },
  { "district": "Tambun Selatan", "city": "Kabupaten Bekasi", "province": "Jawa Barat" },
  { "district": "Cibinong", "city": "Kabupaten Bogor", "province": "Jawa Barat" },
  { "district": "Bogor Utara", "city": "Kota Bogor", "province": "Jawa Barat" },
  { "district": "Cimanggis", "city": "Kota Depok", "province": "Jawa Barat" },
  { "district": "Beji", "city": "Kota Depok", "province": "Jawa Barat" },
  { "district": "Coblong", "city": "Kota Bandung", "province": "Jawa Barat" },
  { "district": "Lengkong", "city": "Kota Bandung", "province": "Jawa Barat" },
  { "district": "Semarang Tengah", "city": "Kota Semarang", "province": "Jawa Tengah" },
  { "district": "Gubeng", "city": "Kota Surabaya", "province": "Jawa Timur" },
  { "district": "Lakarsantri", "city": "Kota Surabaya", "province": "Jawa Timur" },
  { "district": "Klojen", "city": "Kota Malang", "province": "Jawa Timur" },
  { "district": "Depok", "city": "Kabupaten Sleman", "province": "DI Yogyakarta" },
  { "district": "Kuta Utara", "city": "Kabupaten Badung", "province": "Bali" },
  { "district": "Denpasar Selatan", "city": "Kota Denpasar", "province": "Bali" },
  { "district": "Medan Baru", "city": "Kota Medan", "province": "Sumatera Utara" },
  { "district": "Alang-Alang Lebar", "city": "Kota Palembang", "province": "Sumatera Selatan" },
  { "district": "Tampan", "city": "Kota Pekanbaru", "province": "Riau" },
  { "district": "Batam Kota", "city": "Kota Batam", "province": "Kepulauan Riau" },
  { "district": "Panakkukang", "city": "Kota Makassar", "province": "Sulawesi Selatan" },
  { "district": "Balikpapan Selatan", "city": "Kota Balikpapan", "province": "Kalimantan Timur" }
]
```

- [ ] **Step 4: Buat `lib/places/regions.ts`**

```ts
import raw from '@/data/id-regions.json';

export interface Region {
  district: string;
  city: string;
  province: string;
}

/**
 * Dataset administratif berhenti di KECAMATAN. Nama kawasan komersial
 * ("Gading Serpong", "BSD City", "Alam Sutera") bukan unit administratif dan
 * tidak akan pernah ada di sini — itulah sebabnya LocationDetail punya field
 * `area` bebas yang terpisah.
 *
 * Diimpor statis (bukan dibaca lewat fs) supaya modul ini aman dipakai dari
 * route handler tanpa menyeret node:fs.
 */
const REGIONS = raw as Region[];

/** Lipat diakritik dan rapatkan spasi supaya "Cikupa " dan "cikupa" cocok. */
const norm = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');

const HAYSTACK = REGIONS.map((r) => ({ region: r, key: norm(`${r.district} ${r.city} ${r.province}`) }));

/**
 * Kecocokan AWALAN didahulukan supaya mengetik "serpong" memunculkan kecamatan
 * Serpong sebelum kecamatan lain yang kebetulan berada di Tangerang Selatan.
 */
export function searchRegions(q: string, limit = 8): Region[] {
  const needle = norm(q);
  if (needle.length < 2) return [];

  const prefix: Region[] = [];
  const contains: Region[] = [];
  for (const { region, key } of HAYSTACK) {
    if (norm(region.district).startsWith(needle) || key.startsWith(needle)) prefix.push(region);
    else if (key.includes(needle)) contains.push(region);
    if (prefix.length >= limit) break;
  }
  return [...prefix, ...contains].slice(0, limit);
}

/** Baris kedua di combobox. */
export const formatRegion = (r: Region): string => `${r.district}, ${r.city}, ${r.province}`;

/**
 * String tampilan yang disimpan ke `project.location`. Kawasan didahulukan
 * karena itulah yang dikenali pembeli; provinsi dibuang supaya baris subjudul
 * hero tidak kepanjangan di lebar 390px.
 */
export function composeLocationLabel(d: {
  area: string; district: string; city: string; province: string;
}): string {
  return [d.area, d.district, d.city].map((s) => s.trim()).filter(Boolean).join(', ');
}
```

Pastikan impor JSON diizinkan:

```bash
grep -n "resolveJsonModule" tsconfig.json
```

Kalau tidak ada, tambahkan `"resolveJsonModule": true` ke `compilerOptions`.

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/places.test.ts`
Expected: PASS, 11 tes.

- [ ] **Step 6: Commit**

```bash
git add data/id-regions.json lib/places/regions.ts tests/unit/places.test.ts tsconfig.json
git commit -m "feat(brief): dataset wilayah offline + searchRegions"
```

---

### Task 8: Route `GET /api/places`

**Files:**
- Create: `app/api/places/route.ts`
- Test: `tests/unit/places-route.test.ts`

**Interfaces:**
- Consumes: `searchRegions`, `Region` (Task 7).
- Produces: `GET /api/places?q=<kueri>` → `200 { results: Region[] }`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/places-route.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/places/route';

const call = (url: string) => GET(new Request(url));

describe('GET /api/places', () => {
  it('mengembalikan hasil untuk kueri yang cocok', async () => {
    const res = await call('http://localhost/api/places?q=kelapa%20gading');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].district).toBe('Kelapa Gading');
  });

  it('kueri kosong mengembalikan daftar kosong, bukan error', async () => {
    const res = await call('http://localhost/api/places');
    expect(res.status).toBe(200);
    expect((await res.json()).results).toEqual([]);
  });

  it('membatasi hasil ke 8', async () => {
    const res = await call('http://localhost/api/places?q=an');
    expect((await res.json()).results.length).toBeLessThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/places-route.test.ts`
Expected: FAIL — route tidak ada.

- [ ] **Step 3: Buat route handler**

```ts
import { NextResponse } from 'next/server';
import { searchRegions } from '@/lib/places/regions';

/**
 * Dataset statis, jadi tidak ada sesi maupun store yang disentuh — route ini
 * TIDAK boleh mengimpor `@/lib/data` (barrel-nya menyentuh node:fs saat modul
 * dimuat).
 *
 * Membaca `request.url` seharusnya sudah membuat route ini dinamis. Verifikasi
 * lewat tabel rute `next build` (`ƒ` dinamis vs `○` statis) — `next dev` tidak
 * akan pernah menampakkan kekeliruannya karena dev selalu re-eksekusi.
 */
export function GET(request: Request): NextResponse {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  return NextResponse.json({ results: searchRegions(q) });
}
```

- [ ] **Step 4: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/places-route.test.ts`
Expected: PASS.

- [ ] **Step 5: Verifikasi route dinamis di build**

Pastikan tidak ada `next dev` yang hidup, lalu `npm run build`. Cari `/api/places` di tabel rute; harus `ƒ`. Kalau `○`, tambahkan `export const dynamic = 'force-dynamic';` dan build ulang.

- [ ] **Step 6: Commit**

```bash
git add app/api/places tests/unit/places-route.test.ts
git commit -m "feat(brief): route GET /api/places"
```

---

### Task 9: `LocationCombobox`

**Files:**
- Create: `components/wizard/LocationCombobox.tsx`
- Modify: `components/wizard/wizard.css`
- Test: `tests/unit/location-combobox.test.tsx`

**Interfaces:**
- Consumes: `Region`, `formatRegion` (Task 7); endpoint Task 8.
- Produces: `<LocationCombobox value={LocationDetail | null} onSelect={(r: Region) => void} />`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/location-combobox.test.tsx`:

```tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationCombobox } from '@/components/wizard/LocationCombobox';

const HITS = [
  { district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten' },
  { district: 'Serpong', city: 'Tangerang Selatan', province: 'Banten' },
];

function mockFetch(results = HITS) {
  const fn = vi.fn(async () => new Response(JSON.stringify({ results }), { status: 200 }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('LocationCombobox', () => {
  it('memakai pola ARIA combobox', () => {
    mockFetch();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: /Cari kota atau kecamatan/i }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('menampilkan saran setelah mengetik dan membuka listbox', async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    await user.type(screen.getByRole('combobox'), 'serpong');
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    expect(await screen.findByText('Kelapa Dua')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('tidak memanggil endpoint untuk kueri di bawah dua huruf', async () => {
    const fn = mockFetch();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    await user.type(screen.getByRole('combobox'), 'k');
    await new Promise((r) => setTimeout(r, 350));
    expect(fn).not.toHaveBeenCalled();
  });

  it('memanggil onSelect dan menutup listbox saat saran diklik', async () => {
    mockFetch();
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={onSelect} />);
    await user.type(screen.getByRole('combobox'), 'serpong');
    await user.click(await screen.findByText('Serpong'));
    expect(onSelect).toHaveBeenCalledWith(HITS[1]);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('panah bawah lalu Enter memilih saran tanpa memindahkan fokus dari input', async () => {
    mockFetch();
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'serpong');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(HITS[0]);
    expect(input).toHaveFocus();
  });

  it('Escape menutup listbox', async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<LocationCombobox value={null} onSelect={vi.fn()} />);
    await user.type(screen.getByRole('combobox'), 'serpong');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('menampilkan lokasi terpilih sebagai ringkasan', () => {
    mockFetch();
    render(
      <LocationCombobox
        value={{ area: 'Gading Serpong', district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten', address: '' }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Kelapa Dua, Kabupaten Tangerang, Banten')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/location-combobox.test.tsx`
Expected: FAIL — komponen tidak ada.

- [ ] **Step 3: Buat komponen**

```tsx
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { formatRegion, type Region } from '@/lib/places/regions';
import type { LocationDetail } from '@/lib/data/types';

interface LocationComboboxProps {
  value: LocationDetail | null;
  onSelect: (region: Region) => void;
}

/**
 * Combobox ARIA yang ditulis sendiri, BUKAN Radix Popover — dua alasan:
 * @radix-ui/react-popover tidak terpasang, dan Popover memindahkan fokus ke
 * dalam kontennya, kebalikan dari yang dibutuhkan combobox (fokus wajib TETAP
 * di input supaya pengetikan berlanjut). Radix tidak punya primitif combobox.
 *
 * Navigasi keyboard memakai aria-activedescendant, bukan roving tabindex,
 * karena fokus DOM tidak boleh berpindah ke opsi.
 */
export function LocationCombobox({ value, onSelect }: LocationComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Region[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    // Debounce 200 ms + AbortController: tanpa abort, respons lambat untuk
    // kueri lama bisa mendarat SETELAH respons kueri baru dan menimpa hasilnya.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const body = (await res.json()) as { results: Region[] };
        setResults(body.results);
        setOpen(body.results.length > 0);
        setActive(-1);
      } catch {
        // Abort atau jaringan mati: biarkan hasil lama, jangan menampilkan error
        // di tengah pengetikan. Lokasi tetap bisa diketik di field kawasan.
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  function choose(region: Region) {
    onSelect(region);
    setQuery('');
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setOpen(false); setActive(-1); return; }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i <= 0 ? results.length - 1 : i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[active >= 0 ? active : 0]); }
  }

  return (
    <div className="wz-combo">
      <label className="ds-field__label" htmlFor={`${listId}-input`}>
        Cari kota atau kecamatan
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        className="ds-field__input"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
        placeholder="Contoh: Gading Serpong, Tangerang"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        // Blur ditunda supaya klik pada opsi sempat terdaftar sebelum listbox
        // dilepas dari DOM.
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />

      {open ? (
        <ul className="wz-combo__list" id={listId} role="listbox" aria-label="Saran lokasi">
          {results.map((r, i) => (
            <li
              key={`${r.district}-${r.city}`}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={`wz-combo__opt${i === active ? ' is-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(r)}
            >
              <MapPin size={14} aria-hidden="true" />
              <span>
                <span className="wz-combo__name">{r.district}</span>
                <span className="wz-combo__meta">{r.city}, {r.province}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {value ? (
        <p className="wz-combo__picked">
          <MapPin size={14} aria-hidden="true" /> {formatRegion(value)}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Tambahkan gaya**

Di akhir `components/wizard/wizard.css`:

```css
.wz-combo { position: relative; display: flex; flex-direction: column; gap: 6px; }

.wz-combo__list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  margin: 4px 0 0;
  padding: 4px;
  list-style: none;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: var(--elev-2);
  max-height: 280px;
  overflow-y: auto;
}

.wz-combo__opt {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.wz-combo__opt:hover,
.wz-combo__opt.is-active { background: var(--wash); }

.wz-combo__name { display: block; font-weight: 500; }
.wz-combo__meta { display: block; font-size: 13px; color: var(--sage); }

.wz-combo__picked {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: var(--sage);
}
```

Kalau salah satu nama token (`--paper`, `--line`, `--wash`, `--sage`, `--elev-2`, `--radius-md`, `--radius-sm`) tidak ada, cari padanannya di `components/wizard/wizard.css` yang sudah ada dan pakai yang itu. **Jangan menulis nilai warna literal.**

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/location-combobox.test.tsx`
Expected: PASS, 7 tes.

- [ ] **Step 6: Commit**

```bash
git add components/wizard/LocationCombobox.tsx components/wizard/wizard.css tests/unit/location-combobox.test.tsx
git commit -m "feat(brief): LocationCombobox dengan pola ARIA combobox"
```

---

### Task 10: Wizard step 1 — basic info

**Files:**
- Modify: `components/wizard/CreateProjectWizard.tsx`
- Modify: `app/(dashboard)/projects/new/page.tsx`
- Modify: `components/wizard/wizard.css`
- Modify: `tests/unit/create-project-wizard.test.tsx`

**Interfaces:**
- Consumes: `LocationCombobox` (Task 9), `composeLocationLabel` (Task 7), `PROJECT_TYPES`/`PROJECT_TYPE_LABELS` (Task 1), preset lewat action (Task 6).
- Produces: `CreateProjectWizard` menerima prop `developers?: string[]`; state `form` bertambah `projectType` dan `brief`.

- [ ] **Step 1: Tulis tes yang gagal**

Ganti keenam kemunculan `'Fasilitas dan media'` (baris 53, 80, 86, 101, 111, 124) menjadi `'Materi landing page'`, lalu tambahkan di akhir file:

```tsx
describe('CreateProjectWizard — step 1 basic info', () => {
  it('menyimpan tipe project yang dipilih', async () => {
    const user = userEvent.setup();
    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Tipe');
    await user.click(screen.getByRole('button', { name: 'Kavling' }));
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Materi landing page');

    const projects = await db.projects.list('usr_wizard');
    expect(projects.find((p) => p.name === 'Cluster Tipe')?.projectType).toBe('kavling');
  });

  it('memilih lokasi dari combobox menurunkan project.location', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ results: [{ district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten' }] }),
      { status: 200 },
    )));
    const user = userEvent.setup();
    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Lokasi');
    await user.type(screen.getByRole('combobox', { name: /Cari kota atau kecamatan/i }), 'kelapa');
    await user.click(await screen.findByText('Kelapa Dua'));
    await user.type(screen.getByLabelText(/Nama kawasan/), 'Gading Serpong');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Materi landing page');

    const projects = await db.projects.list('usr_wizard');
    const saved = projects.find((p) => p.name === 'Cluster Lokasi');
    expect(saved?.location).toBe('Gading Serpong, Kelapa Dua, Kabupaten Tangerang');
    expect(saved?.brief.location?.province).toBe('Banten');
    vi.unstubAllGlobals();
  });

  it('mengganti tipe project MEMINTA KONFIRMASI sebelum menyusun ulang section', async () => {
    const user = userEvent.setup();
    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Konfirmasi');
    await user.click(screen.getByRole('button', { name: 'Perumahan' }));
    await user.click(screen.getByRole('button', { name: 'Kavling' }));

    expect(screen.getByText('Sesuaikan section untuk tipe project ini?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pertahankan pilihan saya' }));
    expect(screen.queryByText('Sesuaikan section untuk tipe project ini?')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/create-project-wizard.test.tsx`
Expected: FAIL — heading belum berubah, chip tipe belum ada.

- [ ] **Step 3: Perluas state wizard**

```tsx
export function CreateProjectWizard({ developers = [] }: { developers?: string[] }) {
```

```tsx
  const [form, setForm] = useState({
    name: '', location: '', developer: '', description: '',
    facilities: [] as string[],
    projectType: null as ProjectType | null,
    brief: emptyBrief() as ProjectBrief,
  });
  /** Tipe yang menunggu konfirmasi karena penerapannya menyusun ulang section. */
  const [typeConfirm, setTypeConfirm] = useState<ProjectType | null>(null);
```

Tambahkan helper di bawah `set`:

```tsx
  const setBrief = (patch: Partial<ProjectBrief>) =>
    setForm((f) => ({ ...f, brief: { ...f.brief, ...patch } }));

  /**
   * Tipe pertama kali dipilih: terapkan langsung, belum ada apa pun untuk
   * ditimpa. MENGGANTI tipe menyusun ulang flag section, jadi harus bertanya —
   * pola yang sama dengan "Terapkan urutan bawaan tema ini?" di editor.
   */
  function chooseType(next: ProjectType) {
    if (form.projectType && form.projectType !== next) setTypeConfirm(next);
    else set({ projectType: next });
  }

  function pickRegion(r: { district: string; city: string; province: string }) {
    setForm((f) => {
      const area = f.brief.location?.area ?? '';
      const address = f.brief.location?.address ?? '';
      const location = { ...r, area, address };
      return { ...f, brief: { ...f.brief, location }, location: composeLocationLabel(location) };
    });
  }

  function setArea(area: string) {
    setForm((f) => {
      const base = f.brief.location ?? { area: '', district: '', city: '', province: '', address: '' };
      const next = { ...base, area };
      return { ...f, brief: { ...f.brief, location: next }, location: composeLocationLabel(next) };
    });
  }
```

Import tambahan:

```tsx
import { emptyBrief } from '@/lib/data/types';
import type { ProjectBrief, ProjectType } from '@/lib/data/types';
import { PROJECT_TYPES, PROJECT_TYPE_LABELS } from '@/lib/schemas';
import { composeLocationLabel } from '@/lib/places/regions';
import { LocationCombobox } from './LocationCombobox';
```

- [ ] **Step 4: Ganti isi step 1**

```tsx
        {step === 1 ? (
          <>
            <h2 className="lw-h3">Basic info</h2>
            <Input
              label="Nama project" required value={form.name}
              placeholder="Contoh: ParkSpring Gading"
              error={errors.name?.[0]}
              onChange={(e) => set({ name: e.target.value })}
            />

            <div>
              <span className="lw-label">Tipe project</span>
              <div className="wz__chips">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t} type="button" className="wz__chip"
                    aria-pressed={form.projectType === t}
                    onClick={() => chooseType(t)}
                  >
                    <Chip tone={form.projectType === t ? 'accent' : 'outline'} size="md">
                      {PROJECT_TYPE_LABELS[t]}
                    </Chip>
                  </button>
                ))}
              </div>
            </div>

            {typeConfirm ? (
              <div className="wz__confirm" role="group" aria-label="Konfirmasi tipe project">
                <p className="lw-label-sm">Sesuaikan section untuk tipe project ini?</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button
                    variant="primary" size="sm"
                    onClick={() => { set({ projectType: typeConfirm }); setTypeConfirm(null); }}
                  >
                    Sesuaikan section
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setTypeConfirm(null)}>
                    Pertahankan pilihan saya
                  </Button>
                </div>
              </div>
            ) : null}

            <LocationCombobox value={form.brief.location} onSelect={pickRegion} />
            <Input
              label="Nama kawasan"
              hint="Opsional. Kawasan seperti Gading Serpong atau BSD City tidak ada di data wilayah resmi."
              placeholder="Contoh: Gading Serpong"
              value={form.brief.location?.area ?? ''}
              onChange={(e) => setArea(e.target.value)}
            />

            <Input
              label="Developer" list="wz-developers"
              placeholder="Contoh: Summarecon Agung"
              value={form.developer}
              onChange={(e) => set({ developer: e.target.value })}
            />
            <datalist id="wz-developers">
              {developers.map((d) => <option key={d} value={d} />)}
            </datalist>

            <Input
              label="Ceritakan singkat tentang project ini" textarea rows={3}
              placeholder="Contoh: Perumahan modern di Gading Serpong dengan akses tol dekat, fasilitas lengkap, dan pilihan tipe rumah 2–3 lantai."
              hint="Tidak perlu membuat copywriting. Tulis informasi seadanya, kami yang menyusunnya jadi copy marketing."
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </>
        ) : null}
```

- [ ] **Step 5: Sediakan daftar developer dari Server Component**

`CreateProjectWizard` adalah Client Component dan tidak boleh menyentuh `db`. Di `app/(dashboard)/projects/new/page.tsx`, pertahankan isi halaman yang sudah ada dan sisipkan pengambilan data:

```tsx
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { CreateProjectWizard } from '@/components/wizard/CreateProjectWizard';

export default async function NewProjectPage() {
  const userId = await requireSessionUserId();
  const projects = await db.projects.list(userId);
  // Autocomplete dari data yang PERNAH dimasukkan user sendiri — tanpa master
  // data developer, yang sengaja di luar scope MVP.
  const developers = [...new Set(projects.map((p) => p.developer).filter(Boolean))].sort();

  return <CreateProjectWizard developers={developers} />;
}
```

- [ ] **Step 6: Tambahkan gaya konfirmasi**

```css
.wz__confirm {
  padding: 12px 14px;
  background: var(--wash);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}
```

- [ ] **Step 7: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/create-project-wizard.test.tsx`
Expected: PASS — termasuk keenam tes lama setelah rename heading.

- [ ] **Step 8: Commit**

```bash
git add components/wizard "app/(dashboard)/projects/new/page.tsx" tests/unit/create-project-wizard.test.tsx
git commit -m "feat(brief): wizard step 1 — tipe project, lokasi terstruktur, developer autocomplete"
```

---

### Task 11: Step 2 — `SectionPlanner`

**Files:**
- Create: `components/wizard/SectionPlanner.tsx`
- Modify: `components/wizard/CreateProjectWizard.tsx`
- Modify: `lib/schemas/project.ts` (izinkan `blocks` di draft)
- Modify: `components/wizard/wizard.css`
- Test: `tests/unit/section-planner.test.tsx`

**Interfaces:**
- Consumes: `applySectionPreset` (Task 6); `BLOCK_LABELS`, `Block`, `BlockType`, `toggleBlock`, `defaultBlocksForTheme` dari `@/lib/landing/blocks`; `ProjectBrief` (Task 1).
- Produces: `<SectionPlanner blocks brief projectType onToggle onUsePreset onNote panelFor />`. Prop `panelFor?: (type: BlockType) => ReactNode` adalah tempat Task 12 menyisipkan panel materi.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/section-planner.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionPlanner } from '@/components/wizard/SectionPlanner';
import { defaultBlocksForTheme } from '@/lib/landing/blocks';
import { emptyBrief } from '@/lib/data/types';

const props = (over: Partial<React.ComponentProps<typeof SectionPlanner>> = {}) => ({
  blocks: defaultBlocksForTheme('tropicalWarm'),
  brief: emptyBrief(),
  projectType: 'perumahan' as const,
  onToggle: vi.fn(),
  onUsePreset: vi.fn(),
  onNote: vi.fn(),
  ...over,
});

describe('SectionPlanner', () => {
  it('menampilkan satu baris per section dengan label yang manusiawi', () => {
    render(<SectionPlanner {...props()} />);
    expect(screen.getByRole('checkbox', { name: 'Fasilitas' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Harga & Promo' })).toBeInTheDocument();
  });

  it('SEMUA panel terkuncup saat pertama dibuka — progressive disclosure', () => {
    render(<SectionPlanner {...props()} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('mengklik baris membuka panelnya, mengklik lagi menutupnya', async () => {
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ panelFor: (t) => (t === 'facilities' ? <p>Panel fasilitas</p> : null) })} />);
    await user.click(screen.getByRole('button', { name: /Buka materi Fasilitas/i }));
    expect(screen.getByText('Panel fasilitas')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Tutup materi Fasilitas/i }));
    expect(screen.queryByText('Panel fasilitas')).not.toBeInTheDocument();
  });

  it('checkbox memanggil onToggle dengan id blok, bukan tipenya', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ onToggle })} />);
    await user.click(screen.getByRole('checkbox', { name: 'FAQ' }));
    expect(onToggle).toHaveBeenCalledWith('blk_faq');
  });

  it('"Gunakan rekomendasi" memanggil onUsePreset', async () => {
    const onUsePreset = vi.fn();
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ onUsePreset })} />);
    await user.click(screen.getByRole('button', { name: 'Gunakan rekomendasi' }));
    expect(onUsePreset).toHaveBeenCalled();
  });

  it('section tanpa panel khusus tetap punya satu baris catatan bebas', async () => {
    const onNote = vi.fn();
    const user = userEvent.setup();
    render(<SectionPlanner {...props({ onNote })} />);
    await user.click(screen.getByRole('button', { name: /Buka materi Galeri/i }));
    await user.type(screen.getByLabelText(/Catatan untuk Galeri/i), 'lima foto drone');
    expect(onNote.mock.calls.at(-1)?.[0]).toBe('gallery');
  });

  it('meringkas materi yang sudah dimiliki agen', () => {
    const brief = {
      ...emptyBrief(),
      nearby: [{ category: 'tol' as const, name: 'Tol', minutes: 5 }],
      highlights: ['Bebas banjir'],
      facilities: [{ name: 'Clubhouse', desc: '', mediaIds: [] }],
      location: { area: 'Gading Serpong', district: 'Kelapa Dua', city: 'Kab. Tangerang', province: 'Banten', address: '' },
    };
    render(<SectionPlanner {...props({ brief })} />);
    expect(screen.getByText(/1 tempat terdekat/)).toBeInTheDocument();
    expect(screen.getByText(/1 keunggulan/)).toBeInTheDocument();
    expect(screen.getByText(/1 fasilitas/)).toBeInTheDocument();
    expect(screen.getByText(/Foto diunggah di halaman project/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/section-planner.test.tsx`
Expected: FAIL — komponen tidak ada.

- [ ] **Step 3: Buat komponen**

```tsx
'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button, Input } from '@/components/ds';
import { BLOCK_LABELS, type Block, type BlockType } from '@/lib/landing/blocks';
import type { ProjectBrief, ProjectType } from '@/lib/data/types';

interface SectionPlannerProps {
  blocks: Block[];
  brief: ProjectBrief;
  projectType: ProjectType | null;
  onToggle: (blockId: string) => void;
  onUsePreset: () => void;
  onNote: (type: BlockType, text: string) => void;
  /** Panel materi khusus. Section tanpa panel jatuh ke baris catatan bebas. */
  panelFor?: (type: BlockType) => ReactNode;
}

/**
 * Content Planner, BUKAN page builder. Yang sengaja TIDAK ada di sini:
 * reorder section (urutan milik tema), field copy per blok (tidak ada input
 * "Hero Title"), dan apa pun yang menyentuh tampilan. Kalau salah satunya
 * muncul, batas yang membedakan planner dari editor sudah bocor.
 */
export function SectionPlanner({
  blocks, brief, projectType, onToggle, onUsePreset, onNote, panelFor,
}: SectionPlannerProps) {
  const [openType, setOpenType] = useState<BlockType | null>(null);

  const summary = [
    brief.location ? 'Lokasi sudah ditentukan' : null,
    brief.nearby.length ? `${brief.nearby.length} tempat terdekat` : null,
    brief.highlights.length ? `${brief.highlights.length} keunggulan` : null,
    brief.facilities.length ? `${brief.facilities.length} fasilitas` : null,
    brief.promo ? '1 materi promo' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="wz-plan">
      <div className="wz-plan__head">
        <p style={{ fontSize: 14, color: 'var(--sage)' }}>
          Beritahu kami apa yang Anda punya. Kami yang menyusunnya menjadi landing page.
        </p>
        {projectType ? (
          <Button variant="secondary" size="sm" onClick={onUsePreset}>
            Gunakan rekomendasi
          </Button>
        ) : null}
      </div>

      <ul className="wz-plan__list">
        {blocks.map((b) => {
          const open = openType === b.type;
          const panel = panelFor?.(b.type) ?? null;
          return (
            <li key={b.id} className="wz-plan__row">
              <div className="wz-plan__bar">
                <label className="wz-plan__check">
                  <input type="checkbox" checked={b.enabled} onChange={() => onToggle(b.id)} />
                  <span>{BLOCK_LABELS[b.type]}</span>
                </label>
                <button
                  type="button"
                  className="wz-plan__toggle"
                  aria-expanded={open}
                  aria-label={`${open ? 'Tutup' : 'Buka'} materi ${BLOCK_LABELS[b.type]}`}
                  onClick={() => setOpenType(open ? null : b.type)}
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              </div>

              {open ? (
                <div className="wz-plan__panel" role="region" aria-label={`Materi ${BLOCK_LABELS[b.type]}`}>
                  {panel ?? (
                    <Input
                      label={`Catatan untuk ${BLOCK_LABELS[b.type]}`}
                      hint="Opsional. Ditulis seadanya — ini bahan untuk AI, bukan teks yang tampil."
                      value={brief.notes[b.type] ?? ''}
                      onChange={(e) => onNote(b.type, e.target.value)}
                    />
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="wz-plan__summary">
        <span className="lw-label-sm">Materi yang Anda punya</span>
        <p style={{ fontSize: 14 }}>{summary.length ? summary.join(' · ') : 'Belum ada materi. Tidak masalah.'}</p>
        <p style={{ fontSize: 13, color: 'var(--sage)' }}>Foto diunggah di halaman project.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Sambungkan ke wizard**

Tambahkan state blok:

```tsx
  const [blocks, setBlocks] = useState<Block[]>(() => defaultBlocksForTheme(DEFAULT_THEME));
```

Ganti isi step 2:

```tsx
        {step === 2 ? (
          <>
            <h2 className="lw-h3">Materi landing page</h2>
            <SectionPlanner
              blocks={blocks}
              brief={form.brief}
              projectType={form.projectType}
              onToggle={(id) => setBlocks((b) => toggleBlock(b, id))}
              onUsePreset={() => setBlocks((b) => applySectionPreset(b, form.projectType))}
              onNote={(type, text) =>
                setBrief({ notes: { ...form.brief.notes, [type]: text || undefined } })
              }
            />
          </>
        ) : null}
```

Import tambahan:

```tsx
import { defaultBlocksForTheme, toggleBlock, type Block } from '@/lib/landing/blocks';
import { DEFAULT_THEME } from '@/lib/landing/themeNames';
import { applySectionPreset } from '@/lib/landing/sectionPreset';
import { SectionPlanner } from './SectionPlanner';
```

Kirim `blocks` ke server. Di `next()`:

```tsx
      const payload = { ...form, blocks };
      const result = projectId
        ? await updateProjectAction(projectId, payload)
        : await createProjectAction(payload);
```

Dan izinkan `blocks` lewat validasi — di `lib/schemas/project.ts`, tambahkan ke `ProjectDraftSchema`:

```ts
  // Blok divalidasi longgar di sini: bentuk penuhnya dijaga tipe Block di klien
  // dan defaultBlocksForTheme di repo. Yang penting wizard boleh mengirimkan
  // flag enabled yang sudah disetel agen.
  blocks: z.array(z.object({ id: z.string(), type: z.string(), enabled: z.boolean() }).passthrough()).optional(),
```

- [ ] **Step 5: Tambahkan gaya**

```css
.wz-plan { display: flex; flex-direction: column; gap: 14px; }
.wz-plan__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.wz-plan__list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-md); }
.wz-plan__row + .wz-plan__row { border-top: 1px solid var(--line); }
.wz-plan__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; }
.wz-plan__check { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.wz-plan__toggle { display: flex; padding: 4px; border: 0; background: none; cursor: pointer; color: var(--sage); }
.wz-plan__toggle[aria-expanded='true'] svg { transform: rotate(180deg); }
.wz-plan__panel { display: flex; flex-direction: column; gap: 12px; padding: 4px 12px 14px; }
.wz-plan__summary { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; background: var(--wash); border-radius: var(--radius-md); }
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/section-planner.test.tsx tests/unit/create-project-wizard.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/wizard lib/schemas/project.ts tests/unit/section-planner.test.tsx
git commit -m "feat(brief): step 2 jadi Content Planner"
```

---

### Task 12: Lima panel materi

**Files:**
- Create: `components/wizard/panels/HeroPanel.tsx`, `HighlightsPanel.tsx`, `FacilitiesPanel.tsx`, `LocationPanel.tsx`, `PromoPanel.tsx`
- Modify: `components/wizard/CreateProjectWizard.tsx` (sambungkan `panelFor`)
- Modify: `components/wizard/wizard.css`
- Test: `tests/unit/material-panels.test.tsx`

**Interfaces:**
- Consumes: `ProjectBrief`, `NearbyItem`, `NearbyCategory`, `BriefPromo`, `CtaGoal`, `HeroEmphasis` (Task 1); `NEARBY_CATEGORIES`, `NEARBY_CATEGORY_LABELS`, `FACILITY_OPTIONS`; `formatRegion` (Task 7).
- Produces: `PanelProps = { brief: ProjectBrief; onChange: (patch: Partial<ProjectBrief>) => void }` diekspor **sekali** dari `HeroPanel.tsx` dan diimpor keempat panel lain; lima komponen bernama sesuai filenya.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/unit/material-panels.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { emptyBrief } from '@/lib/data/types';
import { HeroPanel } from '@/components/wizard/panels/HeroPanel';
import { HighlightsPanel } from '@/components/wizard/panels/HighlightsPanel';
import { FacilitiesPanel } from '@/components/wizard/panels/FacilitiesPanel';
import { LocationPanel } from '@/components/wizard/panels/LocationPanel';
import { PromoPanel } from '@/components/wizard/panels/PromoPanel';

describe('HeroPanel', () => {
  it('memilih penekanan hero', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HeroPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Promo' }));
    expect(onChange).toHaveBeenCalledWith({ heroEmphasis: 'promo' });
  });

  it('tujuan CTA bisa lebih dari satu', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HeroPanel brief={{ ...emptyBrief(), ctaGoals: ['whatsapp'] }} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Lihat tipe unit' }));
    expect(onChange).toHaveBeenCalledWith({ ctaGoals: ['whatsapp', 'lihatTipe'] });
  });
});

describe('HighlightsPanel', () => {
  it('menambah baris keunggulan kosong', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HighlightsPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Tambah keunggulan' }));
    expect(onChange).toHaveBeenCalledWith({ highlights: [''] });
  });

  it('menghapus baris pada indeksnya', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HighlightsPanel brief={{ ...emptyBrief(), highlights: ['A', 'B'] }} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Hapus keunggulan 1' }));
    expect(onChange).toHaveBeenCalledWith({ highlights: ['B'] });
  });
});

describe('FacilitiesPanel', () => {
  it('chip preset menambah fasilitas bernama', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FacilitiesPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Kolam renang' }));
    expect(onChange).toHaveBeenCalledWith({
      facilities: [{ name: 'Kolam renang', desc: '', mediaIds: [] }],
    });
  });

  it('chip yang sudah aktif melepas fasilitasnya', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FacilitiesPanel
        brief={{ ...emptyBrief(), facilities: [{ name: 'Kolam renang', desc: '', mediaIds: [] }] }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Kolam renang' }));
    expect(onChange).toHaveBeenCalledWith({ facilities: [] });
  });

  it('menambah fasilitas custom di luar daftar preset', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FacilitiesPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Tambah fasilitas' }));
    expect(onChange).toHaveBeenCalledWith({ facilities: [{ name: '', desc: '', mediaIds: [] }] });
  });
});

describe('LocationPanel', () => {
  it('menambah baris nearby dengan menit kosong', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LocationPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Tambah tempat terdekat' }));
    expect(onChange).toHaveBeenCalledWith({ nearby: [{ category: 'tol', name: '', minutes: null }] });
  });

  it('menit yang dikosongkan disimpan sebagai null, BUKAN nol', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <LocationPanel
        brief={{ ...emptyBrief(), nearby: [{ category: 'tol', name: 'Tol', minutes: 5 }] }}
        onChange={onChange}
      />,
    );
    await user.clear(screen.getByLabelText('Menit 1'));
    expect(onChange).toHaveBeenCalledWith({ nearby: [{ category: 'tol', name: 'Tol', minutes: null }] });
  });

  it('memberi tahu bahwa tempat tanpa menit tidak jadi kartu akses', () => {
    render(
      <LocationPanel
        brief={{ ...emptyBrief(), nearby: [{ category: 'sekolah', name: 'Sekolah', minutes: null }] }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/tidak tampil sebagai kartu akses/i)).toBeInTheDocument();
  });
});

describe('PromoPanel', () => {
  it('mencentang "Ada promo" membuat objek promo kosong', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PromoPanel brief={emptyBrief()} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Ada promo' }));
    expect(onChange).toHaveBeenCalledWith({
      promo: { name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '' },
    });
  });

  it('melepas centang membuang promo sepenuhnya', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PromoPanel
        brief={{ ...emptyBrief(), promo: { name: 'X', items: [], detail: '', validUntil: null, dpText: '', installmentText: '' } }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: 'Ada promo' }));
    expect(onChange).toHaveBeenCalledWith({ promo: null });
  });

  it('butir promo dipisah per baris', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PromoPanel
        brief={{ ...emptyBrief(), promo: { name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '' } }}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByLabelText('Butir promo'), 'Free BPHTB');
    expect(onChange.mock.calls.at(-1)?.[0].promo.items).toEqual(['Free BPHTB']);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npx vitest run tests/unit/material-panels.test.tsx`
Expected: FAIL — kelima modul tidak ada.

- [ ] **Step 3: Buat `HeroPanel.tsx`**

```tsx
'use client';

import type { CtaGoal, HeroEmphasis, ProjectBrief } from '@/lib/data/types';

export interface PanelProps {
  brief: ProjectBrief;
  onChange: (patch: Partial<ProjectBrief>) => void;
}

const EMPHASIS: { value: HeroEmphasis; label: string }[] = [
  { value: 'promo', label: 'Promo' },
  { value: 'lokasi', label: 'Keunggulan lokasi' },
  { value: 'konsep', label: 'Konsep hunian' },
  { value: 'harga', label: 'Harga' },
];

const GOALS: { value: CtaGoal; label: string }[] = [
  { value: 'whatsapp', label: 'Chat WhatsApp' },
  { value: 'lihatTipe', label: 'Lihat tipe unit' },
  { value: 'lihatPromo', label: 'Lihat promo' },
  { value: 'form', label: 'Isi form' },
];

/**
 * Mengumpulkan INTENT, bukan copy. Tidak ada input judul atau subjudul di sini
 * — itu pekerjaan AI, dan editor yang menyuntingnya setelah generate.
 */
export function HeroPanel({ brief, onChange }: PanelProps) {
  const toggleGoal = (g: CtaGoal) =>
    onChange({
      ctaGoals: brief.ctaGoals.includes(g)
        ? brief.ctaGoals.filter((x) => x !== g)
        : [...brief.ctaGoals, g],
    });

  return (
    <>
      <fieldset className="wz-panel__set">
        <legend className="lw-label">Apa yang ingin ditonjolkan?</legend>
        {EMPHASIS.map((e) => (
          <label key={e.value} className="wz-panel__opt">
            <input
              type="radio" name="heroEmphasis" value={e.value}
              checked={brief.heroEmphasis === e.value}
              onChange={() => onChange({ heroEmphasis: e.value })}
            />
            <span>{e.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="wz-panel__set">
        <legend className="lw-label">Apa yang ingin dilakukan calon pembeli?</legend>
        {GOALS.map((g) => (
          <label key={g.value} className="wz-panel__opt">
            <input type="checkbox" checked={brief.ctaGoals.includes(g.value)} onChange={() => toggleGoal(g.value)} />
            <span>{g.label}</span>
          </label>
        ))}
      </fieldset>
    </>
  );
}
```

- [ ] **Step 4: Buat `HighlightsPanel.tsx`**

```tsx
'use client';

import { Button, Input } from '@/components/ds';
import type { PanelProps } from './HeroPanel';

/**
 * Keunggulan BEDA dari fasilitas: "bebas banjir", "one gate system",
 * "potensi investasi" — klaim tentang kawasan, bukan benda di dalamnya.
 * Ini bahan yang membuat sellingPoints AI ter-grounding.
 */
export function HighlightsPanel({ brief, onChange }: PanelProps) {
  const set = (i: number, value: string) => {
    const next = [...brief.highlights];
    next[i] = value;
    onChange({ highlights: next });
  };

  return (
    <>
      {brief.highlights.map((h, i) => (
        <div key={i} className="wz-panel__row">
          <Input
            label={`Keunggulan ${i + 1}`}
            placeholder="Contoh: Bebas banjir"
            value={h}
            onChange={(e) => set(i, e.target.value)}
          />
          <Button
            variant="link" size="sm"
            aria-label={`Hapus keunggulan ${i + 1}`}
            onClick={() => onChange({ highlights: brief.highlights.filter((_, j) => j !== i) })}
          >
            Hapus
          </Button>
        </div>
      ))}
      <Button variant="link" size="sm" onClick={() => onChange({ highlights: [...brief.highlights, ''] })}>
        Tambah keunggulan
      </Button>
    </>
  );
}
```

- [ ] **Step 5: Buat `FacilitiesPanel.tsx`**

```tsx
'use client';

import { Button, Chip, Input } from '@/components/ds';
import { FACILITY_OPTIONS } from '@/lib/schemas';
import type { PanelProps } from './HeroPanel';

export function FacilitiesPanel({ brief, onChange }: PanelProps) {
  const has = (name: string) => brief.facilities.some((f) => f.name === name);

  const togglePreset = (name: string) =>
    onChange({
      facilities: has(name)
        ? brief.facilities.filter((f) => f.name !== name)
        : [...brief.facilities, { name, desc: '', mediaIds: [] }],
    });

  const set = (i: number, patch: Partial<{ name: string; desc: string }>) => {
    const next = [...brief.facilities];
    next[i] = { ...next[i], ...patch };
    onChange({ facilities: next });
  };

  return (
    <>
      <div>
        <span className="lw-label">Fasilitas yang tersedia</span>
        <div className="wz__chips">
          {FACILITY_OPTIONS.map((name) => (
            <button key={name} type="button" className="wz__chip" aria-pressed={has(name)} onClick={() => togglePreset(name)}>
              <Chip tone={has(name) ? 'accent' : 'outline'} size="md">{name}</Chip>
            </button>
          ))}
        </div>
      </div>

      {brief.facilities.map((f, i) => (
        <div key={i} className="wz-panel__row">
          <Input label={`Nama fasilitas ${i + 1}`} value={f.name} onChange={(e) => set(i, { name: e.target.value })} />
          <Input label={`Keterangan ${i + 1}`} placeholder="Opsional" value={f.desc} onChange={(e) => set(i, { desc: e.target.value })} />
          <Button
            variant="link" size="sm"
            aria-label={`Hapus fasilitas ${i + 1}`}
            onClick={() => onChange({ facilities: brief.facilities.filter((_, j) => j !== i) })}
          >
            Hapus
          </Button>
        </div>
      ))}

      <Button
        variant="link" size="sm"
        onClick={() => onChange({ facilities: [...brief.facilities, { name: '', desc: '', mediaIds: [] }] })}
      >
        Tambah fasilitas
      </Button>
      <p style={{ fontSize: 13, color: 'var(--sage)' }}>Foto per fasilitas diunggah di halaman project.</p>
    </>
  );
}
```

- [ ] **Step 6: Buat `LocationPanel.tsx`**

```tsx
'use client';

import { Button, Input } from '@/components/ds';
import { NEARBY_CATEGORIES, NEARBY_CATEGORY_LABELS } from '@/lib/schemas';
import { formatRegion } from '@/lib/places/regions';
import type { NearbyCategory, NearbyItem } from '@/lib/data/types';
import type { PanelProps } from './HeroPanel';

export function LocationPanel({ brief, onChange }: PanelProps) {
  const set = (i: number, patch: Partial<NearbyItem>) => {
    const next = [...brief.nearby];
    next[i] = { ...next[i], ...patch };
    onChange({ nearby: next });
  };

  const setAddress = (address: string) =>
    onChange({
      location: { ...(brief.location ?? { area: '', district: '', city: '', province: '' }), address },
    });

  const adaTanpaMenit = brief.nearby.some((n) => n.minutes === null);

  return (
    <>
      {brief.location ? (
        <p style={{ fontSize: 14 }}>{formatRegion(brief.location)}</p>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--sage)' }}>Lokasi dipilih di langkah sebelumnya.</p>
      )}

      <Input
        label="Alamat lengkap"
        hint="Opsional. Data wilayah berhenti di kecamatan, jadi alamat jalan diketik di sini."
        placeholder="Contoh: Jl. Boulevard Raya, Kelapa Gading, Jakarta Utara 14240"
        value={brief.location?.address ?? ''}
        onChange={(e) => setAddress(e.target.value)}
      />

      <span className="lw-label">Dekat dengan</span>
      {brief.nearby.map((n, i) => (
        <div key={i} className="wz-panel__row">
          <label className="ds-field">
            <span className="ds-field__label">{`Kategori ${i + 1}`}</span>
            <select
              className="ds-field__input"
              value={n.category}
              onChange={(e) => set(i, { category: e.target.value as NearbyCategory })}
            >
              {NEARBY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{NEARBY_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </label>
          <Input label={`Nama tempat ${i + 1}`} placeholder="Contoh: Tol Jakarta–Merak" value={n.name} onChange={(e) => set(i, { name: e.target.value })} />
          <Input
            label={`Menit ${i + 1}`}
            type="number" min={1} inputMode="numeric"
            placeholder="Kosongkan jika tidak tahu"
            value={n.minutes === null ? '' : String(n.minutes)}
            // Kosong menjadi null, BUKAN 0. Nol akan tampil sebagai "0 mnt" di
            // halaman — mengarang angka persis seperti yang desain ini cegah.
            onChange={(e) => set(i, { minutes: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <Button
            variant="link" size="sm"
            aria-label={`Hapus tempat ${i + 1}`}
            onClick={() => onChange({ nearby: brief.nearby.filter((_, j) => j !== i) })}
          >
            Hapus
          </Button>
        </div>
      ))}

      <Button
        variant="link" size="sm"
        onClick={() => onChange({ nearby: [...brief.nearby, { category: 'tol', name: '', minutes: null }] })}
      >
        Tambah tempat terdekat
      </Button>

      {adaTanpaMenit ? (
        <p style={{ fontSize: 13, color: 'var(--sage)' }}>
          Tanpa waktu tempuh, tempat ini menjadi bahan tulisan dan tidak tampil sebagai kartu akses.
        </p>
      ) : null}
    </>
  );
}
```

- [ ] **Step 7: Buat `PromoPanel.tsx`**

```tsx
'use client';

import { Input } from '@/components/ds';
import type { BriefPromo } from '@/lib/data/types';
import type { PanelProps } from './HeroPanel';

const KOSONG: BriefPromo = {
  name: '', items: [], detail: '', validUntil: null, dpText: '', installmentText: '',
};

export function PromoPanel({ brief, onChange }: PanelProps) {
  const promo = brief.promo;
  const set = (patch: Partial<BriefPromo>) => onChange({ promo: { ...(promo ?? KOSONG), ...patch } });

  return (
    <>
      <label className="wz-panel__opt">
        <input
          type="checkbox"
          checked={promo !== null}
          onChange={() => onChange({ promo: promo ? null : { ...KOSONG } })}
        />
        <span>Ada promo</span>
      </label>

      {promo ? (
        <>
          <Input label="Nama promo" placeholder="Contoh: Free BPHTB" value={promo.name} onChange={(e) => set({ name: e.target.value })} />
          <Input
            label="Butir promo" textarea rows={4}
            hint="Satu butir per baris. Inilah yang tampil di halaman."
            value={promo.items.join('\n')}
            onChange={(e) => set({ items: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
          />
          <Input label="Catatan" placeholder="Contoh: Berlaku untuk pemesanan bulan ini." value={promo.detail} onChange={(e) => set({ detail: e.target.value })} />
          <Input
            label="Berlaku sampai" type="date"
            value={promo.validUntil ?? ''}
            onChange={(e) => set({ validUntil: e.target.value || null })}
          />
          <Input label="DP" placeholder="Contoh: 10%" value={promo.dpText} onChange={(e) => set({ dpText: e.target.value })} />
          <Input label="Cicilan" placeholder="Contoh: Rp 18 jt/bln" value={promo.installmentText} onChange={(e) => set({ installmentText: e.target.value })} />
        </>
      ) : null}
    </>
  );
}
```

- [ ] **Step 8: Sambungkan `panelFor` di wizard**

Tambahkan ke `<SectionPlanner ... />`:

```tsx
              panelFor={(type) => {
                const p = { brief: form.brief, onChange: setBrief };
                if (type === 'hero') return <HeroPanel {...p} />;
                if (type === 'highlights') return <HighlightsPanel {...p} />;
                if (type === 'facilities') return <FacilitiesPanel {...p} />;
                if (type === 'location') return <LocationPanel {...p} />;
                if (type === 'pricePromo') return <PromoPanel {...p} />;
                return null;
              }}
```

Import kelimanya dari `./panels/<Nama>`.

- [ ] **Step 9: Tambahkan gaya**

```css
.wz-panel__set { display: flex; flex-direction: column; gap: 6px; border: 0; margin: 0; padding: 0; }
.wz-panel__opt { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.wz-panel__row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.wz-panel__row > .ds-field { flex: 1 1 160px; }
```

- [ ] **Step 10: Jalankan tes untuk memastikan lulus**

Run: `npx vitest run tests/unit/material-panels.test.tsx tests/unit/section-planner.test.tsx`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add components/wizard tests/unit/material-panels.test.tsx
git commit -m "feat(brief): lima panel materi di Content Planner"
```

---

### Task 13: Step 3 review + perbaiki tes yang patah

**Files:**
- Modify: `components/wizard/CreateProjectWizard.tsx` (step 3)
- Modify: `tests/e2e/spine.spec.ts:18,20,89`

**Interfaces:**
- Consumes: seluruh state wizard dari Task 10–12.
- Produces: tidak ada API baru.

- [ ] **Step 1: Ganti isi step 3**

```tsx
        {step === 3 ? (
          <>
            <h2 className="lw-h3">Review</h2>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Nama project</span><span style={{ fontWeight: 500 }}>{form.name || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Tipe project</span><span>{form.projectType ? PROJECT_TYPE_LABELS[form.projectType] : '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Lokasi</span><span>{form.location || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Developer</span><span>{form.developer || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Section aktif</span><span>{blocks.filter((b) => b.enabled).length} section</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Fasilitas</span><span>{form.brief.facilities.map((f) => f.name).join(' · ') || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Tempat terdekat</span><span>{form.brief.nearby.length ? `${form.brief.nearby.length} tempat` : '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Promo</span><span>{form.brief.promo ? form.brief.promo.name || 'Ada' : '—'}</span></div>
            <p style={{ fontSize: 13, color: 'var(--sage)', marginTop: 8 }}>
              Materi yang kosong akan kami susun dari informasi yang ada.
            </p>
          </>
        ) : null}
```

- [ ] **Step 2: Perbaiki `tests/e2e/spine.spec.ts`**

Ganti baris 18–20:

```ts
  await page.getByRole('button', { name: 'Perumahan' }).click();
  await page.getByLabel(/Nama kawasan/).fill('Gading Serpong');
  await page.getByLabel('Developer').fill('Paramount Land');
  await page.getByLabel(/Ceritakan singkat/).fill('Cluster uji dengan dua tipe unit dan akses tol lima menit.');
```

Combobox sengaja **tidak** dipakai di sini: spine menguji jalur North Star, dan mengisi nama kawasan saja sudah menghasilkan `project.location` yang sah. Alur combobox diuji di Task 14.

Ganti baris 89:

```ts
  await page.getByLabel(/Ceritakan singkat/).fill('Konten diisi manual tanpa bantuan AI sama sekali.');
```

- [ ] **Step 3: Jalankan seluruh unit test**

Run: `npx vitest run`
Expected: PASS semua. Perbaiki yang merah sebelum lanjut — Task 14 menjalankan e2e yang jauh lebih lambat.

- [ ] **Step 4: Jalankan e2e yang terdampak**

Pastikan tidak ada `next dev` yang hidup:

```bash
npm run seed:reset
npx playwright test tests/e2e/spine.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/wizard/CreateProjectWizard.tsx tests/e2e/spine.spec.ts
git commit -m "feat(brief): step 3 review + perbaiki e2e yang patah karena label baru"
```

---

### Task 14: E2e alur penuh pipeline brief

**Files:**
- Create: `tests/e2e/brief-pipeline.spec.ts`

**Interfaces:**
- Consumes: seluruh Task 1–13.
- Produces: tidak ada API baru.

- [ ] **Step 1: Tulis spec e2e**

```ts
import { test, expect } from '@playwright/test';

/**
 * Membuktikan rantai penuh: materi yang diketik agen di wizard sampai ke
 * halaman publik, dan tidak ada angka menit yang dikarang untuk tempat yang
 * menitnya dikosongkan.
 *
 * Tanpa nilai absolut: suite ini serial di atas SATU mock store bersama, dan
 * spec lain menambah project/lead/visitor di store yang sama.
 */
test('materi yang diketik agen sampai ke halaman publik', async ({ page }) => {
  const nama = `Uji Brief ${Date.now()}`;

  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // Step 1 — basic info + lokasi lewat combobox
  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill(nama);
  await page.getByRole('button', { name: 'Perumahan' }).click();

  await page.getByRole('combobox', { name: /Cari kota atau kecamatan/i }).fill('kelapa dua');
  await page.getByRole('option', { name: /Kelapa Dua/ }).first().click();
  await page.getByLabel(/Nama kawasan/).fill('Gading Serpong');
  await page.getByLabel('Developer').fill('Paramount Land');
  await page.getByLabel(/Ceritakan singkat/).fill('Cluster dua lantai dengan akses tol dekat.');
  await page.getByRole('button', { name: 'Lanjut' }).click();

  // Step 2 — Content Planner
  await expect(page.getByRole('heading', { name: 'Materi landing page' })).toBeVisible();
  await page.getByRole('button', { name: 'Gunakan rekomendasi' }).click();

  // Panel Lokasi: satu tempat DENGAN menit, satu TANPA menit.
  await page.getByRole('button', { name: /Buka materi Lokasi/i }).click();
  await page.getByRole('button', { name: 'Tambah tempat terdekat' }).click();
  await page.getByLabel('Nama tempat 1').fill('Tol Jakarta–Merak');
  await page.getByLabel('Menit 1').fill('5');
  await page.getByRole('button', { name: 'Tambah tempat terdekat' }).click();
  await page.getByLabel('Nama tempat 2').fill('Sekolah Pelita Harapan');
  await expect(page.getByText(/tidak tampil sebagai kartu akses/i)).toBeVisible();
  await page.getByRole('button', { name: /Tutup materi Lokasi/i }).click();

  // Panel Promo
  await page.getByRole('button', { name: /Buka materi Harga & Promo/i }).click();
  await page.getByRole('checkbox', { name: 'Ada promo' }).check();
  await page.getByLabel('Nama promo').fill('Free BPHTB');
  await page.getByLabel('Butir promo').fill('Free BPHTB dan AJB\nCashback 5%');
  await page.getByLabel('DP').fill('10%');
  await page.getByRole('button', { name: /Tutup materi Harga & Promo/i }).click();

  await page.getByRole('button', { name: 'Lanjut' }).click();

  // Step 3 — review
  await expect(page.getByText('2 tempat')).toBeVisible();
  await page.getByRole('button', { name: 'Simpan project' }).click();
  await expect(page.getByRole('heading', { name: nama })).toBeVisible();
  const projectUrl = page.url();

  // Satu tipe rumah supaya Generate AI terbuka
  await page.getByRole('button', { name: 'Add house type' }).first().click();
  await page.getByLabel(/Nama tipe/).fill('Tipe A');
  await page.getByLabel(/Harga/).fill('1500000000');
  await page.getByLabel(/Luas tanah/).fill('72');
  await page.getByLabel(/Luas bangunan/).fill('96');
  await page.getByLabel(/Kamar tidur/).fill('3');
  await page.getByLabel(/Kamar mandi/).fill('2');
  await page.getByRole('button', { name: /Simpan tipe/i }).click();

  // Generate AI lalu publish
  await page.goto(projectUrl);
  await page.getByRole('link', { name: /Generate AI/i }).click();
  await page.getByRole('button', { name: /Generate/i }).first().click();
  await expect(page.getByText(/selesai|berhasil/i).first()).toBeVisible({ timeout: 30_000 });

  await page.goto(projectUrl);
  await page.getByRole('link', { name: /Publish/i }).click();
  await page.getByRole('button', { name: /Publikasikan/i }).click();

  // Halaman publik
  const slug = nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await page.goto(`/${slug}`);

  // Fakta agen tampil apa adanya.
  await expect(page.getByText('5 mnt')).toBeVisible();
  await expect(page.getByText('Tol Jakarta–Merak')).toBeVisible();
  await expect(page.getByText('Free BPHTB dan AJB')).toBeVisible();

  // Tempat TANPA menit tidak menjadi kartu akses — dan tidak ada satu pun angka
  // menit yang dikarang untuknya.
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  expect(body).not.toMatch(/\d+\s*mnt\s+Sekolah Pelita Harapan/);
});
```

- [ ] **Step 2: Jalankan spec ini saja**

Pastikan tidak ada `next dev` yang hidup:

```bash
npm run seed:reset
npx playwright test tests/e2e/brief-pipeline.spec.ts
```

Expected: PASS. Kalau gagal, buka `test-results/**/error-context.md` (pohon aksesibilitas saat gagal) — itu alat diagnosis tercepat, jangan menebak. Selektor yang paling mungkin meleset adalah tombol Generate, Publish, dan Simpan tipe; sesuaikan ke nama yang benar-benar ada di pohon itu, jangan mengubah yang di-assert.

- [ ] **Step 3: Jalankan verifikasi penuh**

```bash
npm run seed:reset
npm run verify
```

Expected: unit hijau, build sukses, e2e hijau. Periksa juga tabel rute build: `/api/places` harus `ƒ`.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/brief-pipeline.spec.ts
git commit -m "test(brief): e2e alur penuh — materi agen sampai ke halaman publik"
```

---

## Self-Review

**1. Cakupan spec.** Setiap bagian spec punya task: §4 → Task 1–2 · §5 → Task 3–4 · §6 → Task 5 · §7 → Task 6 · §8 → Task 10 · §9 → Task 11–12 · §10 → Task 13 · §11 → Task 7–9 · §12 → Task 2 dan 4 · §13 → seluruh task, khususnya 13–14. **Tidak ada bagian spec tanpa task.**

**2. Yang sengaja tidak dikerjakan di 3A**, sudah tercatat di spec §1 sebagai milik 3B: tab Materi, `MediaType` baru, blok `about`, label CTA sebagai data, pengisian `BriefFacility.mediaIds` (tipenya ada di Task 1, pengisinya di 3B).

**3. Konsistensi tipe lintas task.** `emptyBrief()` (Task 1 → 2, 3, 4, 5, 10, 11, 12) · `pickFirst` (Task 3) · `applySectionPreset` (Task 6 → 6, 11) · `searchRegions`/`formatRegion`/`composeLocationLabel` (Task 7 → 8, 9, 10, 12) · `PanelProps` diekspor sekali dari `HeroPanel.tsx` dan diimpor keempat panel lain (Task 12). `BriefPromo.items` konsisten array di Task 1, 3, 4, 12. `NearbyItem.minutes` konsisten `number | null` di Task 1, 3, 4, 5, 12, 14.

**4. Titik risiko yang perlu perhatian reviewer:**
- **Task 4** satu-satunya task yang bisa mengubah halaman publik secara visual. Verifikasi `/preview` di Step 7 bukan formalitas.
- **Task 6 Step 4** menyentuh `updateProjectAction` yang dipanggil di SETIAP langkah wizard. Syarat `nextType !== owned.projectType` menjaga toggle manual agen di step 2 tidak tertimpa saat langkah 3 disimpan — jangan disederhanakan.
- **Task 14** memakai selektor untuk tombol Generate, Publish, dan Simpan tipe yang **tidak diverifikasi** terhadap kode saat plan ini ditulis. Perlakukan sebagai perkiraan dan koreksi dari `error-context.md`.
- **Task 7** men-commit dataset starter 40 kecamatan. Sebelum rilis, ganti dengan dataset penuh — kalau tidak, agen di luar 40 kecamatan itu tidak menemukan lokasinya.
