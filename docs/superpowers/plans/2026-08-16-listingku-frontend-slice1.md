# Listingku Front-End Slice 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun tulang punggung front-end Listingku — Login → Dashboard → Create Project → Add House Type → Generate AI → Block Editor → Publish → landing publik SSR yang live — dengan seluruh data dummy di balik satu repository seam.

**Architecture:** Next.js 15 App Router monolith. UI tidak pernah menyentuh sumber data; semua lewat interface `DataStore` (`lib/data/repo.ts`) yang di slice ini diimplementasikan mock store in-memory dengan snapshot ke `.data/store.json`. Baca lewat Server Component, tulis lewat Server Action → repo → `revalidatePath`. Landing publik dirender satu `BlockRenderer` yang juga dipakai pratinjau editor, sehingga pratinjau tidak pernah bisa berbeda dari live.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind v4, token CSS design system Listingku, komponen DS di-port manual, Radix (Dialog, Accordion), sonner, Zod 3, react-hook-form, lucide-react, `next/font/google` Archivo, qrcode, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-16-listingku-frontend-slice1-design.md`

## Global Constraints

Setiap task tunduk pada seluruh isi bagian ini.

**Palette — nilai persis, jangan diubah:**
- `--evergreen:#233D2D` suara utama (nav, headline, body ink, teks tombol sekunder)
- `--orange:#D2421A` konversi saja (tombol primer, focus ring, error). **Tidak pernah body copy, tidak pernah nav item saat rest.**
- `--leaf:#00803A` hanya mark & status sukses. **Tidak pernah fill tombol atau permukaan.**
- `--mint:#E5EDE7` `--stone:#F3F5F2` `--ash:#D3D8D5` `--sage:#66736B` `--ink:#121212`
- **`#2563EB` (biru) DILARANG muncul di mana pun.** Itu berasal dari `uploads/Instruksi Prompt UI ... pen.dev` yang sudah usang. Task 1 memasang tes yang gagal bila warna itu muncul.

**Aturan copy — mengikat:**
- Bahasa Indonesia. Orang kedua **Anda** (kapital). Orang pertama **kami**. **Tidak pernah *kamu*, tidak pernah *saya*.**
- Sentence case di mana pun termasuk tombol dan nav. UPPERCASE hanya untuk eyebrow/label-sm (12px, tracking 0.04em).
- **Tanpa emoji. Tanpa tanda seru.**
- Tombol kata kerja dulu, 2–3 kata.
- Angka: `Rp 2,45 M`, `1.842`, `90 m²`, tanggal `16 Agustus 2026`.
- Copy yang sudah ada di `Listingku App.dc.html` adalah sumber kebenaran — salin, jangan tulis ulang.

**Bentuk & state:**
- Radius: 4px tombol/input, 8px kartu, 16px hero/media, full hanya chip/banner.
- Kedalaman dari border 1px `--ash`, bukan shadow. Tanpa glow, glass, blur.
- Hover = pertukaran warna, bukan pemudaran. Press = `translateY(1px)`, tanpa scale/shadow. Focus = outline oranye 2px offset 2px. Disabled = opacity 40%.
- Motion 120/200/320ms pada `cubic-bezier(.2,.6,.2,1)`. Tanpa bounce, spring, parallax, animasi scroll.

**Penyimpangan YAGNI yang disengaja dari spec §3 dan §12** (dicatat agar reviewer tidak menganggapnya kelalaian):
- `Banner` dan `NavLink` dari DS **tidak dibangun di slice 1** — tidak satu pun dari tujuh layar memakainya (sidebar dashboard adalah komponen sendiri, bukan NavLink). Menyusul di slice 2 saat situs profil membutuhkannya.
- `Tabs` dan `Table` **tidak dibangun di slice 1** — keduanya hanya dipakai layar Settings dan Leads yang berada di slice 2–3.
- `Switch` **dibangun di Task 16**, bukan Task 3 — pemakaian pertamanya adalah toggle "Tampilkan blok" di panel editor (spec §7, US-E2). Task 16 yang memasang `@radix-ui/react-switch`.
- `tokens/fonts.css` milik DS **tidak disalin** — isinya `@import` Google Fonts CDN, sedangkan spec §3 meminta `next/font/google` yang self-host.

**Aturan Next.js 15 yang mudah keliru:**
- `cookies()` asinkron: `const store = await cookies()`.
- `params` dan `searchParams` adalah Promise: `const { slug } = await params`.
- Server Action harus punya `'use server'` di baris pertama file atau fungsi.

**Setiap task berakhir dengan commit.** Pesan commit Bahasa Inggris, format Conventional Commits.

---

## File Structure

| Berkas | Tanggung jawab |
|---|---|
| `styles/tokens/*.css` | Salinan verbatim token DS — satu-satunya tempat nilai warna/tipografi/spasi hidup |
| `styles/globals.css` | Import Tailwind + token, jembatan `@theme inline`, override font next/font |
| `components/ds/*` | Port komponen brand: Button, Card, Chip, Input |
| `components/ui/*` | Pembungkus Radix dicat token DS: dialog, sheet, accordion, progress, skeleton, toaster |
| `lib/landing/blocks.ts` | Tipe Block + urutan default + reducer urutan/toggle/props. Tanpa dependensi |
| `lib/data/types.ts` | Tipe domain. Import `Block` dari `lib/landing/blocks.ts` |
| `lib/data/repo.ts` | Interface `DataStore` — satu-satunya kontrak yang dilihat UI |
| `lib/data/mock/*` | Store singleton, snapshot atomic, implementasi repo |
| `fixtures/seed.ts` | Data awal: agen Audi + 3 project sesuai file design |
| `lib/landing/resolve.ts` | Fungsi murni: blocks + baris data → `ResolvedBlock[]` |
| `lib/landing/themes/wireframe/*` | Komponen render per tipe blok, gaya polos |
| `lib/landing/BlockRenderer.tsx` | Satu renderer, dipakai landing publik **dan** pratinjau editor |
| `lib/ai/*` | Skema Zod cermin `responseSchema` Gemini + generator mock |
| `lib/{format,slug,ids,session}.ts` | Utilitas murni + sesi cookie dummy |
| `app/(dashboard)/**` | Tujuh layar agen |
| `app/(public)/[slug]/**` | Landing publik SSR |

**Urutan task dan alasannya:** fondasi tanpa dependensi lebih dulu (token → komponen → utilitas murni → model blocks), baru lapisan data, baru layar, baru landing, baru editor. `lib/landing/blocks.ts` sengaja mendahului `lib/data/types.ts` karena `Project.blocks` mengacu ke tipe `Block`, bukan sebaliknya — arah dependensi satu arah, tanpa siklus.

---

## Task 1: Scaffold, toolchain, dan design token

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`
- Create: `styles/tokens/{colors,typography,spacing,radius,elevation,motion}.css`, `styles/type-utils.css`, `styles/globals.css`
- Create: `app/layout.tsx`, `app/page.tsx`, `public/uploads/.gitkeep`, `tests/unit/setup.ts`
- Test: `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: tidak ada (task pertama)
- Produces: variabel CSS DS tersedia global; script `npm run dev|build|test|test:e2e|seed:reset`; alias import `@/*` → root repo

- [ ] **Step 1: Inisialisasi git dan package.json**

```bash
git init
```

Tulis `package.json`:

```json
{
  "name": "listingku",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "seed:reset": "node -e \"require('fs').rmSync('.data/store.json',{force:true});console.log('Store direset ke fixture.')\""
  }
}
```

- [ ] **Step 2: Pasang dependensi**

```bash
npm install next@^15 react@^19 react-dom@^19 zod@^3 react-hook-form@^7 @hookform/resolvers@^3 lucide-react @radix-ui/react-dialog@^1 @radix-ui/react-accordion@^1 sonner@^1 qrcode@^1
npm install -D typescript@^5 @types/react@^19 @types/react-dom@^19 @types/node @types/qrcode tailwindcss@^4 @tailwindcss/postcss@^4 vitest@^2 @vitejs/plugin-react@^4 jsdom@^25 @testing-library/react@^16 @testing-library/user-event@^14 @testing-library/jest-dom@^6 @playwright/test@^1
npx playwright install chromium
```

- [ ] **Step 3: Tulis berkas konfigurasi**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
```

`postcss.config.mjs`:

```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname) } },
});
```

`tests/unit/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

`.gitignore`:

```
node_modules/
.next/
out/
.data/
public/uploads/*
!public/uploads/.gitkeep
.env*.local
/test-results/
/playwright-report/
coverage/
*.tsbuildinfo
next-env.d.ts
```

`.env.example`:

```
DATA_DRIVER=mock
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AI_MOCK_FAIL=0
```

```bash
mkdir -p public/uploads && touch public/uploads/.gitkeep
```

- [ ] **Step 4: Salin token DS verbatim**

`styles/tokens/colors.css`:

```css
:root{
  /* Base palette */
  --evergreen:#233D2D;
  --evergreen-700:#1B3024;
  --evergreen-500:#3A5A46;
  --orange:#D2421A;
  --orange-700:#AE3413;
  --orange-100:#FBE4DC;
  --leaf:#00803A;          /* logo green — mark only */
  --mint:#E5EDE7;
  --white:#FFFFFF;
  --stone:#F3F5F2;
  --ash:#D3D8D5;
  --sage:#66736B;
  --ink:#121212;

  /* Semantic — text */
  --text-body:#233D2D;
  --text-heading:#233D2D;
  --text-muted:#66736B;
  --text-inverse:#E5EDE7;
  --text-inverse-strong:#FFFFFF;
  --text-accent:#D2421A;
  --text-link:#233D2D;
  --text-link-hover:#D2421A;

  /* Semantic — surfaces */
  --surface-page:#FFFFFF;
  --surface-muted:#F3F5F2;
  --surface-card:#FFFFFF;
  --surface-tint:#E5EDE7;
  --surface-brand:#233D2D;
  --surface-dark:#121212;
  --surface-accent:#D2421A;

  /* Semantic — lines & controls */
  --border-default:#D3D8D5;
  --border-subtle:#E5EDE7;
  --border-strong:#233D2D;
  --border-inverse:rgba(229,237,231,.24);
  --focus-ring:#D2421A;

  /* Semantic — status */
  --status-error:#D2421A;
  --status-error-surface:#FBE4DC;
  --status-success:#00803A;
  --status-info:#233D2D;

  /* Overlays */
  --overlay-scrim:rgba(18,18,18,.56);
  --overlay-hero:linear-gradient(180deg,rgba(18,18,18,0) 34%,rgba(18,18,18,.72) 100%);
}
```

`styles/tokens/spacing.css`:

```css
:root{
  --space-xs:6px;
  --space-sm:14px;
  --space-md:24px;
  --space-lg:48px;
  --space-xl:60px;
  --space-gutter:32px;
  --space-section:96px;

  --container-max:1200px;
  --container-pad:32px;
  --card-pad:32px;
  --control-pad-y:12px;
  --control-pad-x:20px;
  --control-height:46px;
}
```

`styles/tokens/radius.css`:

```css
:root{
  --radius-none:0px;
  --radius-sm:4px;   /* buttons, inputs */
  --radius-md:8px;   /* cards */
  --radius-lg:12px;
  --radius-xl:16px;  /* hero panels, media */
  --radius-full:9999px; /* chips, banners */
}
```

`styles/tokens/elevation.css`:

```css
:root{
  --shadow-none:none;
  --shadow-card:0 1px 2px rgba(18,18,18,.04);
  --shadow-raised:0 10px 28px rgba(18,18,18,.10);
  --shadow-menu:0 16px 40px rgba(18,18,18,.14);
  --border-hairline:1px solid var(--border-default);
}
```

`styles/tokens/motion.css`:

```css
:root{
  --dur-fast:120ms;
  --dur-base:200ms;
  --dur-slow:320ms;
  --ease-standard:cubic-bezier(.2,.6,.2,1);
  --ease-out:cubic-bezier(0,0,.2,1);
  --transition-control:background-color var(--dur-base) var(--ease-standard),color var(--dur-base) var(--ease-standard),border-color var(--dur-base) var(--ease-standard);
}
```

`styles/tokens/typography.css`:

```css
:root{
  /* Archivo di-self-host lewat next/font; --font-archivo di-set di app/layout.tsx */
  --font-display:var(--font-archivo),"Neue Haas Grotesk Display","Helvetica Neue",Helvetica,Arial,sans-serif;
  --font-text:var(--font-archivo),"Neue Haas Grotesk Text","Helvetica Neue",Helvetica,Arial,sans-serif;
  --font-body:"Helvetica Neue",Helvetica,Arial,sans-serif;

  --type-display-family:var(--font-display);
  --type-display-size:51px;
  --type-display-line:56px;
  --type-display-weight:600;
  --type-display-tracking:0px;
  --type-h1-family:var(--font-display);
  --type-h1-size:39px;
  --type-h1-line:47px;
  --type-h1-weight:600;
  --type-h1-tracking:0px;
  --type-h2-family:var(--font-display);
  --type-h2-size:30px;
  --type-h2-line:39px;
  --type-h2-weight:600;
  --type-h2-tracking:0px;
  --type-h3-family:var(--font-text);
  --type-h3-size:18px;
  --type-h3-line:22px;
  --type-h3-weight:600;
  --type-h3-tracking:0px;
  --type-body-lg-size:18px;
  --type-body-lg-line:28px;
  --type-body-md-size:16px;
  --type-body-md-line:24px;
  --type-body-sm-size:14px;
  --type-body-sm-line:20px;
  --type-body-weight:400;
  --type-label-lg-size:16px;
  --type-label-lg-line:24px;
  --type-label-md-size:14px;
  --type-label-md-line:20px;
  --type-label-sm-size:12px;
  --type-label-sm-line:16px;
  --type-label-sm-tracking:0.04em;
  --type-label-weight:600;
  --type-caption-size:12px;
  --type-caption-line:16px;
  --type-caption-weight:400;
}
```

- [ ] **Step 5: Tulis type utilities dan globals**

`styles/type-utils.css` — kelas `.lw-*` dari `tokens/base.css` DS, tanpa bagian reset (Tailwind preflight yang menanganinya):

```css
.lw-display{font-family:var(--type-display-family);font-size:var(--type-display-size);line-height:var(--type-display-line);font-weight:var(--type-display-weight);letter-spacing:var(--type-display-tracking)}
.lw-h1{font-family:var(--type-h1-family);font-size:var(--type-h1-size);line-height:var(--type-h1-line);font-weight:var(--type-h1-weight)}
.lw-h2{font-family:var(--type-h2-family);font-size:var(--type-h2-size);line-height:var(--type-h2-line);font-weight:var(--type-h2-weight)}
.lw-h3{font-family:var(--type-h3-family);font-size:var(--type-h3-size);line-height:var(--type-h3-line);font-weight:var(--type-h3-weight)}
.lw-body-lg{font-family:var(--font-body);font-size:var(--type-body-lg-size);line-height:var(--type-body-lg-line)}
.lw-body{font-family:var(--font-body);font-size:var(--type-body-md-size);line-height:var(--type-body-md-line)}
.lw-body-sm{font-family:var(--font-body);font-size:var(--type-body-sm-size);line-height:var(--type-body-sm-line)}
.lw-label-lg{font-family:var(--font-text);font-size:var(--type-label-lg-size);line-height:var(--type-label-lg-line);font-weight:var(--type-label-weight)}
.lw-label{font-family:var(--font-text);font-size:var(--type-label-md-size);line-height:var(--type-label-md-line);font-weight:var(--type-label-weight)}
.lw-label-sm{font-family:var(--font-text);font-size:var(--type-label-sm-size);line-height:var(--type-label-sm-line);font-weight:var(--type-label-weight);letter-spacing:var(--type-label-sm-tracking);text-transform:uppercase}
.lw-caption{font-family:var(--font-body);font-size:var(--type-caption-size);line-height:var(--type-caption-line)}
.lw-container{max-width:var(--container-max);margin:0 auto;padding-inline:var(--container-pad)}
```

`styles/globals.css`:

```css
@import "tailwindcss";

/* Token DS diimpor TANPA @layer. Tailwind menaruh theme-nya di `@layer theme`,
   dan CSS tak-berlapis selalu menang atas CSS berlapis — jadi nilai DS aman
   dari default Tailwind yang kebetulan senama (mis. --radius-sm). */
@import "./tokens/colors.css";
@import "./tokens/typography.css";
@import "./tokens/spacing.css";
@import "./tokens/radius.css";
@import "./tokens/elevation.css";
@import "./tokens/motion.css";
@import "./type-utils.css";

/* Jembatan ke utility Tailwind. Hanya warna — spasi/radius/shadow dipakai lewat
   var() langsung supaya tidak bertabrakan dengan namespace theme Tailwind. */
@theme inline {
  --color-evergreen: var(--evergreen);
  --color-evergreen-700: var(--evergreen-700);
  --color-orange: var(--orange);
  --color-orange-100: var(--orange-100);
  --color-leaf: var(--leaf);
  --color-mint: var(--mint);
  --color-stone: var(--stone);
  --color-ash: var(--ash);
  --color-sage: var(--sage);
  --color-ink: var(--ink);
}

body {
  margin: 0;
  background: var(--surface-page);
  color: var(--text-body);
  font-family: var(--font-body);
  font-size: var(--type-body-md-size);
  line-height: var(--type-body-md-line);
  -webkit-font-smoothing: antialiased;
  text-wrap: pretty;
}

::selection { background: var(--orange); color: #fff; }
:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
img { max-width: 100%; display: block; }
```

- [ ] **Step 6: Tulis root layout dan halaman akar**

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import '@/styles/globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Listingku',
  description: 'Marketing website properti dalam hitungan menit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

- [ ] **Step 7: Tulis tes token**

`tests/unit/tokens.test.ts`:

```ts
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const STYLES = path.resolve(__dirname, '../../styles');
const read = (p: string) => readFileSync(path.join(STYLES, p), 'utf8');

function allCss(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? allCss(path.join(dir, e.name))
      : e.name.endsWith('.css')
        ? [path.join(dir, e.name)]
        : [],
  );
}

describe('design token', () => {
  it('memakai nilai palette design system yang persis', () => {
    const css = read('tokens/colors.css');
    expect(css).toContain('--evergreen:#233D2D');
    expect(css).toContain('--orange:#D2421A');
    expect(css).toContain('--leaf:#00803A');
    expect(css).toContain('--mint:#E5EDE7');
    expect(css).toContain('--stone:#F3F5F2');
    expect(css).toContain('--ash:#D3D8D5');
    expect(css).toContain('--sage:#66736B');
    expect(css).toContain('--ink:#121212');
  });

  it('tidak memakai biru dari dokumen pen.dev yang sudah usang', () => {
    for (const file of allCss(STYLES)) {
      expect(readFileSync(file, 'utf8').toLowerCase(), `${file} memuat #2563eb`).not.toContain('#2563eb');
    }
  });

  it('memakai skala radius dan tinggi kontrol design system', () => {
    expect(read('tokens/radius.css')).toContain('--radius-sm:4px');
    expect(read('tokens/radius.css')).toContain('--radius-md:8px');
    expect(read('tokens/spacing.css')).toContain('--control-height:46px');
    expect(read('tokens/spacing.css')).toContain('--card-pad:32px');
  });

  it('menjaga body copy tetap di platform sans, bukan Archivo', () => {
    const type = read('tokens/typography.css');
    expect(type).toMatch(/--font-body:\s*"Helvetica Neue"/);
    expect(type).toContain('--font-display:var(--font-archivo)');
  });
});
```

- [ ] **Step 8: Jalankan tes dan build**

Run: `npm test && npm run build`
Expected: 4 tes PASS; build selesai tanpa error.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 app with Listingku design tokens

Tokens copied verbatim from the Listingku design system. Adds a regression
test that fails if the obsolete pen.dev blue (#2563EB) ever reappears."
```

---

## Task 2: Komponen design system — Button, Card, Chip, Input

**Files:**
- Create: `components/ds/{Button,Card,Chip,Input}.tsx`, `components/ds/index.ts`, `components/ds/ds.css`
- Modify: `styles/globals.css` (tambah satu baris import setelah `@import "./type-utils.css";`)
- Test: `tests/unit/ds-components.test.tsx`

**Interfaces:**
- Consumes: token CSS dari Task 1
- Produces:
  - `Button({ variant?: 'primary'|'secondary'|'inverse'|'link', size?: 'sm'|'md', fullWidth?: boolean, iconLeft?: ReactNode, iconRight?: ReactNode, ...ButtonHTMLAttributes })`
  - `Card({ tone?: 'light'|'tint'|'brand'|'dark', padded?: boolean, ...HTMLAttributes<HTMLDivElement> })`
  - `Chip({ tone?: 'tint'|'outline'|'accent'|'primary', size?: 'sm'|'md', icon?: ReactNode, children })`
  - `Input({ label?, hint?, error?, required?, textarea?, rows?, suffix?, ...InputHTMLAttributes })`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/ds-components.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button, Card, Chip, Input } from '@/components/ds';

describe('Button', () => {
  it('memakai kelas varian primer secara default', () => {
    render(<Button>Simpan project</Button>);
    const btn = screen.getByRole('button', { name: 'Simpan project' });
    expect(btn.className).toContain('ds-btn--primary');
    expect(btn.className).toContain('ds-btn--md');
  });

  it('menghormati varian, ukuran, dan full width', () => {
    render(<Button variant="secondary" size="sm" fullWidth>Kembali</Button>);
    const btn = screen.getByRole('button', { name: 'Kembali' });
    expect(btn.className).toContain('ds-btn--secondary');
    expect(btn.className).toContain('ds-btn--sm');
    expect(btn.className).toContain('ds-btn--block');
  });

  it('menyembunyikan ikon dari pembaca layar', () => {
    render(<Button iconLeft={<svg data-testid="ikon" />}>Create project</Button>);
    expect(screen.getByTestId('ikon').closest('span')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Card', () => {
  it('memakai tona terang secara default', () => {
    render(<Card data-testid="kartu">isi</Card>);
    expect(screen.getByTestId('kartu').className).toContain('ds-card--light');
  });

  it('mendukung tona mint', () => {
    render(<Card tone="tint" data-testid="kartu">isi</Card>);
    expect(screen.getByTestId('kartu').className).toContain('ds-card--tint');
  });
});

describe('Chip', () => {
  it('merender teks anak persis seperti yang diberikan', () => {
    render(<Chip tone="tint">Published</Chip>);
    expect(screen.getByText('Published').textContent).toBe('Published');
  });
});

describe('Input', () => {
  it('menyambungkan label ke field', () => {
    render(<Input label="Nama Project" defaultValue="Parkspring Gading" />);
    expect(screen.getByLabelText(/Nama Project/)).toHaveValue('Parkspring Gading');
  });

  it('menampilkan error dan menandai field invalid', () => {
    render(<Input label="Harga" error="Wajib diisi." />);
    expect(screen.getByText('Wajib diisi.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Harga/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('merender textarea saat diminta', () => {
    render(<Input label="Deskripsi" textarea rows={3} />);
    expect(screen.getByLabelText(/Deskripsi/).tagName).toBe('TEXTAREA');
  });

  // Error menggantikan hint di render, jadi aria-describedby tidak boleh
  // menyebut hintId saat keduanya diisi.
  it('hanya menunjuk id yang benar-benar ada saat hint dan error diisi bersamaan', () => {
    render(<Input label="Harga" hint="Angka saja." error="Wajib diisi." />);
    const ids = screen.getByLabelText(/Harga/).getAttribute('aria-describedby')!.split(/\s+/);
    for (const id of ids) expect(document.getElementById(id)).not.toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- ds-components`
Expected: FAIL — `Cannot find module '@/components/ds'`

- [ ] **Step 3: Tulis CSS komponen**

`components/ds/ds.css`:

```css
/* Button — hover adalah pertukaran warna, bukan pemudaran. Press 1px, tanpa scale. */
.ds-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  border-radius:var(--radius-sm);border:1px solid transparent;cursor:pointer;
  font-family:var(--font-text);font-weight:var(--type-label-weight);
  white-space:nowrap;text-decoration:none;transition:var(--transition-control)}
.ds-btn:active:not(:disabled){transform:translateY(1px)}
.ds-btn:disabled{opacity:.4;cursor:not-allowed}
.ds-btn--md{height:var(--control-height);padding:0 var(--control-pad-x);
  font-size:var(--type-label-lg-size);line-height:var(--type-label-lg-line)}
.ds-btn--sm{height:36px;padding:0 14px;
  font-size:var(--type-label-md-size);line-height:var(--type-label-md-line)}
.ds-btn--block{width:100%}

.ds-btn--primary{background:var(--orange);color:var(--white)}
.ds-btn--primary:hover:not(:disabled){background:var(--evergreen)}

.ds-btn--secondary{background:var(--white);color:var(--evergreen);border-color:var(--ash)}
.ds-btn--secondary:hover:not(:disabled){background:var(--mint);border-color:var(--evergreen)}

.ds-btn--inverse{background:transparent;color:var(--white);border-color:var(--border-inverse)}
.ds-btn--inverse:hover:not(:disabled){background:var(--white);color:var(--evergreen);border-color:var(--white)}

.ds-btn--link{background:transparent;color:var(--evergreen);padding:0;height:auto}
.ds-btn--link:hover:not(:disabled){color:var(--orange)}

/* Card — kedalaman dari hairline, shadow praktis tak terlihat. */
.ds-card{border-radius:var(--radius-md);border:1px solid transparent}
.ds-card--padded{padding:var(--card-pad)}
.ds-card--light{background:var(--surface-card);border-color:var(--border-default);box-shadow:var(--shadow-card)}
.ds-card--tint{background:var(--surface-tint);border-color:var(--surface-tint)}
.ds-card--brand{background:var(--surface-brand);color:var(--text-inverse);border-color:var(--surface-brand)}
.ds-card--dark{background:var(--surface-dark);color:var(--text-inverse);border-color:var(--surface-dark)}

/* Chip — pill, sentence case. UPPERCASE hanya untuk eyebrow .lw-label-sm. */
.ds-chip{display:inline-flex;align-items:center;gap:6px;border-radius:var(--radius-full);
  border:1px solid transparent;font-family:var(--font-text);font-weight:500;white-space:nowrap}
.ds-chip--sm{height:24px;padding:0 10px;font-size:var(--type-caption-size)}
.ds-chip--md{height:28px;padding:0 12px;font-size:var(--type-body-sm-size)}
.ds-chip--tint{background:var(--mint);color:var(--evergreen);border-color:var(--mint)}
.ds-chip--outline{background:transparent;color:var(--sage);border-color:var(--ash)}
.ds-chip--accent{background:var(--mint);color:var(--evergreen);border-color:var(--evergreen)}
.ds-chip--primary{background:var(--evergreen);color:var(--white);border-color:var(--evergreen)}

/* Input — 46px, hairline, fokus menggelapkan border ke evergreen, error jadi oranye. */
.ds-field{display:flex;flex-direction:column;gap:7px}
.ds-field__label{font-family:var(--font-text);font-size:var(--type-label-md-size);
  line-height:var(--type-label-md-line);font-weight:var(--type-label-weight);color:var(--text-heading)}
.ds-field__required{color:var(--status-error);margin-left:3px}
.ds-field__control{display:flex;align-items:stretch;border:1px solid var(--ash);
  border-radius:var(--radius-sm);background:var(--white);overflow:hidden;
  transition:border-color var(--dur-base) var(--ease-standard)}
.ds-field__control:focus-within{border-color:var(--evergreen)}
.ds-field--error .ds-field__control{border-color:var(--status-error)}
.ds-field__input{flex:1;min-width:0;border:0;outline:0;background:transparent;
  padding:var(--control-pad-y) 14px;font-family:var(--font-body);
  font-size:var(--type-body-sm-size);line-height:var(--type-body-sm-line);color:var(--text-body)}
input.ds-field__input{height:calc(var(--control-height) - 2px);padding-block:0}
.ds-field__input::placeholder{color:var(--sage)}
.ds-field__input:disabled{background:var(--stone);color:var(--sage);cursor:not-allowed}
.ds-field__suffix{display:flex;align-items:center;padding:0 14px;background:var(--stone);
  border-left:1px solid var(--ash);color:var(--sage);font-size:var(--type-body-sm-size)}
.ds-field__hint{font-size:var(--type-caption-size);line-height:var(--type-caption-line);color:var(--sage)}
.ds-field__error{font-size:var(--type-caption-size);line-height:var(--type-caption-line);color:var(--status-error)}
```

Tambahkan di `styles/globals.css` tepat setelah `@import "./type-utils.css";`:

```css
@import "../components/ds/ds.css";
```

- [ ] **Step 4: Tulis komponen**

`components/ds/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'link';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = ['ds-btn', `ds-btn--${variant}`, `ds-btn--${size}`, fullWidth ? 'ds-btn--block' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {iconLeft ? <span aria-hidden="true">{iconLeft}</span> : null}
      {children}
      {iconRight ? <span aria-hidden="true">{iconRight}</span> : null}
    </button>
  );
}
```

`components/ds/Card.tsx`:

```tsx
import type { HTMLAttributes } from 'react';

export type CardTone = 'light' | 'tint' | 'brand' | 'dark';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padded?: boolean;
}

export function Card({ tone = 'light', padded = true, className = '', children, ...rest }: CardProps) {
  const classes = ['ds-card', `ds-card--${tone}`, padded ? 'ds-card--padded' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
```

`components/ds/Chip.tsx`:

```tsx
import type { ReactNode } from 'react';

export type ChipTone = 'tint' | 'outline' | 'accent' | 'primary';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  tone?: ChipTone;
  size?: ChipSize;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Chip({ tone = 'tint', size = 'sm', icon, className = '', children }: ChipProps) {
  const classes = ['ds-chip', `ds-chip--${tone}`, `ds-chip--${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
```

`components/ds/Input.tsx`:

```tsx
'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
  suffix?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  textarea = false,
  rows = 3,
  suffix,
  required,
  className = '',
  id,
  ...rest
}: InputProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  // Hanya id yang benar-benar dirender yang boleh masuk. Saat error diisi, hint
  // tidak dirender — memasukkan hintId di situ membuat aria-describedby menunjuk
  // elemen yang tidak ada.
  const describedBy = [error ? errorId : null, hint && !error ? hintId : null].filter(Boolean).join(' ') || undefined;

  const shared = {
    id: fieldId,
    className: 'ds-field__input',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    required,
  };

  return (
    <div className={['ds-field', error ? 'ds-field--error' : '', className].filter(Boolean).join(' ')}>
      {label ? (
        <label className="ds-field__label" htmlFor={fieldId}>
          {label}
          {required ? (
            <span className="ds-field__required" aria-hidden="true">
              •
            </span>
          ) : null}
        </label>
      ) : null}
      <div className="ds-field__control">
        {textarea ? (
          <textarea rows={rows} {...shared} {...(rest as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        ) : (
          <input {...shared} {...rest} />
        )}
        {suffix ? <span className="ds-field__suffix">{suffix}</span> : null}
      </div>
      {error ? (
        <span id={errorId} className="ds-field__error">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="ds-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
```

`components/ds/index.ts`:

```ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
export { Card } from './Card';
export type { CardProps, CardTone } from './Card';
export { Chip } from './Chip';
export type { ChipProps, ChipTone, ChipSize } from './Chip';
export { Input } from './Input';
export type { InputProps } from './Input';
```

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npm test -- ds-components`
Expected: 10 tes PASS (Button 3, Card 2, Chip 1, Input 4).

- [ ] **Step 6: Commit**

```bash
git add components/ds styles/globals.css tests/unit/ds-components.test.tsx
git commit -m "feat(ds): port Button, Card, Chip and Input from the design system"
```

---

## Task 3: Primitif Radix dicat token DS

**Files:**
- Create: `components/ui/{dialog,sheet,accordion,progress,skeleton,toaster}.tsx`, `components/ui/ui.css`, `components/ui/index.ts`
- Modify: `styles/globals.css` (import `../components/ui/ui.css`), `app/layout.tsx` (pasang `<Toaster />`)
- Test: `tests/unit/ui-primitives.test.tsx`

**Interfaces:**
- Consumes: token CSS Task 1
- Produces:
  - `Dialog({ open, onOpenChange, title, description?, children, footer? })` — modal terpusat
  - `Sheet({ open, onOpenChange, title, description?, children, footer? })` — panel kanan lebar 460px
  - `Accordion({ items: { id: string; question: string; answer: string }[] })`
  - `Progress({ value: number })` — 0..100, tinggi 4px
  - `Skeleton({ width?: string })` — balok berdenyut
  - `Toaster()` + re-export `toast` dari `sonner`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/ui-primitives.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Dialog, Accordion, Progress } from '@/components/ui';

describe('Dialog', () => {
  it('menampilkan judul dan isi saat terbuka', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Publikasikan landing ini?">
        <p>Halaman akan live dan bisa dibagikan ke calon pembeli.</p>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Publikasikan landing ini?')).toBeInTheDocument();
  });

  it('memanggil onOpenChange saat Escape ditekan', async () => {
    const onOpenChange = vi.fn();
    render(<Dialog open onOpenChange={onOpenChange} title="Judul"><p>isi</p></Dialog>);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Accordion', () => {
  it('menyembunyikan jawaban sampai pertanyaannya diklik', async () => {
    render(<Accordion items={[{ id: 'kpr', question: 'Apakah bisa KPR?', answer: 'Bisa, lewat bank rekanan.' }]} />);
    expect(screen.queryByText('Bisa, lewat bank rekanan.')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Apakah bisa KPR?' }));
    expect(screen.getByText('Bisa, lewat bank rekanan.')).toBeVisible();
  });
});

describe('Progress', () => {
  it('mengekspos nilai ke pembaca layar dan menjepit ke rentang 0..100', () => {
    render(<Progress value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- ui-primitives`
Expected: FAIL — `Cannot find module '@/components/ui'`

- [ ] **Step 3: Tulis CSS primitif**

`components/ui/ui.css`:

```css
.ui-overlay{position:fixed;inset:0;background:var(--overlay-scrim);
  animation:ui-fade var(--dur-base) var(--ease-standard)}
@keyframes ui-fade{from{opacity:0}to{opacity:1}}

.ui-dialog{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
  width:min(92vw,480px);background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-md);box-shadow:var(--shadow-menu);padding:var(--card-pad);
  display:flex;flex-direction:column;gap:var(--space-sm)}

.ui-sheet{position:fixed;right:0;top:0;bottom:0;width:min(96vw,460px);
  background:var(--surface-card);border-left:1px solid var(--border-default);
  box-shadow:var(--shadow-menu);display:flex;flex-direction:column;
  animation:ui-slide var(--dur-slow) var(--ease-standard)}
@keyframes ui-slide{from{transform:translateX(16px);opacity:0}to{transform:none;opacity:1}}
.ui-sheet__head{padding:20px 24px;border-bottom:1px solid var(--border-subtle)}
.ui-sheet__body{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px}
.ui-sheet__foot{padding:16px 24px;border-top:1px solid var(--border-subtle);
  display:flex;justify-content:flex-end;gap:8px}

.ui-dialog__title,.ui-sheet__title{font-family:var(--font-text);font-size:var(--type-h3-size);
  line-height:var(--type-h3-line);font-weight:600;color:var(--text-heading)}
.ui-dialog__desc,.ui-sheet__desc{font-size:var(--type-body-sm-size);color:var(--text-muted);margin-top:6px}
.ui-dialog__foot{display:flex;justify-content:flex-end;gap:8px;margin-top:var(--space-xs)}

.ui-acc__item{border-bottom:1px solid var(--border-default)}
.ui-acc__trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:16px 0;background:none;border:0;cursor:pointer;text-align:left;
  font-family:var(--font-text);font-size:var(--type-label-lg-size);font-weight:600;
  color:var(--text-heading);transition:var(--transition-control)}
.ui-acc__trigger:hover{color:var(--orange)}
.ui-acc__trigger:active{transform:translateY(1px)}
/* Radix menaruh data-state di trigger; penanda +/- ikut dari situ, bukan dari
   inline style, supaya benar-benar berganti saat item dibuka. */
.ui-acc__trigger[data-state="closed"] .ui-acc__minus{display:none}
.ui-acc__trigger[data-state="open"] .ui-acc__plus{display:none}
.ui-acc__mark{color:var(--orange);flex:0 0 auto}
.ui-acc__panel{padding:0 0 16px;font-size:var(--type-body-sm-size);
  line-height:var(--type-body-md-line);color:var(--text-muted)}

.ui-progress{height:4px;border-radius:var(--radius-sm);background:var(--stone);overflow:hidden}
.ui-progress__bar{height:100%;background:var(--evergreen);
  transition:width var(--dur-slow) var(--ease-standard)}

.ui-skeleton{height:12px;border-radius:var(--radius-sm);background:var(--stone);
  animation:ui-pulse 1.4s ease-in-out infinite}
@keyframes ui-pulse{0%,100%{opacity:1}50%{opacity:.45}}
```

Tambahkan di `styles/globals.css` setelah import `ds.css`:

```css
@import "../components/ui/ui.css";
```

- [ ] **Step 4: Tulis primitif**

`components/ui/dialog.tsx`:

```tsx
'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, footer, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="ui-overlay" />
        <RadixDialog.Content className="ui-dialog">
          <RadixDialog.Title className="ui-dialog__title">{title}</RadixDialog.Title>
          {description ? (
            <RadixDialog.Description className="ui-dialog__desc">{description}</RadixDialog.Description>
          ) : null}
          {children}
          {footer ? <div className="ui-dialog__foot">{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
```

`components/ui/sheet.tsx`:

```tsx
'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, title, description, footer, children }: SheetProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="ui-overlay" />
        <RadixDialog.Content className="ui-sheet">
          <div className="ui-sheet__head">
            <RadixDialog.Title className="ui-sheet__title">{title}</RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="ui-sheet__desc">{description}</RadixDialog.Description>
            ) : null}
          </div>
          <div className="ui-sheet__body">{children}</div>
          {footer ? <div className="ui-sheet__foot">{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
```

`components/ui/accordion.tsx`:

```tsx
'use client';

import * as RadixAccordion from '@radix-ui/react-accordion';
import { Minus, Plus } from 'lucide-react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <RadixAccordion.Root type="single" collapsible>
      {items.map((item) => (
        <RadixAccordion.Item key={item.id} value={item.id} className="ui-acc__item">
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="ui-acc__trigger">
              {item.question}
              <span className="ui-acc__mark" aria-hidden="true">
                <Plus size={16} className="ui-acc__plus" />
                <Minus size={16} className="ui-acc__minus" />
              </span>
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="ui-acc__panel">{item.answer}</RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
```

`components/ui/progress.tsx`:

```tsx
export function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="ui-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div className="ui-progress__bar" style={{ width: `${clamped}%` }} />
    </div>
  );
}
```

`components/ui/skeleton.tsx`:

```tsx
export function Skeleton({ width = '100%' }: { width?: string }) {
  return <div className="ui-skeleton" style={{ width }} aria-hidden="true" />;
}
```

`components/ui/toaster.tsx`:

```tsx
'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-body)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--type-body-sm-size)',
          boxShadow: 'var(--shadow-menu)',
        },
      }}
    />
  );
}
```

`components/ui/index.ts`:

```ts
export { Dialog } from './dialog';
export type { DialogProps } from './dialog';
export { Sheet } from './sheet';
export type { SheetProps } from './sheet';
export { Accordion } from './accordion';
export type { AccordionItem } from './accordion';
export { Progress } from './progress';
export { Skeleton } from './skeleton';
export { Toaster } from './toaster';
export { toast } from 'sonner';
```

- [ ] **Step 5: Pasang Toaster di root layout**

Di `app/layout.tsx`, impor `Toaster` dan render tepat setelah `{children}`:

```tsx
import { Toaster } from '@/components/ui';
// ...
      <body>
        {children}
        <Toaster />
      </body>
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npm test -- ui-primitives`
Expected: 4 tes PASS.

- [ ] **Step 7: Commit**

```bash
git add components/ui styles/globals.css app/layout.tsx tests/unit/ui-primitives.test.tsx
git commit -m "feat(ui): add Radix dialog, sheet, accordion, progress, skeleton and toaster"
```

---

## Task 4: Utilitas murni — format, slug, ids

**Files:**
- Create: `lib/format.ts`, `lib/slug.ts`, `lib/ids.ts`
- Test: `tests/unit/format.test.ts`, `tests/unit/slug.test.ts`

> **Amandemen setelah review (2026-08-16).** Setiap formatter menerima nilai kosong
> dan mengembalikan em dash `'—'` untuk `null` / `undefined` / `NaN` / angka non-finite /
> Invalid Date. `0` tetap nilai nyata (`formatRupiah(0) === "Rp0"`), dikunci tesnya
> sendiri supaya guard tidak pernah "disederhanakan" jadi cek falsy. `slugify` juga
> menerima `null`/`undefined` dan memperlakukannya seperti string kosong. Alasannya:
> tipe non-nullable di bawah ini hanya kontrak, bukan jaminan runtime — tipe rumah
> bisa ada sebelum harganya diisi, dan tanpa guard halaman publik menampilkan
> `"RpNaN"` atau `"1 Januari 1970"`. Tanda tangan di bawah dibaca dengan pelebaran itu.

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `formatRupiahShort(value: number | null | undefined): string` — `2450000000` → `"Rp 2,45 M"`
  - `formatRupiah(value: number | null | undefined): string` — `150000` → `"Rp150.000"`
  - `formatNumber(value: number | null | undefined): string` — `1842` → `"1.842"`
  - `formatArea(m2: number | null | undefined): string` — `90` → `"90 m²"`
  - `formatDateLong(iso: string | Date | null | undefined): string` — → `"16 Agustus 2026"`
  - `formatDateShort(iso: string): string` — → `"16 Agu 2026"`
  - `RESERVED_SLUGS: readonly string[]`
  - `slugify(input: string): string`
  - `isReservedSlug(slug: string): boolean`
  - `uniqueSlug(base: string, taken: readonly string[]): string`
  - `newId(prefix: string): string`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatRupiahShort, formatRupiah, formatNumber, formatArea, formatDateLong, formatDateShort } from '@/lib/format';

describe('formatRupiahShort', () => {
  it('memakai koma desimal dan satuan M untuk miliar', () => {
    expect(formatRupiahShort(2_450_000_000)).toBe('Rp 2,45 M');
    expect(formatRupiahShort(4_600_000_000)).toBe('Rp 4,6 M');
  });

  it('memakai satuan jt untuk juta', () => {
    expect(formatRupiahShort(750_000_000)).toBe('Rp 750 jt');
  });

  it('jatuh ke format penuh di bawah satu juta', () => {
    expect(formatRupiahShort(150_000)).toBe('Rp150.000');
  });
});

describe('format lain', () => {
  it('memakai titik sebagai pemisah ribuan', () => {
    expect(formatRupiah(1_850_000_000)).toBe('Rp1.850.000.000');
    expect(formatNumber(1842)).toBe('1.842');
  });

  it('menambahkan satuan meter persegi', () => {
    expect(formatArea(90)).toBe('90 m²');
  });

  it('mengeja bulan dalam Bahasa Indonesia', () => {
    expect(formatDateLong('2026-08-16T00:00:00.000Z')).toBe('16 Agustus 2026');
    expect(formatDateShort('2026-08-16T00:00:00.000Z')).toBe('16 Agu 2026');
  });
});
```

`tests/unit/slug.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { slugify, isReservedSlug, uniqueSlug, RESERVED_SLUGS } from '@/lib/slug';

describe('slugify', () => {
  it('menurunkan nama project jadi slug bersih', () => {
    expect(slugify('Parkspring Gading')).toBe('parkspring-gading');
    expect(slugify('  Casa Verde   Alam Sutera ')).toBe('casa-verde-alam-sutera');
    expect(slugify('Bintaro Loop / Residence #2')).toBe('bintaro-loop-residence-2');
  });
});

describe('isReservedSlug', () => {
  it('menolak slug yang akan membajak rute aplikasi', () => {
    for (const reserved of ['dashboard', 'projects', 'login', 'api', 'sitemap.xml', 'robots.txt']) {
      expect(isReservedSlug(reserved), reserved).toBe(true);
    }
    expect(RESERVED_SLUGS).toContain('uploads');
  });

  it('meloloskan nama project biasa', () => {
    expect(isReservedSlug('parkspring-gading')).toBe(false);
  });
});

describe('uniqueSlug', () => {
  it('mengembalikan slug apa adanya bila belum terpakai', () => {
    expect(uniqueSlug('parkspring-gading', [])).toBe('parkspring-gading');
  });

  it('menambahkan suffix angka saat bentrok', () => {
    expect(uniqueSlug('parkspring-gading', ['parkspring-gading'])).toBe('parkspring-gading-2');
    expect(uniqueSlug('parkspring-gading', ['parkspring-gading', 'parkspring-gading-2'])).toBe('parkspring-gading-3');
  });

  it('memberi suffix pada slug terlarang meski belum terpakai', () => {
    expect(uniqueSlug('dashboard', [])).toBe('dashboard-2');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- format slug`
Expected: FAIL — `Cannot find module '@/lib/format'`

- [ ] **Step 3: Tulis implementasi**

`lib/format.ts`:

```ts
const ID = 'id-ID';

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Pemisah ribuan titik, desimal koma — konvensi Indonesia. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(ID).format(value);
}

export function formatRupiah(value: number): string {
  return `Rp${formatNumber(Math.round(value))}`;
}

/** Bentuk ringkas untuk kartu dan hero: "Rp 2,45 M", "Rp 750 jt". */
export function formatRupiahShort(value: number): string {
  const trim = (n: number, digits: number) =>
    new Intl.NumberFormat(ID, { maximumFractionDigits: digits }).format(n);

  if (value >= 1_000_000_000) return `Rp ${trim(value / 1_000_000_000, 2)} M`;
  if (value >= 1_000_000) return `Rp ${trim(value / 1_000_000, 1)} jt`;
  return formatRupiah(value);
}

export function formatArea(m2: number): string {
  return `${formatNumber(m2)} m²`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${BULAN_PANJANG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${BULAN_PENDEK[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
```

`lib/slug.ts`:

```ts
/**
 * Landing publik hidup di `/{project-slug}`, satu ruang nama dengan rute aplikasi.
 * Slug di daftar ini akan membajak halaman aplikasi, jadi selalu diberi suffix.
 */
export const RESERVED_SLUGS = [
  'dashboard', 'projects', 'project', 'login', 'logout', 'settings', 'leads',
  'api', '_next', 'sitemap.xml', 'robots.txt', 'favicon.ico',
  'agent', 'admin', 'app', 'static', 'assets', 'uploads', 'brand',
] as const;

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

/** Mengembalikan slug bebas bentrok; menambah -2, -3, … bila perlu. */
export function uniqueSlug(base: string, taken: readonly string[]): string {
  const clean = slugify(base) || 'project';
  const used = new Set(taken.map((s) => s.toLowerCase()));
  if (!used.has(clean) && !isReservedSlug(clean)) return clean;

  let n = 2;
  while (used.has(`${clean}-${n}`)) n += 1;
  return `${clean}-${n}`;
}
```

`lib/ids.ts`:

```ts
/** Id berprefiks supaya mudah dibaca saat men-debug isi .data/store.json. */
export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
```

- [ ] **Step 4: Jalankan tes untuk memastikan lulus**

Run: `npm test -- format slug`
Expected: 11 tes PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts lib/slug.ts lib/ids.ts tests/unit/format.test.ts tests/unit/slug.test.ts
git commit -m "feat(lib): add Indonesian formatting, slug rules and id helpers"
```

---

## Task 5: Model blocks

**Files:**
- Create: `lib/landing/blocks.ts`
- Test: `tests/unit/blocks.test.ts`

**Interfaces:**
- Consumes: tidak ada — modul ini sengaja tanpa dependensi supaya `lib/data/types.ts` bisa mengimpornya tanpa siklus
- Produces:
  - `type BlockType`, `type Block` (discriminated union), `BLOCK_LABELS: Record<BlockType,string>`, `BLOCK_ORDER: BlockType[]`
  - `defaultBlocks(): Block[]`
  - `moveBlock(blocks: Block[], id: string, dir: 'up'|'down'): Block[]`
  - `toggleBlock(blocks: Block[], id: string): Block[]`
  - `updateBlockProps(blocks: Block[], id: string, patch: Record<string, unknown>): Block[]`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/blocks.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { defaultBlocks, moveBlock, toggleBlock, updateBlockProps, BLOCK_ORDER, BLOCK_LABELS } from '@/lib/landing/blocks';

describe('defaultBlocks', () => {
  it('memakai urutan blok yang ditetapkan PRD', () => {
    expect(defaultBlocks().map((b) => b.type)).toEqual([
      'hero', 'gallery', 'highlights', 'houseTypes', 'specs',
      'facilities', 'floorPlans', 'location', 'faq', 'agentCta', 'contactForm',
    ]);
  });

  it('mengaktifkan semua blok dan memberi id unik', () => {
    const blocks = defaultBlocks();
    expect(blocks.every((b) => b.enabled)).toBe(true);
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
  });

  it('menamai setiap tipe blok dalam Bahasa Indonesia', () => {
    for (const type of BLOCK_ORDER) expect(BLOCK_LABELS[type]).toBeTruthy();
    expect(BLOCK_LABELS.houseTypes).toBe('Tipe Rumah');
    expect(BLOCK_LABELS.agentCta).toBe('CTA WhatsApp');
  });
});

describe('moveBlock', () => {
  it('menukar blok dengan tetangganya', () => {
    const blocks = defaultBlocks();
    const galleryId = blocks[1].id;
    expect(moveBlock(blocks, galleryId, 'up').map((b) => b.type).slice(0, 2)).toEqual(['gallery', 'hero']);
  });

  it('tidak mengubah apa pun di ujung daftar', () => {
    const blocks = defaultBlocks();
    expect(moveBlock(blocks, blocks[0].id, 'up')).toEqual(blocks);
    expect(moveBlock(blocks, blocks[blocks.length - 1].id, 'down')).toEqual(blocks);
  });

  it('tidak memutasi array masukan', () => {
    const blocks = defaultBlocks();
    const snapshot = JSON.stringify(blocks);
    moveBlock(blocks, blocks[1].id, 'up');
    expect(JSON.stringify(blocks)).toBe(snapshot);
  });
});

describe('toggleBlock', () => {
  it('membalik enabled hanya pada blok yang dituju', () => {
    const blocks = defaultBlocks();
    const next = toggleBlock(blocks, blocks[3].id);
    expect(next[3].enabled).toBe(false);
    expect(next[0].enabled).toBe(true);
  });
});

describe('updateBlockProps', () => {
  it('menggabungkan patch ke props blok', () => {
    const blocks = defaultBlocks();
    const hero = blocks[0];
    const next = updateBlockProps(blocks, hero.id, { title: 'Parkspring Gading' });
    expect(next[0].props).toMatchObject({ title: 'Parkspring Gading' });
  });

  it('menghapus override saat nilainya undefined, mengembalikan default AI', () => {
    const blocks = updateBlockProps(defaultBlocks(), defaultBlocks()[0].id, {});
    const withTitle = updateBlockProps(blocks, blocks[0].id, { title: 'Judul manual' });
    const cleared = updateBlockProps(withTitle, blocks[0].id, { title: undefined });
    expect('title' in cleared[0].props).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- blocks`
Expected: FAIL — `Cannot find module '@/lib/landing/blocks'`

- [ ] **Step 3: Tulis implementasi**

`lib/landing/blocks.ts`:

```ts
/**
 * Model blok landing page.
 *
 * Dua aturan yang menopang seluruh arsitektur landing:
 *  1. Blok menyimpan REFERENSI (mediaId, houseTypeId), bukan salinan harga/foto.
 *     Ubah harga di detail tipe rumah, landing live ikut berubah tanpa sentuh editor.
 *  2. Field teks OPSIONAL. Kosong = pakai default AI, terisi = override.
 *     Karena itu "Use AI suggestion" cukup menghapus field, bukan fitur tersendiri.
 *
 * Modul ini sengaja tanpa import apa pun supaya lib/data/types.ts bisa memakainya.
 */

export type BlockType =
  | 'hero' | 'gallery' | 'highlights' | 'houseTypes' | 'specs'
  | 'facilities' | 'floorPlans' | 'location' | 'faq' | 'agentCta' | 'contactForm';

export interface BlockBase<T extends BlockType, P> {
  id: string;
  type: T;
  enabled: boolean;
  /** Varian layout per tema. Belum dipakai di slice 1 (satu set komponen wireframe). */
  variant?: string;
  props: P;
}

export type HeroBlock = BlockBase<'hero', { title?: string; subtitle?: string; mediaId?: string }>;
export type GalleryBlock = BlockBase<'gallery', { layout: 'carousel' | 'grid'; mediaIds?: string[] }>;
export type HighlightsBlock = BlockBase<'highlights', { items?: string[] }>;
export type HouseTypesBlock = BlockBase<'houseTypes', { order?: string[]; hidden?: string[] }>;
export type SpecsBlock = BlockBase<'specs', Record<string, never>>;
export type FacilitiesBlock = BlockBase<'facilities', Record<string, never>>;
export type FloorPlansBlock = BlockBase<'floorPlans', { mediaIds?: string[] }>;
export type LocationBlock = BlockBase<'location', { address?: string; mapUrl?: string }>;
export type FaqBlock = BlockBase<'faq', { items?: { q: string; a: string }[] }>;
export type AgentCtaBlock = BlockBase<'agentCta', { waNumber?: string; defaultMessage?: string }>;
export type ContactFormBlock = BlockBase<'contactForm', { askHouseType?: boolean }>;

export type Block =
  | HeroBlock | GalleryBlock | HighlightsBlock | HouseTypesBlock | SpecsBlock
  | FacilitiesBlock | FloorPlansBlock | LocationBlock | FaqBlock | AgentCtaBlock | ContactFormBlock;

/** Urutan default sesuai PRD dan blockDefs di Listingku App.dc.html. */
export const BLOCK_ORDER: BlockType[] = [
  'hero', 'gallery', 'highlights', 'houseTypes', 'specs',
  'facilities', 'floorPlans', 'location', 'faq', 'agentCta', 'contactForm',
];

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  gallery: 'Galeri',
  highlights: 'Highlights',
  houseTypes: 'Tipe Rumah',
  specs: 'Spesifikasi per Tipe',
  facilities: 'Fasilitas',
  floorPlans: 'Denah',
  location: 'Lokasi',
  faq: 'FAQ',
  agentCta: 'CTA WhatsApp',
  contactForm: 'Form Kontak',
};

const DEFAULT_PROPS: Record<BlockType, Record<string, unknown>> = {
  hero: {},
  gallery: { layout: 'carousel' },
  highlights: {},
  houseTypes: {},
  specs: {},
  facilities: {},
  floorPlans: {},
  location: {},
  faq: {},
  agentCta: {},
  contactForm: { askHouseType: true },
};

export function defaultBlocks(): Block[] {
  return BLOCK_ORDER.map(
    (type) => ({ id: `blk_${type}`, type, enabled: true, props: { ...DEFAULT_PROPS[type] } }) as Block,
  );
}

export function moveBlock(blocks: Block[], id: string, dir: 'up' | 'down'): Block[] {
  const index = blocks.findIndex((b) => b.id === id);
  const target = dir === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= blocks.length) return blocks;

  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function toggleBlock(blocks: Block[], id: string): Block[] {
  return blocks.map((b) => (b.id === id ? ({ ...b, enabled: !b.enabled } as Block) : b));
}

/**
 * Menggabungkan patch ke props. Nilai `undefined` MENGHAPUS key —
 * itulah cara "Use AI suggestion" mengembalikan konten ke hasil AI.
 */
export function updateBlockProps(blocks: Block[], id: string, patch: Record<string, unknown>): Block[] {
  return blocks.map((b) => {
    if (b.id !== id) return b;
    const props: Record<string, unknown> = { ...b.props };
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) delete props[key];
      else props[key] = value;
    }
    return { ...b, props } as Block;
  });
}
```

- [ ] **Step 4: Jalankan tes untuk memastikan lulus**

Run: `npm test -- blocks`
Expected: 8 tes PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/landing/blocks.ts tests/unit/blocks.test.ts
git commit -m "feat(landing): add block model with reference-based props and AI-fallback overrides"
```

---

## Task 6: Lapisan data — tipe, kontrak repo, mock store, seed

**Files:**
- Create: `lib/data/types.ts`, `lib/data/repo.ts`, `lib/data/index.ts`
- Create: `lib/data/mock/{store,snapshot,repos}.ts`, `lib/data/supabase/README.md`
- Create: `fixtures/seed.ts`
- Test: `tests/unit/mock-store.test.ts`

**Interfaces:**
- Consumes: `Block`, `defaultBlocks` dari Task 5; `newId` dari Task 4
- Produces:
  - Tipe domain: `AgentProfile`, `Project`, `HouseType`, `Media`, `Lead`, `EventRow`, `AiUsage`, `ProjectAiContent`, `HouseTypeAiContent`, `SeoContent`
  - `interface DataStore` dengan namespace `agentProfile | projects | houseTypes | media | leads | events | aiUsage`
  - `getDataStore(): DataStore` dan `db: DataStore` dari `@/lib/data`
  - `SEED_USER_ID: string` dari `@/fixtures/seed`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/mock-store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockStore } from '@/lib/data/mock/repos';
import { SEED_USER_ID } from '@/fixtures/seed';

let db: ReturnType<typeof createMockStore>;
beforeEach(() => {
  db = createMockStore({ persist: false });
});

describe('seed', () => {
  it('menyediakan agen dan tiga project sesuai file design', async () => {
    const agent = await db.agentProfile.get(SEED_USER_ID);
    expect(agent?.siteName).toBe('Audi Property');
    expect(agent?.subdomain).toBe('audi');

    const projects = await db.projects.list(SEED_USER_ID);
    expect(projects.map((p) => p.name)).toEqual([
      'Parkspring Gading', 'Casa Verde Alam Sutera', 'Bintaro Loop Residence',
    ]);
  });

  it('hanya memaparkan project published lewat listPublished', async () => {
    const published = await db.projects.listPublished();
    expect(published.every((p) => p.status === 'published')).toBe(true);
    expect(published.map((p) => p.slug)).not.toContain('casa-verde-alam-sutera');
  });
});

describe('projects', () => {
  it('membuat project draft dengan slug unik dan blok default', async () => {
    const created = await db.projects.create({
      userId: SEED_USER_ID, name: 'Parkspring Gading', location: 'Serpong',
      developer: 'Paramount', description: 'Cluster baru.', facilities: ['Taman'],
    });
    expect(created.status).toBe('draft');
    expect(created.slug).toBe('parkspring-gading-2');
    expect(created.blocks).toHaveLength(11);
    expect(created.theme).toBe('modern');
  });

  it('menemukan project lewat slug', async () => {
    expect((await db.projects.getBySlug('parkspring-gading'))?.name).toBe('Parkspring Gading');
    expect(await db.projects.getBySlug('tidak-ada')).toBeNull();
  });

  it('menghapus project beserta tipe rumah dan medianya', async () => {
    const target = (await db.projects.list(SEED_USER_ID))[0];
    await db.projects.remove(target.id);
    expect(await db.projects.get(target.id)).toBeNull();
    expect(await db.houseTypes.listByProject(target.id)).toEqual([]);
    expect(await db.media.listByProject(target.id)).toEqual([]);
  });
});

describe('houseTypes', () => {
  it('mengurutkan tipe rumah berdasarkan sortOrder', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    expect((await db.houseTypes.listByProject(project.id)).map((h) => h.name)).toEqual(['Villa', 'Midea', 'Grand']);
  });
});

describe('events', () => {
  it('mengakumulasi hitungan per tipe event', async () => {
    const project = (await db.projects.list(SEED_USER_ID))[0];
    const before = (await db.events.countsByProject(project.id)).visitor;
    await db.events.record({ projectId: project.id, type: 'visitor' });
    await db.events.record({ projectId: project.id, type: 'visitor' });
    expect((await db.events.countsByProject(project.id)).visitor).toBe(before + 2);
  });
});

describe('snapshot', () => {
  it('memulihkan state dari serialisasi', async () => {
    const created = await db.projects.create({
      userId: SEED_USER_ID, name: 'Uji Snapshot', location: 'Bandung',
      developer: '', description: '', facilities: [],
    });
    const restored = createMockStore({ persist: false, initial: db.__dump() });
    expect((await restored.projects.get(created.id))?.name).toBe('Uji Snapshot');
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- mock-store`
Expected: FAIL — `Cannot find module '@/lib/data/mock/repos'`

- [ ] **Step 3: Tulis tipe domain**

`lib/data/types.ts`:

```ts
import type { Block } from '@/lib/landing/blocks';

export type Id = string;
export type ProjectStatus = 'draft' | 'published';
export type ThemeName = 'modern' | 'showcase' | 'luxury';
export type MediaType = 'photo' | 'floor_plan';
export type LeadSource = 'form' | 'whatsapp';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'negotiation' | 'deal' | 'lost';
export type EventType = 'visitor' | 'whatsapp_click' | 'form_submit';

export interface SeoContent {
  title?: string;
  description?: string;
}

export interface ProjectAiContent {
  headline: string;
  description: string;
  sellingPoints: string[];
  faq: { q: string; a: string }[];
  seo: { title: string; description: string };
  captions: { instagram: string; facebook: string; whatsapp: string };
}

export interface HouseTypeAiContent {
  shortDescription: string;
  sellingPoints: string[];
}

export interface AgentProfile {
  id: Id;
  userId: Id;
  fullName: string;
  email: string;
  whatsapp: string;
  siteName: string;
  subdomain: string;
  theme: string;
  logoUrl: string | null;
  colorScheme: string;
  about: string;
  stats: { closings: number; listings: number; years: number };
  services: string[];
  isPublished: boolean;
}

export interface Project {
  id: Id;
  userId: Id;
  name: string;
  slug: string;
  location: string;
  developer: string;
  description: string;
  facilities: string[];
  status: ProjectStatus;
  theme: ThemeName;
  blocks: Block[];
  seo: SeoContent;
  aiContent: ProjectAiContent | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface HouseType {
  id: Id;
  projectId: Id;
  name: string;
  slug: string;
  price: number;
  landArea: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  carport: number;
  status: ProjectStatus;
  aiContent: HouseTypeAiContent | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: Id;
  userId: Id;
  projectId: Id;
  houseTypeId: Id | null;
  type: MediaType;
  url: string;
  size: number;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Lead {
  id: Id;
  projectId: Id;
  houseTypeId: Id | null;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
}

export interface EventRow {
  id: Id;
  projectId: Id;
  houseTypeId: Id | null;
  type: EventType;
  date: string;
  count: number;
}

export interface AiUsage {
  id: Id;
  userId: Id;
  projectId: Id;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  error: string | null;
  createdAt: string;
}

export interface StoreShape {
  agentProfiles: AgentProfile[];
  projects: Project[];
  houseTypes: HouseType[];
  media: Media[];
  leads: Lead[];
  events: EventRow[];
  aiUsage: AiUsage[];
}
```

- [ ] **Step 4: Tulis kontrak repo**

`lib/data/repo.ts`:

```ts
import type {
  AgentProfile, EventRow, EventType, HouseType, Id, Lead, Media, Project, StoreShape,
} from './types';

export type NewProject = Pick<Project, 'userId' | 'name' | 'location' | 'developer' | 'description' | 'facilities'>;
export type NewHouseType = Pick<
  HouseType, 'projectId' | 'name' | 'price' | 'landArea' | 'buildingArea' | 'bedrooms' | 'bathrooms' | 'carport'
>;
export type NewMedia = Pick<Media, 'userId' | 'projectId' | 'houseTypeId' | 'type' | 'url' | 'size'>;
export type NewLead = Pick<Lead, 'projectId' | 'houseTypeId' | 'name' | 'phone' | 'email' | 'message' | 'source'>;
export type NewAiUsage = Omit<import('./types').AiUsage, 'id' | 'createdAt'>;

/**
 * Satu-satunya kontrak yang dilihat UI. Slice 1 mengisinya dengan mock store;
 * integrasi Supabase nanti menulis implementasi kedua tanpa menyentuh komponen.
 */
export interface DataStore {
  agentProfile: {
    get(userId: Id): Promise<AgentProfile | null>;
    update(userId: Id, patch: Partial<AgentProfile>): Promise<AgentProfile>;
  };
  projects: {
    list(userId: Id): Promise<Project[]>;
    get(id: Id): Promise<Project | null>;
    getBySlug(slug: string): Promise<Project | null>;
    listPublished(): Promise<Project[]>;
    create(input: NewProject): Promise<Project>;
    update(id: Id, patch: Partial<Project>): Promise<Project>;
    remove(id: Id): Promise<void>;
  };
  houseTypes: {
    listByProject(projectId: Id): Promise<HouseType[]>;
    get(id: Id): Promise<HouseType | null>;
    create(input: NewHouseType): Promise<HouseType>;
    update(id: Id, patch: Partial<HouseType>): Promise<HouseType>;
    remove(id: Id): Promise<void>;
  };
  media: {
    listByProject(projectId: Id): Promise<Media[]>;
    create(input: NewMedia): Promise<Media>;
    remove(id: Id): Promise<void>;
    setPrimary(id: Id): Promise<void>;
  };
  leads: {
    create(input: NewLead): Promise<Lead>;
    listByUser(userId: Id): Promise<Lead[]>;
  };
  events: {
    record(input: { projectId: Id; houseTypeId?: Id | null; type: EventType }): Promise<void>;
    countsByProject(projectId: Id): Promise<Record<EventType, number>>;
    totalsByUser(userId: Id): Promise<Record<EventType, number>>;
  };
  aiUsage: {
    record(input: NewAiUsage): Promise<void>;
  };
  /** Hanya untuk pengujian dan snapshot — bukan bagian permukaan yang dipakai UI. */
  __dump(): StoreShape;
}

export type { AgentProfile, EventRow, HouseType, Lead, Media, Project };
```

- [ ] **Step 5: Tulis seed**

`fixtures/seed.ts`:

```ts
import { defaultBlocks } from '@/lib/landing/blocks';
import type { StoreShape } from '@/lib/data/types';

export const SEED_USER_ID = 'usr_audi';
const NOW = '2026-08-10T09:00:00.000Z';

const project = (
  id: string, name: string, slug: string, location: string, developer: string,
  description: string, facilities: string[], status: 'draft' | 'published', updatedAt: string,
) => ({
  id, userId: SEED_USER_ID, name, slug, location, developer, description, facilities,
  status, theme: 'modern' as const, blocks: defaultBlocks(), seo: {}, aiContent: null,
  createdAt: NOW, updatedAt, publishedAt: status === 'published' ? updatedAt : null,
});

const houseType = (
  id: string, projectId: string, name: string, slug: string, price: number,
  landArea: number, buildingArea: number, bedrooms: number, bathrooms: number,
  carport: number, sortOrder: number,
) => ({
  id, projectId, name, slug, price, landArea, buildingArea, bedrooms, bathrooms, carport,
  status: 'published' as const, aiContent: null, sortOrder, createdAt: NOW, updatedAt: NOW,
});

export function seedStore(): StoreShape {
  return {
    agentProfiles: [
      {
        id: 'agp_audi',
        userId: SEED_USER_ID,
        fullName: 'Audi',
        email: 'audi@listingku.app',
        whatsapp: '081288994410',
        siteName: 'Audi Property',
        subdomain: 'audi',
        theme: 'Modern',
        logoUrl: null,
        colorScheme: 'Oranye',
        about: 'Agen properti untuk kawasan Gading Serpong dan sekitarnya. Fokus pada cluster baru dan unit ready stock.',
        stats: { closings: 64, listings: 18, years: 7 },
        services: ['Jual', 'Sewa', 'Konsultasi'],
        isPublished: true,
      },
    ],
    projects: [
      project(
        'prj_parkspring', 'Parkspring Gading', 'parkspring-gading',
        'Gading Serpong, Tangerang', 'Paramount Land',
        'Cluster baru dengan tiga tipe unit, akses lima menit ke Gading Serpong CBD. Fasilitas kolam renang, jogging track, dan security 24 jam.',
        ['Kolam renang', 'Security 24 jam', 'Jogging track'], 'published', '2026-08-10T09:00:00.000Z',
      ),
      project(
        'prj_casaverde', 'Casa Verde Alam Sutera', 'casa-verde-alam-sutera',
        'Alam Sutera, Tangerang', 'Alam Sutera Realty',
        'Dua tipe hunian di kawasan matang dengan akses tol langsung.',
        ['Taman', 'Clubhouse'], 'draft', '2026-08-07T09:00:00.000Z',
      ),
      project(
        'prj_bintaro', 'Bintaro Loop Residence', 'bintaro-loop-residence',
        'Bintaro, Tangerang Selatan', 'Jaya Real Property',
        'Empat tipe unit dengan akses langsung ke stasiun dan pusat kuliner Bintaro.',
        ['Security 24 jam', 'Masjid', 'Taman'], 'published', '2026-08-02T09:00:00.000Z',
      ),
    ],
    houseTypes: [
      houseType('hts_villa', 'prj_parkspring', 'Villa', 'villa', 2_450_000_000, 90, 120, 3, 2, 1, 0),
      houseType('hts_midea', 'prj_parkspring', 'Midea', 'midea', 3_100_000_000, 112, 145, 4, 3, 2, 1),
      houseType('hts_grand', 'prj_parkspring', 'Grand', 'grand', 4_600_000_000, 150, 210, 4, 3, 2, 2),
      houseType('hts_verde_a', 'prj_casaverde', 'Verde A', 'verde-a', 1_850_000_000, 72, 96, 3, 2, 1, 0),
      houseType('hts_verde_b', 'prj_casaverde', 'Verde B', 'verde-b', 2_250_000_000, 90, 120, 3, 2, 1, 1),
      houseType('hts_loop_s', 'prj_bintaro', 'Loop S', 'loop-s', 1_450_000_000, 60, 75, 2, 1, 1, 0),
      houseType('hts_loop_m', 'prj_bintaro', 'Loop M', 'loop-m', 1_950_000_000, 78, 105, 3, 2, 1, 1),
      houseType('hts_loop_l', 'prj_bintaro', 'Loop L', 'loop-l', 2_650_000_000, 105, 140, 4, 3, 2, 2),
      houseType('hts_loop_xl', 'prj_bintaro', 'Loop XL', 'loop-xl', 3_400_000_000, 128, 175, 4, 3, 2, 3),
    ],
    media: [],
    leads: [],
    events: [
      { id: 'evt_1', projectId: 'prj_parkspring', houseTypeId: null, type: 'visitor', date: '2026-08-10', count: 1420 },
      { id: 'evt_2', projectId: 'prj_parkspring', houseTypeId: null, type: 'whatsapp_click', date: '2026-08-10', count: 96 },
      { id: 'evt_3', projectId: 'prj_parkspring', houseTypeId: null, type: 'form_submit', date: '2026-08-10', count: 19 },
      { id: 'evt_4', projectId: 'prj_bintaro', houseTypeId: null, type: 'visitor', date: '2026-08-02', count: 422 },
      { id: 'evt_5', projectId: 'prj_bintaro', houseTypeId: null, type: 'form_submit', date: '2026-08-02', count: 8 },
    ],
    aiUsage: [],
  };
}
```

- [ ] **Step 6: Tulis store, snapshot, dan implementasi repo**

`lib/data/mock/snapshot.ts`:

```ts
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { StoreShape } from '../types';

const DIR = path.resolve(process.cwd(), '.data');
const FILE = path.join(DIR, 'store.json');

export function loadSnapshot(): StoreShape | null {
  if (!existsSync(FILE)) return null;
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as StoreShape;
  } catch {
    return null;
  }
}

/** Tulis atomic: file sementara lalu rename, supaya tidak ada state setengah jadi di Windows. */
export function saveSnapshot(state: StoreShape): void {
  mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  renameSync(tmp, FILE);
}
```

`lib/data/mock/store.ts`:

```ts
import type { StoreShape } from '../types';
import { seedStore } from '@/fixtures/seed';
import { loadSnapshot, saveSnapshot } from './snapshot';

export interface StoreHandle {
  state: StoreShape;
  commit(): void;
}

export function createStoreHandle(opts: { persist: boolean; initial?: StoreShape }): StoreHandle {
  const state = opts.initial
    ? structuredClone(opts.initial)
    : ((opts.persist ? loadSnapshot() : null) ?? seedStore());

  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    state,
    commit() {
      if (!opts.persist) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => saveSnapshot(state), 50);
    },
  };
}
```

`lib/data/mock/repos.ts`:

```ts
import { newId } from '@/lib/ids';
import { defaultBlocks } from '@/lib/landing/blocks';
import { uniqueSlug } from '@/lib/slug';
import type { DataStore, NewAiUsage, NewHouseType, NewLead, NewMedia, NewProject } from '../repo';
import type { EventType, StoreShape } from '../types';
import { createStoreHandle } from './store';

const now = () => new Date().toISOString();
const EMPTY_COUNTS: Record<EventType, number> = { visitor: 0, whatsapp_click: 0, form_submit: 0 };

export function createMockStore(opts: { persist: boolean; initial?: StoreShape }): DataStore {
  const handle = createStoreHandle(opts);
  const s = handle.state;
  const save = () => handle.commit();

  return {
    agentProfile: {
      async get(userId) {
        return s.agentProfiles.find((a) => a.userId === userId) ?? null;
      },
      async update(userId, patch) {
        const found = s.agentProfiles.find((a) => a.userId === userId);
        if (!found) throw new Error(`Profil agen ${userId} tidak ditemukan.`);
        Object.assign(found, patch);
        save();
        return found;
      },
    },

    projects: {
      async list(userId) {
        return s.projects
          .filter((p) => p.userId === userId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      },
      async get(id) {
        return s.projects.find((p) => p.id === id) ?? null;
      },
      async getBySlug(slug) {
        return s.projects.find((p) => p.slug === slug) ?? null;
      },
      async listPublished() {
        return s.projects.filter((p) => p.status === 'published');
      },
      async create(input: NewProject) {
        const created = {
          ...input,
          id: newId('prj'),
          slug: uniqueSlug(input.name, s.projects.map((p) => p.slug)),
          status: 'draft' as const,
          theme: 'modern' as const,
          blocks: defaultBlocks(),
          seo: {},
          aiContent: null,
          createdAt: now(),
          updatedAt: now(),
          publishedAt: null,
        };
        s.projects.push(created);
        save();
        return created;
      },
      async update(id, patch) {
        const found = s.projects.find((p) => p.id === id);
        if (!found) throw new Error(`Project ${id} tidak ditemukan.`);
        Object.assign(found, patch, { updatedAt: now() });
        save();
        return found;
      },
      async remove(id) {
        s.projects = s.projects.filter((p) => p.id !== id);
        s.houseTypes = s.houseTypes.filter((h) => h.projectId !== id);
        s.media = s.media.filter((m) => m.projectId !== id);
        s.events = s.events.filter((e) => e.projectId !== id);
        save();
      },
    },

    houseTypes: {
      async listByProject(projectId) {
        return s.houseTypes.filter((h) => h.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder);
      },
      async get(id) {
        return s.houseTypes.find((h) => h.id === id) ?? null;
      },
      async create(input: NewHouseType) {
        const siblings = s.houseTypes.filter((h) => h.projectId === input.projectId);
        const created = {
          ...input,
          id: newId('hts'),
          slug: uniqueSlug(input.name, siblings.map((h) => h.slug)),
          status: 'draft' as const,
          aiContent: null,
          sortOrder: siblings.length,
          createdAt: now(),
          updatedAt: now(),
        };
        s.houseTypes.push(created);
        save();
        return created;
      },
      async update(id, patch) {
        const found = s.houseTypes.find((h) => h.id === id);
        if (!found) throw new Error(`Tipe rumah ${id} tidak ditemukan.`);
        Object.assign(found, patch, { updatedAt: now() });
        save();
        return found;
      },
      async remove(id) {
        s.houseTypes = s.houseTypes.filter((h) => h.id !== id);
        s.media = s.media.filter((m) => m.houseTypeId !== id);
        save();
      },
    },

    media: {
      async listByProject(projectId) {
        return s.media.filter((m) => m.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder);
      },
      async create(input: NewMedia) {
        const siblings = s.media.filter(
          (m) => m.projectId === input.projectId && m.houseTypeId === input.houseTypeId,
        );
        const created = {
          ...input,
          id: newId('med'),
          isPrimary: siblings.length === 0 && input.type === 'photo',
          sortOrder: siblings.length,
          createdAt: now(),
        };
        s.media.push(created);
        save();
        return created;
      },
      async remove(id) {
        s.media = s.media.filter((m) => m.id !== id);
        save();
      },
      async setPrimary(id) {
        const target = s.media.find((m) => m.id === id);
        if (!target) return;
        for (const m of s.media) {
          if (m.projectId === target.projectId && m.houseTypeId === target.houseTypeId) m.isPrimary = m.id === id;
        }
        save();
      },
    },

    leads: {
      async create(input: NewLead) {
        const created = { ...input, id: newId('lead'), status: 'new' as const, createdAt: now() };
        s.leads.push(created);
        save();
        return created;
      },
      async listByUser(userId) {
        const owned = new Set(s.projects.filter((p) => p.userId === userId).map((p) => p.id));
        return s.leads.filter((l) => owned.has(l.projectId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
    },

    events: {
      async record({ projectId, houseTypeId = null, type }) {
        const date = now().slice(0, 10);
        const existing = s.events.find(
          (e) => e.projectId === projectId && e.houseTypeId === houseTypeId && e.type === type && e.date === date,
        );
        if (existing) existing.count += 1;
        else s.events.push({ id: newId('evt'), projectId, houseTypeId, type, date, count: 1 });
        save();
      },
      async countsByProject(projectId) {
        const counts = { ...EMPTY_COUNTS };
        for (const e of s.events) if (e.projectId === projectId) counts[e.type] += e.count;
        return counts;
      },
      async totalsByUser(userId) {
        const owned = new Set(s.projects.filter((p) => p.userId === userId).map((p) => p.id));
        const counts = { ...EMPTY_COUNTS };
        for (const e of s.events) if (owned.has(e.projectId)) counts[e.type] += e.count;
        return counts;
      },
    },

    aiUsage: {
      async record(input: NewAiUsage) {
        s.aiUsage.push({ ...input, id: newId('aiu'), createdAt: now() });
        save();
      },
    },

    __dump() {
      return structuredClone(s);
    },
  };
}
```

`lib/data/index.ts`:

```ts
import type { DataStore } from './repo';
import { createMockStore } from './mock/repos';

declare global {
  // eslint-disable-next-line no-var
  var __listingkuStore: DataStore | undefined;
}

/**
 * Singleton disimpan di globalThis supaya HMR Next.js tidak me-reset store
 * di tengah sesi dev. Snapshot ke .data/store.json jadi jaring pengaman kedua.
 */
export function getDataStore(): DataStore {
  const driver = process.env.DATA_DRIVER ?? 'mock';
  if (driver !== 'mock') throw new Error(`DATA_DRIVER "${driver}" belum diimplementasikan.`);
  globalThis.__listingkuStore ??= createMockStore({ persist: true });
  return globalThis.__listingkuStore;
}

export const db: DataStore = getDataStore();
export type { DataStore } from './repo';
```

`lib/data/supabase/README.md`:

```markdown
# Implementasi Supabase (belum diisi)

Saat integrasi backend dimulai, buat `index.ts` di direktori ini yang mengekspor
`createSupabaseStore(): DataStore` — memenuhi kontrak yang sama persis di
`lib/data/repo.ts` — lalu tambahkan cabangnya di `lib/data/index.ts`
(`DATA_DRIVER=supabase`). Komponen UI tidak perlu disentuh.

Yang perlu diperhatikan saat itu:
- Policy `select` publik hanya boleh memaparkan baris `status = 'published'`.
- `media.url` berpindah dari `/uploads/...` ke URL bucket Storage.
- Setiap perubahan skema wajib disertai peninjauan policy RLS.
```

- [ ] **Step 7: Jalankan tes untuk memastikan lulus**

Run: `npm test -- mock-store`
Expected: 8 tes PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/data fixtures tests/unit/mock-store.test.ts
git commit -m "feat(data): add domain types, DataStore contract and persisted mock store"
```

---

## Task 7: Sesi dummy, Login, dan Dashboard

**Files:**
- Create: `lib/session.ts`, `middleware.ts`
- Create: `app/login/page.tsx`, `app/login/actions.ts`
- Create: `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`
- Create: `components/dashboard/{Sidebar,MetricCard,ProjectCard,EmptyState}.tsx`, `components/dashboard/dashboard.css`
- Modify: `styles/globals.css` (import `dashboard.css`)
- Test: `tests/unit/session.test.ts`, `tests/e2e/login.spec.ts`

**Interfaces:**
- Consumes: `db` dari `@/lib/data`, `SEED_USER_ID` dari `@/fixtures/seed`, `Button`/`Card`/`Chip` dari `@/components/ds`, `formatNumber`/`formatDateShort` dari `@/lib/format`
- Produces:
  - `SESSION_COOKIE: string`, `getSessionUserId(): Promise<string|null>`, `requireSessionUserId(): Promise<string>`, `setSession(userId): Promise<void>`, `clearSession(): Promise<void>`
  - `signInAction(): Promise<void>` — Server Action, set cookie lalu `redirect('/dashboard')`
  - `<Sidebar active="dashboard"|"projects"|"leads"|"settings" agent={AgentProfile} />`
  - `<MetricCard label={string} value={string} />`
  - `<ProjectCard project={Project} houseTypeCount={number} />`
  - `<EmptyState />`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/session.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = { value: undefined as string | undefined };
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (name === 'listingku_session' && store.value ? { value: store.value } : undefined),
    set: (name: string, value: string) => { if (name === 'listingku_session') store.value = value; },
    delete: () => { store.value = undefined; },
  }),
}));

import { getSessionUserId, setSession, clearSession, requireSessionUserId } from '@/lib/session';

beforeEach(() => { store.value = undefined; });

describe('sesi', () => {
  it('mengembalikan null saat belum login', async () => {
    expect(await getSessionUserId()).toBeNull();
  });

  it('menyimpan dan membaca userId', async () => {
    await setSession('usr_audi');
    expect(await getSessionUserId()).toBe('usr_audi');
    await clearSession();
    expect(await getSessionUserId()).toBeNull();
  });

  it('requireSessionUserId melempar saat belum login', async () => {
    await expect(requireSessionUserId()).rejects.toThrow(/Sesi tidak ditemukan/);
  });
});
```

`tests/e2e/login.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('mengarahkan pengunjung tanpa sesi ke halaman login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('login membawa agen ke dashboard yang berisi data seed', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  await expect(page.getByText('Parkspring Gading')).toBeVisible();
  await expect(page.getByText('audi.listingku.app')).toBeVisible();
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- session`
Expected: FAIL — `Cannot find module '@/lib/session'`

- [ ] **Step 3: Tulis sesi dan middleware**

`lib/session.ts`:

```ts
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'listingku_session';

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('Sesi tidak ditemukan.');
  return userId;
}

export async function setSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
```

`middleware.ts` (di root repo):

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

const GUARDED = ['/dashboard', '/projects'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsSession = GUARDED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsSession) return NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/projects/:path*'] };
```

- [ ] **Step 4: Tulis halaman Login**

`app/login/actions.ts`:

```ts
'use server';

import { redirect } from 'next/navigation';
import { setSession } from '@/lib/session';
import { SEED_USER_ID } from '@/fixtures/seed';

/**
 * Sesi dummy slice 1: tidak ada auth sungguhan. Tombol mana pun menandatangani
 * agen yang di-seed. Saat Supabase Auth masuk, hanya fungsi ini yang berubah.
 */
export async function signInAction(): Promise<void> {
  await setSession(SEED_USER_ID);
  redirect('/dashboard');
}
```

`app/login/page.tsx`:

```tsx
import Image from 'next/image';
import { Button, Input } from '@/components/ds';
import { signInAction } from './actions';

export const metadata = { title: 'Masuk — Listingku' };

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', background: 'var(--white)',
      }}
    >
      <form action={signInAction} style={{ width: '100%', maxWidth: 380 }}>
        <Image src="/brand/listingku-logo.png" alt="Listingku" width={180} height={42} priority />
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          Marketing website properti dalam hitungan menit
        </p>

        <div style={{ marginTop: 36 }}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="nama@email.com"
            hint="Kami kirim tautan masuk ke email ini."
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <Button type="submit" variant="primary" size="md" fullWidth>
            Kirim magic link
          </Button>
        </div>

        <div
          style={{
            margin: '22px 0', display: 'flex', alignItems: 'center', gap: 12,
            color: 'var(--sage)', fontSize: 12,
          }}
        >
          <span style={{ flex: 1, height: 1, background: 'var(--ash)' }} />
          atau
          <span style={{ flex: 1, height: 1, background: 'var(--ash)' }} />
        </div>

        <Button type="submit" variant="secondary" size="md" fullWidth>
          Masuk dengan Google
        </Button>
      </form>
    </main>
  );
}
```

Unduh tiga aset logo dari project Claude Design ke `public/brand/`: `listingku-logo.png`, `listingku-logo-white.png`, `listingku-mark.png`.

- [ ] **Step 5: Tulis CSS dan komponen dashboard**

`components/dashboard/dashboard.css`:

```css
.dash{display:grid;grid-template-columns:240px minmax(0,1fr);min-height:100vh;background:var(--stone)}
.dash__aside{background:var(--white);border-right:1px solid var(--ash);padding:22px 16px;
  display:flex;flex-direction:column}
.dash__nav{margin-top:26px;display:flex;flex-direction:column;gap:3px}
.dash__navitem{display:flex;align-items:center;gap:10px;padding:9px 12px;
  border-radius:var(--radius-sm);font-size:var(--type-body-sm-size);color:var(--sage);
  transition:var(--transition-control)}
.dash__navitem:hover{color:var(--orange)}
.dash__navitem[aria-current="page"]{background:var(--stone);color:var(--evergreen);font-weight:600}
.dash__navmark{width:3px;height:16px;border-radius:var(--radius-sm);background:transparent}
.dash__navitem[aria-current="page"] .dash__navmark{background:var(--orange)}
.dash__user{margin-top:auto;border:1px solid var(--ash);border-radius:var(--radius-md);padding:12px;
  display:flex;align-items:center;gap:10px}
.dash__avatar{width:32px;height:32px;border-radius:50%;background:var(--stone);
  display:flex;align-items:center;justify-content:center;font-family:var(--font-text);
  font-size:14px;font-weight:600;color:var(--sage)}
.dash__main{min-width:0;padding:32px 40px 60px;max-width:1180px}
.dash__grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.dash__metric{background:var(--white);border:1px solid var(--ash);border-radius:var(--radius-md);padding:20px 22px}
.dash__metric dt{font-size:var(--type-body-sm-size);color:var(--sage)}
.dash__metric dd{margin:10px 0 0;font-family:var(--font-display);font-size:var(--type-h2-size);
  line-height:var(--type-h2-line);font-weight:600}
.dash__project{background:var(--white);border:1px solid var(--ash);border-radius:var(--radius-md);
  overflow:hidden;display:block;transition:var(--transition-control)}
.dash__project:hover{border-color:var(--orange)}
.dash__thumb{height:120px;background:var(--mint)}
.dash__empty{margin-top:32px;border:1px dashed var(--ash);border-radius:var(--radius-md);
  padding:38px;text-align:center;background:var(--white)}
@media (max-width:900px){
  .dash{grid-template-columns:1fr}
  .dash__aside{flex-direction:row;align-items:center;gap:16px;border-right:0;border-bottom:1px solid var(--ash)}
  .dash__nav{flex-direction:row;margin-top:0}
  .dash__user{margin-top:0;margin-left:auto}
  .dash__main{padding:20px 16px 48px}
  .dash__grid3{grid-template-columns:1fr}
}
```

Tambahkan di `styles/globals.css`: `@import "../components/dashboard/dashboard.css";`

`components/dashboard/Sidebar.tsx`:

```tsx
import Image from 'next/image';
import Link from 'next/link';
import type { AgentProfile } from '@/lib/data/types';

const ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'projects', label: 'Projects', href: '/dashboard' },
  { id: 'leads', label: 'Leads', href: '/dashboard' },
  { id: 'settings', label: 'Pengaturan', href: '/dashboard' },
] as const;

export type SidebarSection = (typeof ITEMS)[number]['id'];

export function Sidebar({ active, agent }: { active: SidebarSection; agent: AgentProfile }) {
  return (
    <aside className="dash__aside">
      <Image src="/brand/listingku-logo.png" alt="Listingku" width={128} height={30} />
      <nav className="dash__nav">
        {ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="dash__navitem"
            aria-current={item.id === active ? 'page' : undefined}
          >
            <span className="dash__navmark" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="dash__user">
        <span className="dash__avatar" aria-hidden="true">
          {agent.fullName.charAt(0)}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="lw-label">{agent.fullName}</div>
          <div className="lw-label-sm" style={{ color: 'var(--sage)' }}>Starter</div>
        </div>
      </div>
    </aside>
  );
}
```

`components/dashboard/MetricCard.tsx`:

```tsx
export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash__metric">
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
    </div>
  );
}
```

`components/dashboard/ProjectCard.tsx`:

```tsx
import Link from 'next/link';
import { Chip } from '@/components/ds';
import { formatDateShort } from '@/lib/format';
import type { Project } from '@/lib/data/types';

export function ProjectCard({ project, houseTypeCount }: { project: Project; houseTypeCount: number }) {
  const published = project.status === 'published';
  return (
    <Link href={`/projects/${project.id}`} className="dash__project">
      <div className="dash__thumb" />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span className="lw-label-lg">{project.name}</span>
          <Chip tone={published ? 'tint' : 'outline'}>{published ? 'Published' : 'Draft'}</Chip>
        </div>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          {houseTypeCount} tipe unit · {project.location}
        </p>
        <p className="lw-label-sm" style={{ marginTop: 4, color: 'var(--sage)' }}>
          Diperbarui {formatDateShort(project.updatedAt)}
        </p>
      </div>
    </Link>
  );
}
```

`components/dashboard/EmptyState.tsx`:

```tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ds';

export function EmptyState() {
  return (
    <div className="dash__empty">
      <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Empty state</p>
      <p className="lw-h3" style={{ marginTop: 14 }}>Belum ada listing</p>
      <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
        Buat landing page profesional dalam hitungan menit.
      </p>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <Link href="/projects/new">
          <Button variant="primary" size="md" iconLeft={<Plus size={15} />}>
            Create project
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Tulis layout dan halaman Dashboard**

`app/(dashboard)/layout.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { db } from '@/lib/data';
import { getSessionUserId } from '@/lib/session';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');

  const agent = await db.agentProfile.get(userId);
  if (!agent) redirect('/login');

  return (
    <div className="dash">
      <Sidebar active="dashboard" agent={agent} />
      <main className="dash__main">{children}</main>
    </div>
  );
}
```

`app/(dashboard)/dashboard/page.tsx`:

```tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { Button, Card } from '@/components/ds';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatNumber } from '@/lib/format';

export const metadata = { title: 'Dashboard — Listingku' };

export default async function DashboardPage() {
  const userId = await requireSessionUserId();
  const [agent, projects, leads, totals] = await Promise.all([
    db.agentProfile.get(userId),
    db.projects.list(userId),
    db.leads.listByUser(userId),
    db.events.totalsByUser(userId),
  ]);

  const counts = await Promise.all(
    projects.map(async (p) => (await db.houseTypes.listByProject(p.id)).length),
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <h1 className="lw-h2">Dashboard</h1>
          <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
            Kelola listing dan pantau prospek Anda.
          </p>
        </div>
        <Link href="/projects/new">
          <Button variant="primary" size="sm" iconLeft={<Plus size={15} />}>
            Create project
          </Button>
        </Link>
      </div>

      <div className="dash__grid3" style={{ marginTop: 26 }}>
        <MetricCard label="Total projects" value={formatNumber(projects.length)} />
        <MetricCard label="Total leads" value={formatNumber(leads.length)} />
        <MetricCard label="Total visitors" value={formatNumber(totals.visitor)} />
      </div>

      {agent?.isPublished ? (
        <Card
          tone="tint"
          padded={false}
          style={{
            marginTop: 16, padding: '16px 20px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}
        >
          <div>
            <p className="lw-label">Website Anda sudah live</p>
            <p style={{ marginTop: 4, fontSize: 14 }}>{agent.subdomain}.listingku.app</p>
          </div>
          <Button variant="secondary" size="sm" disabled>
            Kelola profil
          </Button>
        </Card>
      ) : null}

      <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="lw-label-lg">Projects</h2>
        <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>
          {projects.length} primary property
        </span>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="dash__grid3" style={{ marginTop: 14 }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} houseTypeCount={counts[i]} />
          ))}
        </div>
      )}
    </>
  );
}
```

Catatan: tombol "Kelola profil" sengaja `disabled` — layar Settings ada di slice 2. Ini bukan kelalaian.

- [ ] **Step 7: Jalankan tes untuk memastikan lulus**

Run: `npm test -- session && npm run test:e2e -- login`
Expected: 3 tes unit PASS, 2 tes e2e PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/session.ts middleware.ts app/login "app/(dashboard)" components/dashboard styles/globals.css public/brand tests
git commit -m "feat(dashboard): add dummy session, login screen and dashboard wired to the mock store"
```

---

## Task 8: Pipeline media — downscale, unggah, hapus

**Files:**
- Create: `lib/media/downscale.ts`, `lib/media/actions.ts`, `components/media/MediaUploader.tsx`, `components/media/media.css`
- Modify: `styles/globals.css` (import `media.css`)
- Test: `tests/unit/media-validation.test.ts`

**Interfaces:**
- Consumes: `db` dari `@/lib/data`
- Produces:
  - `MAX_UPLOAD_BYTES: number`, `ACCEPTED_TYPES: string[]`, `MAX_PHOTOS_PER_HOUSE_TYPE: number`
  - `validateUpload(file: { type: string; size: number }, existingCount: number): { ok: true } | { ok: false; message: string }`
  - `downscaleImage(file: File, maxEdge?: number): Promise<Blob>` — hanya browser
  - `uploadMediaAction(formData: FormData): Promise<{ ok: boolean; message?: string }>` — Server Action
  - `deleteMediaAction(mediaId: string, projectId: string): Promise<void>`
  - `<MediaUploader projectId houseTypeId={string|null} type={'photo'|'floor_plan'} existingCount={number} />`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/media-validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateUpload, MAX_UPLOAD_BYTES, MAX_PHOTOS_PER_HOUSE_TYPE } from '@/lib/media/downscale';

describe('validateUpload', () => {
  it('menerima JPG, PNG, dan WebP', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateUpload({ type, size: 1024 }, 0).ok, type).toBe(true);
    }
  });

  it('menolak format lain dengan pesan spesifik', () => {
    const result = validateUpload({ type: 'application/pdf', size: 1024 }, 0);
    expect(result).toEqual({ ok: false, message: 'Format harus JPG, PNG, atau WebP.' });
  });

  it('menolak file di atas 10MB', () => {
    const result = validateUpload({ type: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1 }, 0);
    expect(result).toEqual({ ok: false, message: 'Ukuran maksimal 10MB per file.' });
  });

  it('menolak unggahan ke-21 pada satu tipe rumah', () => {
    expect(validateUpload({ type: 'image/jpeg', size: 1024 }, MAX_PHOTOS_PER_HOUSE_TYPE - 1).ok).toBe(true);
    const result = validateUpload({ type: 'image/jpeg', size: 1024 }, MAX_PHOTOS_PER_HOUSE_TYPE);
    expect(result).toEqual({ ok: false, message: 'Maksimal 20 foto per tipe rumah.' });
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- media-validation`
Expected: FAIL — `Cannot find module '@/lib/media/downscale'`

- [ ] **Step 3: Tulis validasi dan downscale**

`lib/media/downscale.ts`:

```ts
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTOS_PER_HOUSE_TYPE = 20;

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateUpload(file: { type: string; size: number }, existingCount: number): ValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) return { ok: false, message: 'Format harus JPG, PNG, atau WebP.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: 'Ukuran maksimal 10MB per file.' };
  if (existingCount >= MAX_PHOTOS_PER_HOUSE_TYPE) return { ok: false, message: 'Maksimal 20 foto per tipe rumah.' };
  return { ok: true };
}

/**
 * Mengecilkan gambar di browser sebelum diunggah. Menjaga .data/store.json dan
 * public/uploads tetap ringan, dan meniru perilaku klien yang mengunggah
 * langsung ke Supabase Storage nanti.
 */
export async function downscaleImage(file: File, maxEdge = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.type === 'image/jpeg') return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', 0.82);
  });
}
```

- [ ] **Step 4: Tulis Server Action unggah**

`lib/media/actions.ts`:

```ts
'use server';

import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { newId } from '@/lib/ids';
import { requireSessionUserId } from '@/lib/session';
import { validateUpload, ACCEPTED_TYPES } from './downscale';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Slice 1 menulis ke public/uploads (gitignored) dan menyajikannya sebagai file
 * statis. Ini meniru bucket publik bernama acak di Supabase Storage, sehingga
 * migrasinya sebatas mengganti sumber URL. Hanya untuk pengembangan lokal —
 * filesystem host produksi bersifat sementara.
 */
export async function uploadMediaAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  const userId = await requireSessionUserId();
  const file = formData.get('file');
  const projectId = String(formData.get('projectId') ?? '');
  const houseTypeIdRaw = String(formData.get('houseTypeId') ?? '');
  const houseTypeId = houseTypeIdRaw === '' ? null : houseTypeIdRaw;
  const type = String(formData.get('type') ?? 'photo') as 'photo' | 'floor_plan';

  if (!(file instanceof File)) return { ok: false, message: 'Berkas tidak terbaca.' };

  const existing = (await db.media.listByProject(projectId)).filter(
    (m) => m.houseTypeId === houseTypeId && m.type === type,
  );
  const check = validateUpload({ type: file.type, size: file.size }, existing.length);
  if (!check.ok) return { ok: false, message: check.message };

  const ext = EXT[file.type] ?? 'jpg';
  const id = newId('med');
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, `${id}.${ext}`), Buffer.from(await file.arrayBuffer()));

  await db.media.create({
    userId, projectId, houseTypeId, type,
    url: `/uploads/${id}.${ext}`,
    size: file.size,
  });

  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function deleteMediaAction(mediaId: string, projectId: string): Promise<void> {
  await requireSessionUserId();
  const all = await db.media.listByProject(projectId);
  const target = all.find((m) => m.id === mediaId);
  if (!target) return;

  await rm(path.resolve(process.cwd(), 'public', target.url.replace(/^\//, '')), { force: true });
  await db.media.remove(mediaId);
  revalidatePath(`/projects/${projectId}`);
}

export async function setPrimaryMediaAction(mediaId: string, projectId: string): Promise<void> {
  await requireSessionUserId();
  await db.media.setPrimary(mediaId);
  revalidatePath(`/projects/${projectId}`);
}

export const ACCEPT_ATTR = ACCEPTED_TYPES.join(',');
```

- [ ] **Step 5: Tulis komponen pengunggah**

`components/media/media.css`:

```css
.mu__drop{border:1px dashed var(--ash);border-radius:var(--radius-md);padding:34px;
  text-align:center;background:var(--stone);cursor:pointer;transition:var(--transition-control)}
.mu__drop:hover{border-color:var(--evergreen)}
.mu__grid{margin-top:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.mu__tile{position:relative;height:82px;border-radius:var(--radius-sm);overflow:hidden;
  border:1px solid var(--ash);background:var(--mint)}
.mu__tile img{width:100%;height:100%;object-fit:cover}
.mu__remove{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;
  border:1px solid var(--ash);background:var(--white);color:var(--sage);cursor:pointer;
  display:flex;align-items:center;justify-content:center;line-height:1}
.mu__error{margin-top:8px;font-size:var(--type-caption-size);color:var(--status-error)}
@media (max-width:900px){.mu__grid{grid-template-columns:repeat(2,1fr)}}
```

Tambahkan di `styles/globals.css`: `@import "../components/media/media.css";`

`components/media/MediaUploader.tsx`:

```tsx
'use client';

import { useRef, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { downscaleImage, validateUpload, ACCEPTED_TYPES } from '@/lib/media/downscale';
import { uploadMediaAction, deleteMediaAction } from '@/lib/media/actions';
import type { Media } from '@/lib/data/types';

export interface MediaUploaderProps {
  projectId: string;
  houseTypeId?: string | null;
  type?: 'photo' | 'floor_plan';
  items: Media[];
  title: string;
  caption: string;
}

export function MediaUploader({
  projectId, houseTypeId = null, type = 'photo', items, title, caption,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError(null);

    let count = items.length;
    for (const file of Array.from(fileList)) {
      const check = validateUpload({ type: file.type, size: file.size }, count);
      if (!check.ok) {
        setError(`${file.name}: ${check.message}`);
        continue;
      }

      const blob = await downscaleImage(file);
      const data = new FormData();
      data.set('file', new File([blob], file.name, { type: blob.type || file.type }));
      data.set('projectId', projectId);
      data.set('houseTypeId', houseTypeId ?? '');
      data.set('type', type);

      const result = await uploadMediaAction(data);
      if (!result.ok) setError(`${file.name}: ${result.message}`);
      else count += 1;
    }
  }

  return (
    <div>
      <button
        type="button"
        className="mu__drop"
        style={{ width: '100%' }}
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
        <span style={{ display: 'block', marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>{caption}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(e) => startTransition(() => void handleFiles(e.target.files))}
      />

      {error ? <p className="mu__error">{error}</p> : null}

      {items.length > 0 ? (
        <div className="mu__grid">
          {items.map((item) => (
            <div key={item.id} className="mu__tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" />
              <button
                type="button"
                className="mu__remove"
                aria-label="Hapus foto"
                onClick={() => startTransition(() => void deleteMediaAction(item.id, projectId))}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npm test -- media-validation && npm run build`
Expected: 4 tes PASS; build bersih.

- [ ] **Step 7: Commit**

```bash
git add lib/media components/media styles/globals.css tests/unit/media-validation.test.ts
git commit -m "feat(media): add client-side downscaling, upload action and uploader component"
```

---

## Task 9: Skema Zod dan wizard Create Project

**Files:**
- Create: `lib/schemas/project.ts`, `lib/schemas/houseType.ts`, `lib/schemas/lead.ts`, `lib/schemas/index.ts`
- Create: `app/(dashboard)/projects/actions.ts`, `app/(dashboard)/projects/new/page.tsx`, `components/wizard/{StepProgress,CreateProjectWizard}.tsx`, `components/wizard/wizard.css`
- Modify: `styles/globals.css`
- Test: `tests/unit/schemas.test.ts`

**Interfaces:**
- Consumes: `db`, `Input`/`Button`/`Chip`/`Card`, `MediaUploader`, `requireSessionUserId`
- Produces:
  - `ProjectDraftSchema`, `ProjectPublishSchema`, `HouseTypeSchema`, `LeadSchema`, dan tipe `z.infer` masing-masing
  - `FACILITY_OPTIONS: string[]`
  - `createProjectAction(input): Promise<ActionResult<{ id: string }>>`
  - `updateProjectAction(id, patch): Promise<ActionResult<null>>`
  - `type ActionResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string,string[]> }`
  - `<StepProgress current={number} total={number} />`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ProjectDraftSchema, HouseTypeSchema, LeadSchema } from '@/lib/schemas';

describe('ProjectDraftSchema', () => {
  it('mewajibkan nama project', () => {
    const result = ProjectDraftSchema.safeParse({ name: '', location: '', developer: '', description: '', facilities: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.name?.[0]).toBe('Wajib diisi.');
  });

  it('menerima project minimal dengan nama saja', () => {
    expect(ProjectDraftSchema.safeParse({ name: 'Parkspring Gading' }).success).toBe(true);
  });

  it('menolak slug yang membajak rute aplikasi', () => {
    const result = ProjectDraftSchema.safeParse({ name: 'Parkspring', slug: 'dashboard' });
    expect(result.success).toBe(false);
  });
});

describe('HouseTypeSchema', () => {
  it('menolak harga nol atau negatif', () => {
    const base = { name: 'Villa', price: 0, landArea: 90, buildingArea: 120, bedrooms: 3, bathrooms: 2, carport: 1 };
    const result = HouseTypeSchema.safeParse(base);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.price?.[0]).toBe('Harga harus lebih dari nol.');
  });

  it('menerima spesifikasi lengkap yang valid', () => {
    expect(HouseTypeSchema.safeParse({
      name: 'Villa', price: 2_450_000_000, landArea: 90, buildingArea: 120,
      bedrooms: 3, bathrooms: 2, carport: 1,
    }).success).toBe(true);
  });

  it('menolak carport negatif', () => {
    expect(HouseTypeSchema.safeParse({
      name: 'Villa', price: 1, landArea: 1, buildingArea: 1, bedrooms: 1, bathrooms: 1, carport: -1,
    }).success).toBe(false);
  });
});

describe('LeadSchema', () => {
  it('mewajibkan nama dan nomor telepon Indonesia yang masuk akal', () => {
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '081322449087', message: 'Halo' }).success).toBe(true);
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '123', message: 'Halo' }).success).toBe(false);
  });

  it('menolak email yang tidak valid tapi menerima email kosong', () => {
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '081322449087', message: 'Halo', email: '' }).success).toBe(true);
    expect(LeadSchema.safeParse({ name: 'Rina', phone: '081322449087', message: 'Halo', email: 'bukan-email' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- schemas`
Expected: FAIL — `Cannot find module '@/lib/schemas'`

- [ ] **Step 3: Tulis skema**

`lib/schemas/project.ts`:

```ts
import { z } from 'zod';
import { isReservedSlug } from '@/lib/slug';

export const FACILITY_OPTIONS = [
  'Kolam renang', 'Taman', 'Security 24 jam', 'Masjid', 'Jogging track', 'Clubhouse',
] as const;

const wajib = 'Wajib diisi.';

export const ProjectDraftSchema = z.object({
  name: z.string().trim().min(1, wajib),
  location: z.string().trim().default(''),
  developer: z.string().trim().default(''),
  description: z.string().trim().default(''),
  facilities: z.array(z.string()).default([]),
  slug: z
    .string()
    .trim()
    .optional()
    .refine((s) => !s || !isReservedSlug(s), { message: 'Alamat ini dipakai sistem. Pilih yang lain.' }),
});

/** Publish menuntut lebih dari draft: minimal deskripsi supaya halaman tidak kosong. */
export const ProjectPublishSchema = ProjectDraftSchema.extend({
  description: z.string().trim().min(1, wajib),
});

export type ProjectDraftInput = z.infer<typeof ProjectDraftSchema>;
```

`lib/schemas/houseType.ts`:

```ts
import { z } from 'zod';

const positif = (label: string) => z.coerce.number().int().positive(`${label} harus lebih dari nol.`);
const nolKeAtas = (label: string) => z.coerce.number().int().min(0, `${label} tidak boleh negatif.`);

export const HouseTypeSchema = z.object({
  name: z.string().trim().min(1, 'Wajib diisi.'),
  price: positif('Harga'),
  landArea: positif('Luas tanah'),
  buildingArea: positif('Luas bangunan'),
  bedrooms: nolKeAtas('Kamar tidur'),
  bathrooms: nolKeAtas('Kamar mandi'),
  carport: nolKeAtas('Carport'),
});

export type HouseTypeInput = z.infer<typeof HouseTypeSchema>;
```

`lib/schemas/lead.ts`:

```ts
import { z } from 'zod';

/** Nomor Indonesia: 08xx / +62 / 62, 9–15 digit setelah normalisasi. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s().-]/g, ''))
  .refine((v) => /^(\+?62|0)8\d{7,12}$/.test(v), { message: 'Masukkan nomor WhatsApp yang valid.' });

export const LeadSchema = z.object({
  name: z.string().trim().min(1, 'Wajib diisi.'),
  phone: phoneSchema,
  email: z.union([z.literal(''), z.string().email('Masukkan email yang valid.')]).optional(),
  message: z.string().trim().min(1, 'Wajib diisi.'),
  houseTypeId: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
```

`lib/schemas/index.ts`:

```ts
export { ProjectDraftSchema, ProjectPublishSchema, FACILITY_OPTIONS } from './project';
export type { ProjectDraftInput } from './project';
export { HouseTypeSchema } from './houseType';
export type { HouseTypeInput } from './houseType';
export { LeadSchema, phoneSchema } from './lead';
export type { LeadInput } from './lead';
```

- [ ] **Step 4: Tulis Server Actions project**

`app/(dashboard)/projects/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { ProjectDraftSchema, ProjectPublishSchema } from '@/lib/schemas';
import type { ProjectDraftInput } from '@/lib/schemas';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string[]> };

export async function createProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireSessionUserId();
  const parsed = ProjectDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  // `slug` dibuang di sini: repo yang menurunkannya dari nama sekaligus
  // menyelesaikan bentrok. NewProject sengaja tidak menerimanya.
  const { slug: _slug, ...draft } = parsed.data as ProjectDraftInput;
  const project = await db.projects.create({ userId, ...draft });
  revalidatePath('/dashboard');
  return { ok: true, data: { id: project.id } };
}

export async function updateProjectAction(id: string, input: unknown): Promise<ActionResult<null>> {
  await requireSessionUserId();
  const parsed = ProjectDraftSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  await db.projects.update(id, parsed.data);
  revalidatePath(`/projects/${id}`);
  revalidatePath('/dashboard');
  return { ok: true, data: null };
}

export async function publishProjectAction(id: string): Promise<ActionResult<{ slug: string }>> {
  await requireSessionUserId();
  const project = await db.projects.get(id);
  if (!project) return { ok: false, fieldErrors: { _: ['Project tidak ditemukan.'] } };

  const parsed = ProjectPublishSchema.safeParse(project);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const updated = await db.projects.update(id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
  revalidatePath('/dashboard');
  revalidatePath(`/${updated.slug}`);
  return { ok: true, data: { slug: updated.slug } };
}

export async function deleteProjectAction(id: string): Promise<void> {
  await requireSessionUserId();
  await db.projects.remove(id);
  revalidatePath('/dashboard');
}
```

- [ ] **Step 5: Tulis wizard**

`components/wizard/wizard.css`:

```css
.wz{max-width:640px;margin:0 auto}
.wz__bar{margin-top:14px;display:flex;gap:6px}
.wz__seg{flex:1;height:4px;border-radius:var(--radius-sm);background:var(--ash)}
.wz__seg--done{background:var(--evergreen)}
.wz__panel{margin-top:22px;background:var(--white);border:1px solid var(--ash);
  border-radius:var(--radius-md);padding:28px 30px;display:flex;flex-direction:column;gap:16px}
.wz__foot{margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.wz__chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.wz__chip{cursor:pointer;background:none;border:0;padding:0}
.wz__review{display:grid;grid-template-columns:150px 1fr;gap:12px;font-size:var(--type-body-sm-size)}
@media (max-width:640px){.wz__review{grid-template-columns:1fr;gap:4px}}
```

Tambahkan di `styles/globals.css`: `@import "../components/wizard/wizard.css";`

`components/wizard/StepProgress.tsx`:

```tsx
export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="wz__bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`wz__seg${i < current ? ' wz__seg--done' : ''}`} />
      ))}
    </div>
  );
}
```

`components/wizard/CreateProjectWizard.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Chip, Input } from '@/components/ds';
import { toast } from '@/components/ui';
import { FACILITY_OPTIONS } from '@/lib/schemas';
import { createProjectAction, updateProjectAction } from '@/app/(dashboard)/projects/actions';
import { StepProgress } from './StepProgress';

const TOTAL = 3;

export function CreateProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  /** Terisi begitu langkah 1 disimpan; langkah berikutnya meng-update baris yang sama. */
  const [projectId, setProjectId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', location: '', developer: '', description: '', facilities: [] as string[],
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const toggleFacility = (name: string) =>
    set({
      facilities: form.facilities.includes(name)
        ? form.facilities.filter((f) => f !== name)
        : [...form.facilities, name],
    });

  /**
   * Auto-save di level langkah: setiap "Lanjut" meng-upsert draft, sehingga wizard
   * yang ditinggalkan di tengah jalan tetap meninggalkan project berstatus Draft
   * (Fase 3 flow doc). Langkah terakhir hanya menyimpan lalu berpindah halaman.
   */
  function next() {
    startTransition(async () => {
      const result = projectId
        ? await updateProjectAction(projectId, form)
        : await createProjectAction(form);

      if (!result.ok) {
        setErrors(result.fieldErrors);
        setStep(1);
        return;
      }

      setErrors({});
      const id = projectId ?? (result as { data: { id: string } }).data.id;
      setProjectId(id);

      if (step < TOTAL) {
        setStep(step + 1);
        return;
      }
      toast.success('Project tersimpan');
      router.push(`/projects/${id}`);
    });
  }

  return (
    <div className="wz">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h1 className="lw-h3">Project baru</h1>
        <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>
          Langkah {step} dari {TOTAL}
        </span>
      </div>

      <StepProgress current={step} total={TOTAL} />

      <div className="wz__panel">
        {step === 1 ? (
          <>
            <h2 className="lw-h3">Basic info</h2>
            <Input
              label="Nama project" required value={form.name}
              error={errors.name?.[0]}
              onChange={(e) => set({ name: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Lokasi" value={form.location} onChange={(e) => set({ location: e.target.value })} />
              <Input label="Developer" value={form.developer} onChange={(e) => set({ developer: e.target.value })} />
            </div>
            <Input
              label="Deskripsi" textarea rows={3} value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
            <div>
              <span className="lw-label">Fasilitas umum</span>
              <div className="wz__chips">
                {FACILITY_OPTIONS.map((name) => (
                  <button
                    key={name} type="button" className="wz__chip"
                    aria-pressed={form.facilities.includes(name)}
                    onClick={() => toggleFacility(name)}
                  >
                    <Chip tone={form.facilities.includes(name) ? 'accent' : 'outline'} size="md">
                      {name}
                    </Chip>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="lw-h3">Fasilitas dan media</h2>
            <p style={{ fontSize: 14, color: 'var(--sage)' }}>
              Foto proyek bisa diunggah setelah project tersimpan, di halaman detail. Langkah ini boleh dilewati.
            </p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h2 className="lw-h3">Review</h2>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Nama project</span><span style={{ fontWeight: 500 }}>{form.name || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Lokasi</span><span>{form.location || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Developer</span><span>{form.developer || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Fasilitas</span><span>{form.facilities.join(' · ') || '—'}</span></div>
          </>
        ) : null}
      </div>

      <div className="wz__foot">
        <Button variant="link" size="sm" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          Kembali
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>Tersimpan otomatis</span>
          <Button variant="primary" size="sm" onClick={next} disabled={pending}>
            {step === TOTAL ? 'Simpan project' : 'Lanjut'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

`app/(dashboard)/projects/new/page.tsx`:

```tsx
import { CreateProjectWizard } from '@/components/wizard/CreateProjectWizard';

export const metadata = { title: 'Project baru — Listingku' };

export default function NewProjectPage() {
  return <CreateProjectWizard />;
}
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npm test -- schemas && npm run build`
Expected: 8 tes PASS; build bersih.

- [ ] **Step 7: Commit**

```bash
git add lib/schemas "app/(dashboard)/projects" components/wizard styles/globals.css tests/unit/schemas.test.ts
git commit -m "feat(projects): add Zod schemas, project actions and the three-step create wizard"
```

---

## Task 10: Detail Primary Property dan sheet tipe rumah

**Files:**
- Create: `app/(dashboard)/projects/[id]/page.tsx`, `app/(dashboard)/projects/[id]/houseTypeActions.ts`
- Create: `components/project/{HouseTypeCard,HouseTypeSheet,ProjectHeader}.tsx`, `components/project/project.css`
- Modify: `styles/globals.css`
- Test: `tests/e2e/house-type.spec.ts`

**Interfaces:**
- Consumes: `db`, `HouseTypeSchema`, `Sheet`, `MediaUploader`, `formatRupiahShort`, `formatArea`
- Produces:
  - `createHouseTypeAction(projectId, input): Promise<ActionResult<{ id: string }>>`
  - `updateHouseTypeAction(id, projectId, input): Promise<ActionResult<null>>`
  - `deleteHouseTypeAction(id, projectId): Promise<void>`
  - `<HouseTypeSheet projectId houseType={HouseType|null} media={Media[]} open onOpenChange />`

- [ ] **Step 1: Tulis tes e2e yang gagal**

`tests/e2e/house-type.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('menambah tipe rumah ke project lalu memunculkan ajakan Generate AI', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();

  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill('Uji Tipe Rumah');
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan project' }).click();

  await expect(page.getByRole('heading', { name: 'Uji Tipe Rumah' })).toBeVisible();

  await page.getByRole('button', { name: 'Add house type' }).click();
  await page.getByLabel(/Nama tipe/).fill('Villa');
  await page.getByLabel(/Harga/).fill('2450000000');
  await page.getByLabel(/Luas tanah/).fill('90');
  await page.getByLabel(/Luas bangunan/).fill('120');
  await page.getByLabel(/Kamar tidur/).fill('3');
  await page.getByLabel(/Kamar mandi/).fill('2');
  await page.getByLabel(/Carport/).fill('1');
  await page.getByRole('button', { name: 'Simpan tipe' }).click();

  await expect(page.getByText('Villa')).toBeVisible();
  await expect(page.getByText('Rp 2,45 M')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Generate AI' })).toBeVisible();
});

test('menolak harga nol dengan pesan inline', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await page.goto('/projects/prj_parkspring');

  await page.getByRole('button', { name: 'Add house type' }).click();
  await page.getByLabel(/Nama tipe/).fill('Tipe Nol');
  await page.getByLabel(/Harga/).fill('0');
  await page.getByRole('button', { name: 'Simpan tipe' }).click();

  await expect(page.getByText('Harga harus lebih dari nol.')).toBeVisible();
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm run test:e2e -- house-type`
Expected: FAIL — halaman `/projects/prj_parkspring` belum ada.

- [ ] **Step 3: Tulis Server Actions tipe rumah**

`app/(dashboard)/projects/[id]/houseTypeActions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { HouseTypeSchema } from '@/lib/schemas';
import type { ActionResult } from '../actions';

export async function createHouseTypeAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireSessionUserId();
  const parsed = HouseTypeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const created = await db.houseTypes.create({ projectId, ...parsed.data });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, data: { id: created.id } };
}

export async function updateHouseTypeAction(
  id: string,
  projectId: string,
  input: unknown,
): Promise<ActionResult<null>> {
  await requireSessionUserId();
  const parsed = HouseTypeSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  await db.houseTypes.update(id, parsed.data);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, data: null };
}

export async function deleteHouseTypeAction(id: string, projectId: string): Promise<void> {
  await requireSessionUserId();
  await db.houseTypes.remove(id);
  revalidatePath(`/projects/${projectId}`);
}
```

- [ ] **Step 4: Tulis CSS dan komponen**

`components/project/project.css`:

```css
.pj__back{display:inline-flex;align-items:center;gap:7px;color:var(--sage);
  transition:var(--transition-control)}
.pj__back:hover{color:var(--orange)}
.pj__head{margin-top:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap}
.pj__types{margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pj__type{background:var(--white);border:1px solid var(--ash);border-radius:var(--radius-md);
  overflow:hidden;text-align:left;cursor:pointer;padding:0;transition:var(--transition-control)}
.pj__type:hover{border-color:var(--orange)}
.pj__typethumb{height:104px;background:var(--mint)}
.pj__add{border:1px dashed var(--ash);border-radius:var(--radius-md);display:flex;
  flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--sage);
  min-height:200px;cursor:pointer;background:none;transition:var(--transition-control)}
.pj__add:hover{border-color:var(--evergreen);color:var(--evergreen)}
.pj__aicta{margin-top:26px;display:flex;align-items:center;justify-content:space-between;
  gap:24px;flex-wrap:wrap}
@media (max-width:1100px){.pj__types{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){.pj__types{grid-template-columns:1fr}}
```

Tambahkan di `styles/globals.css`: `@import "../components/project/project.css";`

`components/project/HouseTypeCard.tsx`:

```tsx
import { formatArea, formatRupiahShort } from '@/lib/format';
import type { HouseType, Media } from '@/lib/data/types';

export interface HouseTypeCardProps {
  houseType: HouseType;
  media: Media[];
  onClick: () => void;
}

export function HouseTypeCard({ houseType, media, onClick }: HouseTypeCardProps) {
  const photos = media.filter((m) => m.type === 'photo');
  const plan = media.find((m) => m.type === 'floor_plan');
  const cover = photos.find((m) => m.isPrimary) ?? photos[0];

  return (
    <button type="button" className="pj__type" onClick={onClick}>
      <div className="pj__typethumb">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p className="lw-label">{houseType.name}</p>
        <p className="lw-label" style={{ marginTop: 5, color: 'var(--evergreen)' }}>
          {formatRupiahShort(houseType.price)}
        </p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--sage)' }}>
          LT {formatArea(houseType.landArea)} · LB {formatArea(houseType.buildingArea)} · {houseType.bedrooms} KT
        </p>
        <p className="lw-label-sm" style={{ marginTop: 8, color: 'var(--sage)' }}>
          {photos.length} foto{plan ? ' · denah' : ''}
        </p>
      </div>
    </button>
  );
}
```

`components/project/HouseTypeSheet.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ds';
import { Sheet, toast } from '@/components/ui';
import { MediaUploader } from '@/components/media/MediaUploader';
import { createHouseTypeAction, updateHouseTypeAction, deleteHouseTypeAction } from '@/app/(dashboard)/projects/[id]/houseTypeActions';
import type { HouseType, Media } from '@/lib/data/types';

const EMPTY = { name: '', price: '', landArea: '', buildingArea: '', bedrooms: '', bathrooms: '', carport: '' };

export interface HouseTypeSheetProps {
  projectId: string;
  houseType: HouseType | null;
  media: Media[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HouseTypeSheet({ projectId, houseType, media, open, onOpenChange }: HouseTypeSheetProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState(
    houseType
      ? {
          name: houseType.name,
          price: String(houseType.price),
          landArea: String(houseType.landArea),
          buildingArea: String(houseType.buildingArea),
          bedrooms: String(houseType.bedrooms),
          bathrooms: String(houseType.bathrooms),
          carport: String(houseType.carport),
        }
      : EMPTY,
  );

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  function save() {
    startTransition(async () => {
      const result = houseType
        ? await updateHouseTypeAction(houseType.id, projectId, form)
        : await createHouseTypeAction(projectId, form);

      if (!result.ok) {
        setErrors(result.fieldErrors);
        return;
      }
      toast.success(houseType ? 'Tipe rumah tersimpan' : 'Tipe rumah ditambahkan');
      setErrors({});
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={houseType ? `Edit ${houseType.name}` : 'Tambah tipe rumah'}
      description="Spesifikasi ini tampil sebagai section di landing page project."
      footer={
        <>
          {houseType ? (
            <Button
              variant="link" size="sm"
              onClick={() =>
                startTransition(async () => {
                  await deleteHouseTypeAction(houseType.id, projectId);
                  onOpenChange(false);
                  router.refresh();
                })
              }
            >
              Hapus tipe
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button variant="primary" size="sm" onClick={save} disabled={pending}>Simpan tipe</Button>
        </>
      }
    >
      <Input label="Nama tipe" required value={form.name} error={errors.name?.[0]} onChange={(e) => set({ name: e.target.value })} />
      <Input label="Harga" required inputMode="numeric" suffix="rupiah" value={form.price} error={errors.price?.[0]} onChange={(e) => set({ price: e.target.value })} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Luas tanah" required inputMode="numeric" suffix="m²" value={form.landArea} error={errors.landArea?.[0]} onChange={(e) => set({ landArea: e.target.value })} />
        <Input label="Luas bangunan" required inputMode="numeric" suffix="m²" value={form.buildingArea} error={errors.buildingArea?.[0]} onChange={(e) => set({ buildingArea: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <Input label="Kamar tidur" inputMode="numeric" value={form.bedrooms} error={errors.bedrooms?.[0]} onChange={(e) => set({ bedrooms: e.target.value })} />
        <Input label="Kamar mandi" inputMode="numeric" value={form.bathrooms} error={errors.bathrooms?.[0]} onChange={(e) => set({ bathrooms: e.target.value })} />
        <Input label="Carport" inputMode="numeric" value={form.carport} error={errors.carport?.[0]} onChange={(e) => set({ carport: e.target.value })} />
      </div>

      {houseType ? (
        <>
          <MediaUploader
            projectId={projectId} houseTypeId={houseType.id} type="photo"
            items={media.filter((m) => m.houseTypeId === houseType.id && m.type === 'photo')}
            title="Unggah foto tipe" caption="Interior dan eksterior — JPG/PNG/WebP, maks 10MB, hingga 20 foto"
          />
          <MediaUploader
            projectId={projectId} houseTypeId={houseType.id} type="floor_plan"
            items={media.filter((m) => m.houseTypeId === houseType.id && m.type === 'floor_plan')}
            title="Unggah denah" caption="Floor plan atau site plan tipe ini"
          />
        </>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--sage)' }}>
          Foto dan denah bisa diunggah setelah tipe ini tersimpan.
        </p>
      )}
    </Sheet>
  );
}
```

`components/project/ProjectHeader.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { Button, Card, Chip } from '@/components/ds';
import { HouseTypeCard } from './HouseTypeCard';
import { HouseTypeSheet } from './HouseTypeSheet';
import type { HouseType, Media, Project } from '@/lib/data/types';

export function ProjectDetail({
  project, houseTypes, media,
}: {
  project: Project;
  houseTypes: HouseType[];
  media: Media[];
}) {
  const [editing, setEditing] = useState<HouseType | null>(null);
  const [open, setOpen] = useState(false);

  const openSheet = (houseType: HouseType | null) => {
    setEditing(houseType);
    setOpen(true);
  };

  return (
    <>
      <Link href="/dashboard" className="pj__back lw-label-sm">
        <ArrowLeft size={14} /> Projects
      </Link>

      <div className="pj__head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="lw-h2">{project.name}</h1>
            <Chip tone={project.status === 'published' ? 'tint' : 'outline'}>
              {project.status === 'published' ? 'Published' : 'Draft'}
            </Chip>
          </div>
          <p style={{ marginTop: 7, fontSize: 14, color: 'var(--sage)' }}>
            {[project.location, project.developer, `${houseTypes.length} tipe unit`].filter(Boolean).join(' · ')}
          </p>
          <p style={{ margin: '14px 0 0', maxWidth: 620, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)' }}>
            {project.description}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 className="lw-label-lg">Tipe rumah</h2>
        <Button variant="primary" size="sm" iconLeft={<Plus size={15} />} onClick={() => openSheet(null)}>
          Add house type
        </Button>
      </div>

      <div className="pj__types">
        {houseTypes.map((houseType) => (
          <HouseTypeCard
            key={houseType.id}
            houseType={houseType}
            media={media.filter((m) => m.houseTypeId === houseType.id)}
            onClick={() => openSheet(houseType)}
          />
        ))}
        <button type="button" className="pj__add" onClick={() => openSheet(null)}>
          <Plus size={18} />
          <span style={{ fontSize: 14 }}>Tambah tipe</span>
        </button>
      </div>

      {houseTypes.length > 0 ? (
        <Card tone="tint" padded={false} className="pj__aicta" style={{ padding: '26px 28px' }}>
          <div>
            <p className="lw-label-lg">Data siap. Biarkan AI membuatkan kontennya?</p>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
              Satu kali generate mencakup deskripsi proyek dan konten seluruh tipe rumah.
            </p>
          </div>
          <Link href={`/projects/${project.id}/generate`}>
            <Button variant="primary" size="md" iconLeft={<Sparkles size={16} />}>Generate AI</Button>
          </Link>
        </Card>
      ) : null}

      <HouseTypeSheet
        projectId={project.id}
        houseType={editing}
        media={media}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
```

`app/(dashboard)/projects/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { ProjectDetail } from '@/components/project/ProjectHeader';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireSessionUserId();
  const { id } = await params;

  const project = await db.projects.get(id);
  if (!project || project.userId !== userId) notFound();

  const [houseTypes, media] = await Promise.all([
    db.houseTypes.listByProject(id),
    db.media.listByProject(id),
  ]);

  return <ProjectDetail project={project} houseTypes={houseTypes} media={media} />;
}
```

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npm run test:e2e -- house-type`
Expected: 2 tes PASS.

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/projects/[id]" components/project styles/globals.css tests/e2e/house-type.spec.ts
git commit -m "feat(projects): add project detail screen with house type sheet and media upload"
```

---

## Task 11: `resolve.ts` — rantai override → AI → kosong

**Files:**
- Create: `lib/landing/resolve.ts`
- Test: `tests/unit/resolve.test.ts`

**Interfaces:**
- Consumes: tipe domain Task 6, tipe `Block` Task 5
- Produces:
  - `interface ResolvedHouseType { id, name, slug, price, landArea, buildingArea, bedrooms, bathrooms, carport, shortDescription, sellingPoints, photos, primaryPhoto, floorPlan }`
  - `type ResolvedBlock` — union bertanda `type`, satu anggota per `BlockType`
  - `interface ResolveInput { project, houseTypes, media, agent }`
  - `resolveBlocks(input: ResolveInput): ResolvedBlock[]`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/resolve.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveBlocks } from '@/lib/landing/resolve';
import { defaultBlocks, toggleBlock, updateBlockProps } from '@/lib/landing/blocks';
import { seedStore } from '@/fixtures/seed';
import type { Project } from '@/lib/data/types';

function fixture(overrides: Partial<Project> = {}) {
  const store = seedStore();
  const project = { ...store.projects[0], blocks: defaultBlocks(), ...overrides };
  return {
    project,
    houseTypes: store.houseTypes.filter((h) => h.projectId === 'prj_parkspring'),
    media: [],
    agent: store.agentProfiles[0],
  };
}

const pick = <T extends { type: string }>(blocks: T[], type: string) => blocks.find((b) => b.type === type);

describe('resolveBlocks', () => {
  it('mempertahankan urutan blok dan membuang yang nonaktif', () => {
    const input = fixture();
    const withoutFaq = toggleBlock(input.project.blocks, 'blk_faq');
    const resolved = resolveBlocks({ ...input, project: { ...input.project, blocks: withoutFaq } });
    expect(resolved.map((b) => b.type)).not.toContain('faq');
    expect(resolved[0].type).toBe('hero');
  });

  it('memakai konten AI saat override kosong', () => {
    const input = fixture({
      aiContent: {
        headline: 'Parkspring Gading — Cluster tiga tipe',
        description: 'Deskripsi panjang.',
        sellingPoints: ['Akses tol 5 menit'],
        faq: [{ q: 'Bisa KPR?', a: 'Bisa.' }],
        seo: { title: 'T', description: 'D' },
        captions: { instagram: 'i', facebook: 'f', whatsapp: 'w' },
      },
    });
    const hero = pick(resolveBlocks(input), 'hero') as { title: string };
    expect(hero.title).toBe('Parkspring Gading — Cluster tiga tipe');
  });

  it('mengutamakan override di atas konten AI', () => {
    const base = fixture({
      aiContent: {
        headline: 'Judul dari AI', description: '', sellingPoints: [], faq: [],
        seo: { title: '', description: '' }, captions: { instagram: '', facebook: '', whatsapp: '' },
      },
    });
    const blocks = updateBlockProps(base.project.blocks, 'blk_hero', { title: 'Judul manual' });
    const hero = pick(resolveBlocks({ ...base, project: { ...base.project, blocks } }), 'hero') as { title: string };
    expect(hero.title).toBe('Judul manual');
  });

  it('jatuh ke nama project saat AI dan override sama-sama kosong', () => {
    const hero = pick(resolveBlocks(fixture()), 'hero') as { title: string };
    expect(hero.title).toBe('Parkspring Gading');
  });

  it('menghormati urutan dan penyembunyian tipe rumah', () => {
    const input = fixture();
    const blocks = updateBlockProps(input.project.blocks, 'blk_houseTypes', {
      order: ['hts_grand', 'hts_villa', 'hts_midea'],
      hidden: ['hts_midea'],
    });
    const block = pick(resolveBlocks({ ...input, project: { ...input.project, blocks } }), 'houseTypes') as {
      houseTypes: { name: string }[];
    };
    expect(block.houseTypes.map((h) => h.name)).toEqual(['Grand', 'Villa']);
  });

  it('mengambil nomor WhatsApp dari profil agen bila CTA tidak dioverride', () => {
    const cta = pick(resolveBlocks(fixture()), 'agentCta') as { waNumber: string; defaultMessage: string };
    expect(cta.waNumber).toBe('081288994410');
    expect(cta.defaultMessage).toContain('Parkspring Gading');
  });

  it('menurunkan fasilitas dari project, bukan dari props blok', () => {
    const facilities = pick(resolveBlocks(fixture()), 'facilities') as { items: string[] };
    expect(facilities.items).toEqual(['Kolam renang', 'Security 24 jam', 'Jogging track']);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- resolve`
Expected: FAIL — `Cannot find module '@/lib/landing/resolve'`

- [ ] **Step 3: Tulis implementasi**

`lib/landing/resolve.ts`:

```ts
import type { Block } from './blocks';
import type { AgentProfile, HouseType, Media, Project } from '@/lib/data/types';

export interface ResolvedHouseType {
  id: string;
  name: string;
  slug: string;
  price: number;
  landArea: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  carport: number;
  shortDescription: string;
  sellingPoints: string[];
  photos: Media[];
  primaryPhoto: Media | null;
  floorPlan: Media | null;
}

export type ResolvedBlock =
  | { id: string; type: 'hero'; title: string; subtitle: string; image: Media | null }
  | { id: string; type: 'gallery'; layout: 'carousel' | 'grid'; images: Media[] }
  | { id: string; type: 'highlights'; items: string[] }
  | { id: string; type: 'houseTypes'; houseTypes: ResolvedHouseType[] }
  | { id: string; type: 'specs'; houseTypes: ResolvedHouseType[] }
  | { id: string; type: 'facilities'; items: string[] }
  | { id: string; type: 'floorPlans'; plans: { houseType: ResolvedHouseType; media: Media }[] }
  | { id: string; type: 'location'; address: string; mapUrl: string | null }
  | { id: string; type: 'faq'; items: { q: string; a: string }[] }
  | { id: string; type: 'agentCta'; waNumber: string; defaultMessage: string; agentName: string }
  | { id: string; type: 'contactForm'; askHouseType: boolean; houseTypes: ResolvedHouseType[] };

export interface ResolveInput {
  project: Project;
  houseTypes: HouseType[];
  media: Media[];
  agent: AgentProfile;
}

/** Rantai yang menopang tombol "Use AI suggestion": override, lalu AI, lalu fallback. */
const pick = <T>(override: T | undefined, ai: T | undefined, fallback: T): T => {
  if (override !== undefined && override !== '' && !(Array.isArray(override) && override.length === 0)) return override;
  if (ai !== undefined && ai !== '' && !(Array.isArray(ai) && ai.length === 0)) return ai;
  return fallback;
};

function resolveHouseTypes(input: ResolveInput, block: Block | undefined): ResolvedHouseType[] {
  const props = (block?.props ?? {}) as { order?: string[]; hidden?: string[] };
  const hidden = new Set(props.hidden ?? []);
  const order = props.order;

  const sorted = order
    ? order.map((id) => input.houseTypes.find((h) => h.id === id)).filter((h): h is HouseType => Boolean(h))
    : [...input.houseTypes].sort((a, b) => a.sortOrder - b.sortOrder);

  return sorted
    .filter((h) => !hidden.has(h.id))
    .map((h) => {
      const own = input.media.filter((m) => m.houseTypeId === h.id);
      const photos = own.filter((m) => m.type === 'photo');
      return {
        id: h.id, name: h.name, slug: h.slug, price: h.price,
        landArea: h.landArea, buildingArea: h.buildingArea,
        bedrooms: h.bedrooms, bathrooms: h.bathrooms, carport: h.carport,
        shortDescription: h.aiContent?.shortDescription ?? '',
        sellingPoints: h.aiContent?.sellingPoints ?? [],
        photos,
        primaryPhoto: photos.find((m) => m.isPrimary) ?? photos[0] ?? null,
        floorPlan: own.find((m) => m.type === 'floor_plan') ?? null,
      };
    });
}

export function resolveBlocks(input: ResolveInput): ResolvedBlock[] {
  const { project, media, agent } = input;
  const ai = project.aiContent;
  const projectPhotos = media.filter((m) => m.houseTypeId === null && m.type === 'photo');
  const byId = (type: string) => project.blocks.find((b) => b.type === type);
  const houseTypes = resolveHouseTypes(input, byId('houseTypes'));

  const out: ResolvedBlock[] = [];

  for (const block of project.blocks) {
    if (!block.enabled) continue;
    const p = block.props as Record<string, unknown>;

    switch (block.type) {
      case 'hero':
        out.push({
          id: block.id, type: 'hero',
          title: pick(p.title as string | undefined, ai?.headline, project.name),
          subtitle: pick(p.subtitle as string | undefined, undefined, project.location),
          image: media.find((m) => m.id === p.mediaId) ?? projectPhotos[0] ?? houseTypes[0]?.primaryPhoto ?? null,
        });
        break;

      case 'gallery': {
        const ids = p.mediaIds as string[] | undefined;
        out.push({
          id: block.id, type: 'gallery',
          layout: (p.layout as 'carousel' | 'grid') ?? 'carousel',
          images: ids?.length
            ? ids.map((id) => media.find((m) => m.id === id)).filter((m): m is Media => Boolean(m))
            : [...projectPhotos, ...houseTypes.flatMap((h) => h.photos)],
        });
        break;
      }

      case 'highlights':
        out.push({
          id: block.id, type: 'highlights',
          items: pick(p.items as string[] | undefined, ai?.sellingPoints, []),
        });
        break;

      case 'houseTypes':
        out.push({ id: block.id, type: 'houseTypes', houseTypes });
        break;

      case 'specs':
        out.push({ id: block.id, type: 'specs', houseTypes });
        break;

      case 'facilities':
        out.push({ id: block.id, type: 'facilities', items: project.facilities });
        break;

      case 'floorPlans': {
        const allow = p.mediaIds as string[] | undefined;
        out.push({
          id: block.id, type: 'floorPlans',
          plans: houseTypes
            .filter((h) => h.floorPlan && (!allow?.length || allow.includes(h.floorPlan.id)))
            .map((h) => ({ houseType: h, media: h.floorPlan as Media })),
        });
        break;
      }

      case 'location':
        out.push({
          id: block.id, type: 'location',
          address: pick(p.address as string | undefined, undefined, project.location),
          mapUrl: (p.mapUrl as string | undefined) ?? null,
        });
        break;

      case 'faq':
        out.push({
          id: block.id, type: 'faq',
          items: pick(p.items as { q: string; a: string }[] | undefined, ai?.faq, []),
        });
        break;

      case 'agentCta':
        out.push({
          id: block.id, type: 'agentCta',
          waNumber: pick(p.waNumber as string | undefined, undefined, agent.whatsapp),
          defaultMessage: pick(
            p.defaultMessage as string | undefined,
            undefined,
            `Halo ${agent.fullName}, saya tertarik dengan ${project.name}.`,
          ),
          agentName: agent.fullName,
        });
        break;

      case 'contactForm':
        out.push({
          id: block.id, type: 'contactForm',
          askHouseType: (p.askHouseType as boolean | undefined) ?? true,
          houseTypes,
        });
        break;
    }
  }

  return out;
}
```

- [ ] **Step 4: Jalankan tes untuk memastikan lulus**

Run: `npm test -- resolve`
Expected: 7 tes PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/landing/resolve.ts tests/unit/resolve.test.ts
git commit -m "feat(landing): resolve blocks through the override, AI, fallback chain"
```

---

## Task 12: Tema wireframe dan `BlockRenderer`

**Files:**
- Create: `lib/landing/themes/wireframe/{Hero,Gallery,Highlights,HouseTypes,Specs,Facilities,FloorPlans,Location,Faq,AgentCta,ContactFormBlock}.tsx`, `lib/landing/themes/wireframe/index.ts`
- Create: `lib/landing/themes/index.ts`, `lib/landing/BlockRenderer.tsx`, `lib/landing/landing.css`
- Modify: `styles/globals.css`
- Test: `tests/unit/block-renderer.test.tsx`

**Interfaces:**
- Consumes: `ResolvedBlock` Task 11, komponen DS, `Accordion` Task 3
- Produces:
  - `type BlockComponents = { [K in ResolvedBlock['type']]: ComponentType<{ block: Extract<ResolvedBlock,{type:K}> }> }`
  - `THEMES: Record<ThemeName, BlockComponents>`, `AVAILABLE_THEMES: ThemeName[]`
  - `<BlockRenderer blocks={ResolvedBlock[]} theme={ThemeName} />`
  - `<PlaceholderBox label={string} height={number} />` — kotak berlabel pengganti foto

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/block-renderer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { AVAILABLE_THEMES, THEMES } from '@/lib/landing/themes';
import type { ResolvedBlock } from '@/lib/landing/resolve';

const blocks: ResolvedBlock[] = [
  { id: 'b1', type: 'hero', title: 'Parkspring Gading', subtitle: 'Gading Serpong', image: null },
  {
    id: 'b2', type: 'houseTypes',
    houseTypes: [{
      id: 'h1', name: 'Villa', slug: 'villa', price: 2_450_000_000, landArea: 90, buildingArea: 120,
      bedrooms: 3, bathrooms: 2, carport: 1, shortDescription: '', sellingPoints: [],
      photos: [], primaryPhoto: null, floorPlan: null,
    }],
  },
  { id: 'b3', type: 'facilities', items: ['Kolam renang'] },
];

describe('BlockRenderer', () => {
  it('merender satu section per blok, sesuai urutannya', () => {
    const { container } = render(<BlockRenderer blocks={blocks} theme="modern" />);
    expect(container.querySelectorAll('section')).toHaveLength(3);
  });

  it('menempatkan judul hero sebagai satu-satunya h1', () => {
    render(<BlockRenderer blocks={blocks} theme="modern" />);
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Parkspring Gading');
  });

  it('memformat harga tipe rumah dengan konvensi Indonesia', () => {
    render(<BlockRenderer blocks={blocks} theme="modern" />);
    expect(screen.getByText('Rp 2,45 M')).toBeInTheDocument();
  });

  it('memberi anchor per tipe rumah untuk deep link dari iklan', () => {
    const { container } = render(<BlockRenderer blocks={blocks} theme="modern" />);
    expect(container.querySelector('#villa')).toBeTruthy();
  });

  it('memetakan ketiga nama tema ke set komponen, tapi baru satu yang tersedia', () => {
    expect(Object.keys(THEMES).sort()).toEqual(['luxury', 'modern', 'showcase']);
    expect(AVAILABLE_THEMES).toEqual(['modern']);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- block-renderer`
Expected: FAIL — `Cannot find module '@/lib/landing/BlockRenderer'`

- [ ] **Step 3: Tulis CSS landing**

`lib/landing/landing.css`:

```css
.lp{background:var(--surface-page)}
.lp__section{padding:var(--space-lg) 0}
.lp__section:nth-child(even){background:var(--stone)}
.lp__inner{max-width:var(--container-max);margin:0 auto;padding-inline:var(--container-pad)}
.lp__eyebrow{color:var(--sage)}
.lp__hero{padding:var(--space-lg) 0}
.lp__ph{display:flex;align-items:center;justify-content:center;background:var(--mint);
  border:1px solid var(--ash);border-radius:var(--radius-md);color:var(--sage);
  font-family:var(--font-text);font-size:12px;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;text-align:center;padding:8px}
.lp__grid{display:grid;gap:16px}
.lp__grid--2{grid-template-columns:repeat(2,1fr)}
.lp__grid--3{grid-template-columns:repeat(3,1fr)}
.lp__grid--4{grid-template-columns:repeat(4,1fr)}
.lp__card{background:var(--white);border:1px solid var(--ash);border-radius:var(--radius-md);overflow:hidden}
.lp__pills{position:sticky;top:0;z-index:20;background:var(--white);border-bottom:1px solid var(--ash);
  display:flex;gap:8px;padding:10px 16px;overflow-x:auto}
.lp__pill{border:1px solid var(--ash);border-radius:var(--radius-full);padding:5px 12px;
  font-size:12px;color:var(--sage);white-space:nowrap;transition:var(--transition-control)}
.lp__pill:hover{border-color:var(--evergreen);color:var(--evergreen)}
.lp__specs{width:100%;border-collapse:collapse;font-size:var(--type-body-sm-size)}
.lp__specs th,.lp__specs td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--border-subtle)}
.lp__specs th{color:var(--sage);font-family:var(--font-text);font-weight:600}
.lp__stickybar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--white);
  border-top:1px solid var(--ash);display:none;grid-template-columns:1fr 1fr;gap:10px;padding:10px 14px}
@media (max-width:900px){
  .lp__grid--3,.lp__grid--4{grid-template-columns:repeat(2,1fr)}
  .lp__stickybar{display:grid}
  .lp{padding-bottom:72px}
}
@media (max-width:600px){.lp__grid--2,.lp__grid--3,.lp__grid--4{grid-template-columns:1fr}}
```

Tambahkan di `styles/globals.css`: `@import "../lib/landing/landing.css";`

- [ ] **Step 4: Tulis komponen tema wireframe**

`lib/landing/themes/wireframe/Hero.tsx`:

```tsx
import type { ResolvedBlock } from '../../resolve';

export function PlaceholderBox({ label, height }: { label: string; height: number }) {
  return (
    <div className="lp__ph" style={{ height }} role="img" aria-label={label}>
      {label}
    </div>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <section className="lp__hero">
      <div className="lp__inner">
        {block.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.image.url} alt={block.title}
            style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 'var(--radius-xl)' }}
          />
        ) : (
          <PlaceholderBox label="Hero · foto utama" height={320} />
        )}
        <h1 className="lw-h1" style={{ marginTop: 24 }}>{block.title}</h1>
        <p className="lw-body-lg" style={{ marginTop: 8, color: 'var(--sage)' }}>{block.subtitle}</p>
      </div>
    </section>
  );
}
```

`lib/landing/themes/wireframe/index.ts` — sebelas komponen mengikuti pola yang sama: satu `<section>`, judul `<h2 className="lw-h2">`, isi dari `block`, dan `PlaceholderBox` menggantikan setiap gambar yang belum ada. Tulis satu berkas per blok:

```tsx
// Gallery.tsx
import { PlaceholderBox } from './Hero';
import type { ResolvedBlock } from '../../resolve';

export function Gallery({ block }: { block: Extract<ResolvedBlock, { type: 'gallery' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Galeri</h2>
        <div className={`lp__grid lp__grid--4`} style={{ marginTop: 16 }}>
          {block.images.length > 0
            ? block.images.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={m.url} alt="" style={{ height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              ))
            : Array.from({ length: 4 }, (_, i) => <PlaceholderBox key={i} label="Foto" height={140} />)}
        </div>
      </div>
    </section>
  );
}
```

```tsx
// Highlights.tsx
import type { ResolvedBlock } from '../../resolve';

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Highlights</h2>
        <ul className="lp__grid lp__grid--2" style={{ marginTop: 16, listStyle: 'none', padding: 0 }}>
          {block.items.map((item, i) => (
            <li key={i} className="lw-body">{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

```tsx
// HouseTypes.tsx
import { PlaceholderBox } from './Hero';
import { formatArea, formatRupiahShort } from '@/lib/format';
import type { ResolvedBlock } from '../../resolve';

export function HouseTypes({ block }: { block: Extract<ResolvedBlock, { type: 'houseTypes' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Tipe rumah</h2>
        <div className="lp__grid lp__grid--3" style={{ marginTop: 16 }}>
          {block.houseTypes.map((h) => (
            <article key={h.id} id={h.slug} className="lp__card">
              {h.primaryPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.primaryPhoto.url} alt={h.name} style={{ height: 150, width: '100%', objectFit: 'cover' }} />
              ) : (
                <PlaceholderBox label={`Foto ${h.name}`} height={150} />
              )}
              <div style={{ padding: 18 }}>
                <h3 className="lw-h3">{h.name}</h3>
                <p className="lw-label" style={{ marginTop: 6, color: 'var(--evergreen)' }}>
                  {formatRupiahShort(h.price)}
                </p>
                <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
                  LT {formatArea(h.landArea)} · LB {formatArea(h.buildingArea)} · {h.bedrooms} KT · {h.bathrooms} KM
                </p>
                {h.shortDescription ? (
                  <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)' }}>
                    {h.shortDescription}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

```tsx
// Specs.tsx
import { formatArea, formatRupiahShort } from '@/lib/format';
import type { ResolvedBlock } from '../../resolve';

export function Specs({ block }: { block: Extract<ResolvedBlock, { type: 'specs' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Spesifikasi per tipe</h2>
        <table className="lp__specs" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Tipe</th><th>Harga</th><th>Luas tanah</th><th>Luas bangunan</th>
              <th>Kamar tidur</th><th>Kamar mandi</th><th>Carport</th>
            </tr>
          </thead>
          <tbody>
            {block.houseTypes.map((h) => (
              <tr key={h.id}>
                <td style={{ fontWeight: 600 }}>{h.name}</td>
                <td>{formatRupiahShort(h.price)}</td>
                <td>{formatArea(h.landArea)}</td>
                <td>{formatArea(h.buildingArea)}</td>
                <td>{h.bedrooms}</td><td>{h.bathrooms}</td><td>{h.carport}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

```tsx
// Facilities.tsx
import { Chip } from '@/components/ds';
import type { ResolvedBlock } from '../../resolve';

export function Facilities({ block }: { block: Extract<ResolvedBlock, { type: 'facilities' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Fasilitas</h2>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {block.items.map((item) => <Chip key={item} tone="outline" size="md">{item}</Chip>)}
        </div>
      </div>
    </section>
  );
}
```

```tsx
// FloorPlans.tsx
import { PlaceholderBox } from './Hero';
import type { ResolvedBlock } from '../../resolve';

export function FloorPlans({ block }: { block: Extract<ResolvedBlock, { type: 'floorPlans' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Denah</h2>
        <div className="lp__grid lp__grid--3" style={{ marginTop: 16 }}>
          {block.plans.length > 0
            ? block.plans.map(({ houseType, media }) => (
                <figure key={houseType.id} className="lp__card" style={{ margin: 0, padding: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media.url} alt={`Denah ${houseType.name}`} style={{ width: '100%' }} />
                  <figcaption style={{ marginTop: 10, fontSize: 14, color: 'var(--sage)' }}>
                    Denah {houseType.name}
                  </figcaption>
                </figure>
              ))
            : <PlaceholderBox label="Denah belum diunggah" height={180} />}
        </div>
      </div>
    </section>
  );
}
```

```tsx
// Location.tsx
import type { ResolvedBlock } from '../../resolve';
import { PlaceholderBox } from './Hero';

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Lokasi</h2>
        <p className="lw-body" style={{ marginTop: 8, color: 'var(--sage)' }}>{block.address}</p>
        <div style={{ marginTop: 16 }}><PlaceholderBox label="Peta lokasi" height={220} /></div>
      </div>
    </section>
  );
}
```

```tsx
// Faq.tsx
import { Accordion } from '@/components/ui';
import type { ResolvedBlock } from '../../resolve';

export function Faq({ block }: { block: Extract<ResolvedBlock, { type: 'faq' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Pertanyaan yang sering diajukan</h2>
        <div style={{ marginTop: 16 }}>
          <Accordion items={block.items.map((item, i) => ({ id: `faq-${i}`, question: item.q, answer: item.a }))} />
        </div>
      </div>
    </section>
  );
}
```

```tsx
// AgentCta.tsx — tombol WhatsApp asli dipasang di Task 14; di sini strukturnya saja.
import type { ResolvedBlock } from '../../resolve';

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp__section" data-cta-block={block.id}>
      <div className="lp__inner">
        <h2 className="lw-h2">Tertarik dengan properti ini?</h2>
        <p className="lw-body" style={{ marginTop: 8, color: 'var(--sage)' }}>
          Hubungi {block.agentName} untuk jadwal survei dan simulasi KPR.
        </p>
      </div>
    </section>
  );
}
```

```tsx
// ContactFormBlock.tsx — form fungsional dipasang di Task 14.
import type { ResolvedBlock } from '../../resolve';

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section className="lp__section" data-form-block={block.id}>
      <div className="lp__inner">
        <h2 className="lw-h2">Minta info</h2>
      </div>
    </section>
  );
}
```

`lib/landing/themes/wireframe/index.ts`:

```ts
import { Hero } from './Hero';
import { Gallery } from './Gallery';
import { Highlights } from './Highlights';
import { HouseTypes } from './HouseTypes';
import { Specs } from './Specs';
import { Facilities } from './Facilities';
import { FloorPlans } from './FloorPlans';
import { Location } from './Location';
import { Faq } from './Faq';
import { AgentCta } from './AgentCta';
import { ContactFormBlock } from './ContactFormBlock';
import type { BlockComponents } from '../index';

export const wireframe = {
  hero: Hero, gallery: Gallery, highlights: Highlights, houseTypes: HouseTypes,
  specs: Specs, facilities: Facilities, floorPlans: FloorPlans, location: Location,
  faq: Faq, agentCta: AgentCta, contactForm: ContactFormBlock,
} satisfies BlockComponents;

export { PlaceholderBox } from './Hero';
```

`lib/landing/themes/index.ts`:

```ts
import type { ComponentType } from 'react';
import type { ResolvedBlock } from '../resolve';
import type { ThemeName } from '@/lib/data/types';

/**
 * Setiap komponen tema menerima `projectId` — dipakai blok CTA dan form untuk
 * mencatat event. Blok yang tidak memerlukannya cukup mengabaikan prop itu.
 */
export type BlockThemeProps<K extends ResolvedBlock['type']> = {
  block: Extract<ResolvedBlock, { type: K }>;
  projectId: string;
};

export type BlockComponents = {
  [K in ResolvedBlock['type']]: ComponentType<BlockThemeProps<K>>;
};

/**
 * Ketiga nama tema disimpan di data, tapi selama slice 1 semuanya dipetakan ke
 * satu set komponen wireframe. Saat desain tema asli datang, hanya isi peta ini
 * yang berubah — kolom projects.theme tidak perlu dimigrasi.
 */
export const THEMES: Record<ThemeName, BlockComponents> = {
  modern: wireframe,
  showcase: wireframe,
  luxury: wireframe,
};

/** Tema yang benar-benar sudah punya desain. Sisanya tampil disabled di editor. */
export const AVAILABLE_THEMES: ThemeName[] = ['modern'];
```

Impor `wireframe` di baris atas berkas ini: `import { wireframe } from './wireframe';`. Tidak ada siklus impor karena `wireframe/index.ts` hanya mengimpor **tipe** dari `../index`.

`lib/landing/BlockRenderer.tsx`:

```tsx
import type { ResolvedBlock } from './resolve';
import type { ThemeName } from '@/lib/data/types';
import { THEMES } from './themes';

export function BlockRenderer({
  blocks, theme, projectId,
}: {
  blocks: ResolvedBlock[];
  theme: ThemeName;
  projectId: string;
}) {
  const set = THEMES[theme] ?? THEMES.modern;
  return (
    <>
      {blocks.map((block) => {
        const Component = set[block.type] as React.ComponentType<{ block: ResolvedBlock; projectId: string }>;
        return <Component key={block.id} block={block} projectId={projectId} />;
      })}
    </>
  );
}
```

Setiap komponen tema di Step 4 menerima props `{ block, projectId }`. Komponen yang belum memakai `projectId` (semua kecuali `AgentCta` dan `ContactFormBlock`, yang disambungkan di Task 14) cukup menuliskannya di tanda tangan dan mengabaikannya. Tes di Step 1 meneruskan `projectId="prj_test"`.

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npm test -- block-renderer && npm run build`
Expected: 5 tes PASS; build bersih.

- [ ] **Step 6: Commit**

```bash
git add lib/landing styles/globals.css tests/unit/block-renderer.test.tsx
git commit -m "feat(landing): add wireframe theme components and the shared block renderer"
```

---

## Task 13: Landing publik SSR, metadata, JSON-LD, sitemap

**Files:**
- Create: `app/(public)/[slug]/page.tsx`, `lib/landing/seo.ts`, `app/sitemap.ts`, `app/robots.ts`
- Test: `tests/unit/seo.test.ts`, `tests/e2e/landing-ssr.spec.ts`

**Interfaces:**
- Consumes: `db`, `resolveBlocks`, `BlockRenderer`
- Produces:
  - `siteUrl(): string` — dari `NEXT_PUBLIC_SITE_URL`, default `http://localhost:3000`
  - `buildMetadata(project, houseTypes, heroUrl): Metadata`
  - `buildJsonLd(project, houseTypes, faq): object[]`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/seo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildMetadata, buildJsonLd, siteUrl } from '@/lib/landing/seo';
import { seedStore } from '@/fixtures/seed';

const store = seedStore();
const project = store.projects[0];
const houseTypes = store.houseTypes.filter((h) => h.projectId === 'prj_parkspring');

describe('buildMetadata', () => {
  it('jatuh ke nama dan lokasi project saat SEO belum diisi', () => {
    const meta = buildMetadata(project, houseTypes, null);
    expect(meta.title).toBe('Parkspring Gading — Gading Serpong, Tangerang');
    expect(meta.alternates?.canonical).toBe(`${siteUrl()}/parkspring-gading`);
    expect(meta.openGraph?.title).toBe(meta.title);
  });

  it('mengutamakan SEO yang sudah diisi', () => {
    const meta = buildMetadata({ ...project, seo: { title: 'Judul SEO', description: 'Deskripsi SEO' } }, houseTypes, null);
    expect(meta.title).toBe('Judul SEO');
    expect(meta.description).toBe('Deskripsi SEO');
  });
});

describe('buildJsonLd', () => {
  it('menghasilkan RealEstateListing dengan penawaran per tipe rumah', () => {
    const [listing] = buildJsonLd(project, houseTypes, []);
    expect(listing['@type']).toBe('RealEstateListing');
    expect((listing as { offers: unknown[] }).offers).toHaveLength(3);
  });

  it('menambahkan FAQPage hanya bila ada pertanyaan', () => {
    expect(buildJsonLd(project, houseTypes, [])).toHaveLength(1);
    const withFaq = buildJsonLd(project, houseTypes, [{ q: 'Bisa KPR?', a: 'Bisa.' }]);
    expect(withFaq).toHaveLength(2);
    expect(withFaq[1]['@type']).toBe('FAQPage');
  });
});
```

`tests/e2e/landing-ssr.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('landing publik dirender di server, bukan di klien', async ({ request }) => {
  const response = await request.get('/parkspring-gading');
  expect(response.status()).toBe(200);

  const html = await response.text();
  // Dibuktikan lewat HTML mentah — bukan setelah hidrasi.
  expect(html).toContain('Parkspring Gading');
  expect(html).toContain('Rp 2,45 M');
  expect(html).toContain('"@type":"RealEstateListing"');
  expect(html).toMatch(/<link[^>]+rel="canonical"/);
});

test('project draft tidak dapat diakses publik', async ({ request }) => {
  expect((await request.get('/casa-verde-alam-sutera')).status()).toBe(404);
});

test('sitemap dan robots hanya memuat project published', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/parkspring-gading');
  expect(sitemap).not.toContain('/casa-verde-alam-sutera');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- seo`
Expected: FAIL — `Cannot find module '@/lib/landing/seo'`

- [ ] **Step 3: Tulis helper SEO**

`lib/landing/seo.ts`:

```ts
import type { Metadata } from 'next';
import type { HouseType, Project } from '@/lib/data/types';

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export function buildMetadata(project: Project, houseTypes: HouseType[], heroUrl: string | null): Metadata {
  const url = `${siteUrl()}/${project.slug}`;
  const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : null;

  const title = project.seo.title || [project.name, project.location].filter(Boolean).join(' — ');
  const description =
    project.seo.description ||
    project.aiContent?.seo.description ||
    [
      project.description,
      houseTypes.length ? `${houseTypes.length} tipe unit tersedia.` : '',
      cheapest ? `Mulai Rp${cheapest.toLocaleString('id-ID')}.` : '',
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 300);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Listingku',
      locale: 'id_ID',
      images: heroUrl ? [{ url: heroUrl.startsWith('http') ? heroUrl : `${siteUrl()}${heroUrl}` }] : undefined,
    },
  };
}

export function buildJsonLd(
  project: Project,
  houseTypes: HouseType[],
  faq: { q: string; a: string }[],
): Record<string, unknown>[] {
  const url = `${siteUrl()}/${project.slug}`;

  const listing: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.name,
    description: project.description,
    url,
    address: { '@type': 'PostalAddress', addressLocality: project.location, addressCountry: 'ID' },
    offers: houseTypes.map((h) => ({
      '@type': 'Offer',
      name: h.name,
      price: h.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url: `${url}#${h.slug}`,
    })),
  };

  if (faq.length === 0) return [listing];

  return [
    listing,
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];
}
```

- [ ] **Step 4: Tulis halaman landing, sitemap, robots**

`app/(public)/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/data';
import { resolveBlocks } from '@/lib/landing/resolve';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { buildJsonLd, buildMetadata } from '@/lib/landing/seo';

async function load(slug: string) {
  const project = await db.projects.getBySlug(slug);
  if (!project || project.status !== 'published') return null;

  const [houseTypes, media, agent] = await Promise.all([
    db.houseTypes.listByProject(project.id),
    db.media.listByProject(project.id),
    db.agentProfile.get(project.userId),
  ]);
  if (!agent) return null;

  return { project, houseTypes, media, agent };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: 'Halaman tidak ditemukan — Listingku' };

  const hero = data.media.find((m) => m.type === 'photo')?.url ?? null;
  return buildMetadata(data.project, data.houseTypes, hero);
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();

  const blocks = resolveBlocks(data);
  const faqBlock = blocks.find((b) => b.type === 'faq');
  const jsonLd = buildJsonLd(
    data.project,
    data.houseTypes,
    faqBlock && faqBlock.type === 'faq' ? faqBlock.items : [],
  );

  const typesBlock = blocks.find((b) => b.type === 'houseTypes');

  return (
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {typesBlock && typesBlock.type === 'houseTypes' && typesBlock.houseTypes.length > 1 ? (
        <nav className="lp__pills" aria-label="Lompat ke tipe rumah">
          {typesBlock.houseTypes.map((h) => (
            <a key={h.id} href={`#${h.slug}`} className="lp__pill">{h.name}</a>
          ))}
        </nav>
      ) : null}

      <BlockRenderer blocks={blocks} theme={data.project.theme} />

      <footer className="lp__section">
        <div className="lp__inner" style={{ fontSize: 14, color: 'var(--sage)' }}>
          Dibuat oleh {data.agent.fullName} — <a href={`https://${data.agent.subdomain}.listingku.app`}>lihat profil</a>
        </div>
      </footer>
    </div>
  );
}
```

Catatan `dangerouslySetInnerHTML`: dipakai **hanya** untuk JSON-LD hasil `JSON.stringify` atas objek yang kita bentuk sendiri — bukan untuk konten AI. Spec melarang merender konten AI lewat jalur ini.

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { db } from '@/lib/data';
import { siteUrl } from '@/lib/landing/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await db.projects.listPublished();
  return projects.map((p) => ({
    url: `${siteUrl()}/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/landing/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/projects', '/login', '/api'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npm test -- seo && npm run test:e2e -- landing-ssr`
Expected: 4 tes unit PASS, 3 tes e2e PASS.

- [ ] **Step 6: Commit**

```bash
git add "app/(public)" app/sitemap.ts app/robots.ts lib/landing/seo.ts tests
git commit -m "feat(landing): render public landing server-side with metadata, JSON-LD and sitemap"
```

---

## Task 14: Landing interaktif — WhatsApp, form lead, event

**Files:**
- Create: `app/(public)/[slug]/actions.ts`, `components/landing/{PageViewTracker,WhatsAppLink,ContactForm,StickyCtaBar}.tsx`
- Modify: `lib/landing/themes/wireframe/{AgentCta,ContactFormBlock}.tsx`, `app/(public)/[slug]/page.tsx`
- Test: `tests/e2e/landing-lead.spec.ts`

**Interfaces:**
- Consumes: `db`, `LeadSchema`
- Produces:
  - `submitLeadAction(projectId, input): Promise<ActionResult<null>>`
  - `recordEventAction(projectId, type, houseTypeId?): Promise<void>`
  - `<PageViewTracker projectId />`, `<WhatsAppLink projectId waNumber message>…</WhatsAppLink>`, `<ContactForm projectId houseTypes askHouseType />`, `<StickyCtaBar projectId waNumber message />`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/e2e/landing-lead.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('form kontak menyimpan lead dan menampilkan konfirmasi datar', async ({ page }) => {
  await page.goto('/parkspring-gading');

  await page.getByLabel('Nama').fill('Rina Wijaya');
  await page.getByLabel(/Nomor WhatsApp/).fill('081322449087');
  await page.getByLabel('Pesan').fill('Tipe Midea masih ada unit hadap timur?');
  await page.getByRole('button', { name: 'Kirim pesan' }).click();

  await expect(page.getByText('Permintaan terkirim')).toBeVisible();
});

test('menolak nomor telepon yang tidak valid', async ({ page }) => {
  await page.goto('/parkspring-gading');
  await page.getByLabel('Nama').fill('Rina');
  await page.getByLabel(/Nomor WhatsApp/).fill('123');
  await page.getByLabel('Pesan').fill('Halo');
  await page.getByRole('button', { name: 'Kirim pesan' }).click();

  await expect(page.getByText('Masukkan nomor WhatsApp yang valid.')).toBeVisible();
});

test('tautan WhatsApp mengarah ke wa.me dengan pesan awal', async ({ page }) => {
  await page.goto('/parkspring-gading');
  const link = page.getByRole('link', { name: 'Chat WhatsApp' }).first();
  const href = await link.getAttribute('href');
  expect(href).toContain('wa.me/6281288994410');
  expect(decodeURIComponent(href ?? '')).toContain('Parkspring Gading');
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm run test:e2e -- landing-lead`
Expected: FAIL — form belum ada.

- [ ] **Step 3: Tulis Server Actions publik**

`app/(public)/[slug]/actions.ts`:

```ts
'use server';

import { db } from '@/lib/data';
import { LeadSchema } from '@/lib/schemas';
import type { EventType } from '@/lib/data/types';

export type PublicActionResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string[]> };

export async function submitLeadAction(projectId: string, input: unknown): Promise<PublicActionResult> {
  const parsed = LeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, phone, email, message, houseTypeId } = parsed.data;
  await db.leads.create({
    projectId,
    houseTypeId: houseTypeId && houseTypeId !== '' ? houseTypeId : null,
    name, phone, email: email && email !== '' ? email : null, message,
    source: 'form',
  });
  await db.events.record({ projectId, type: 'form_submit' });
  return { ok: true };
}

export async function recordEventAction(
  projectId: string,
  type: EventType,
  houseTypeId?: string,
): Promise<void> {
  await db.events.record({ projectId, houseTypeId: houseTypeId ?? null, type });
}
```

Action publik ini **tidak** memanggil `requireSessionUserId` — pengirim lead adalah calon pembeli anonim, bukan agen yang login.

- [ ] **Step 4: Tulis komponen interaktif**

`components/landing/PageViewTracker.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { recordEventAction } from '@/app/(public)/[slug]/actions';

/**
 * Kunjungan dicatat dari klien, sekali per sesi — bukan sebagai efek samping saat
 * render, supaya Server Component tetap murni. Bot akan menggelembungkan angkanya;
 * itu diterima untuk MVP.
 */
export function PageViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    const key = `lk_seen_${projectId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    void recordEventAction(projectId, 'visitor');
  }, [projectId]);

  return null;
}
```

`components/landing/WhatsAppLink.tsx`:

```tsx
'use client';

import type { ReactNode } from 'react';
import { recordEventAction } from '@/app/(public)/[slug]/actions';

export function toWaHref(number: string, message: string): string {
  const digits = number.replace(/\D/g, '').replace(/^0/, '62');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppLink({
  projectId, waNumber, message, className, children,
}: {
  projectId: string;
  waNumber: string;
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={toWaHref(waNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => void recordEventAction(projectId, 'whatsapp_click')}
    >
      {children}
    </a>
  );
}
```

`components/landing/ContactForm.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { Button, Input } from '@/components/ds';
import { submitLeadAction } from '@/app/(public)/[slug]/actions';
import type { ResolvedHouseType } from '@/lib/landing/resolve';

export function ContactForm({
  projectId, houseTypes, askHouseType,
}: {
  projectId: string;
  houseTypes: ResolvedHouseType[];
  askHouseType: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', houseTypeId: '' });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  if (sent) {
    return (
      <p className="lw-body" style={{ color: 'var(--status-success)' }}>
        Permintaan terkirim. Kami akan menghubungi Anda.
      </p>
    );
  }

  return (
    <form
      style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await submitLeadAction(projectId, form);
          if (!result.ok) setErrors(result.fieldErrors);
          else setSent(true);
        });
      }}
    >
      <Input label="Nama" required value={form.name} error={errors.name?.[0]} onChange={(e) => set({ name: e.target.value })} />
      <Input label="Nomor WhatsApp" required inputMode="tel" value={form.phone} error={errors.phone?.[0]} onChange={(e) => set({ phone: e.target.value })} />
      <Input label="Email" type="email" hint="Opsional." value={form.email} error={errors.email?.[0]} onChange={(e) => set({ email: e.target.value })} />

      {askHouseType && houseTypes.length > 0 ? (
        <label className="ds-field">
          <span className="ds-field__label">Tipe yang diminati</span>
          <span className="ds-field__control">
            <select
              className="ds-field__input"
              value={form.houseTypeId}
              onChange={(e) => set({ houseTypeId: e.target.value })}
            >
              <option value="">Belum menentukan</option>
              {houseTypes.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </span>
        </label>
      ) : null}

      <Input label="Pesan" textarea rows={3} required value={form.message} error={errors.message?.[0]} onChange={(e) => set({ message: e.target.value })} />
      <Button type="submit" variant="primary" size="md" disabled={pending}>Kirim pesan</Button>
    </form>
  );
}
```

`components/landing/StickyCtaBar.tsx`:

> **Amandemen setelah audit (2026-08-18).** `href="#minta-info"` di bawah tidak
> punya target: `ContactFormBlock.tsx` merender `<section className="lp__section"
> data-form-block={block.id}>` tanpa `id`, jadi tombolnya melompat ke mana-mana.
> Perbaikannya masuk task ini juga (ContactFormBlock sudah terdaftar di *Modify*):
> tambahkan `id="minta-info"` pada `<section>` milik blok form. Anchor diletakkan
> di blok, bukan di halaman, supaya ikut berpindah saat urutan blok diubah editor.


```tsx
'use client';

import { WhatsAppLink } from './WhatsAppLink';

export function StickyCtaBar({
  projectId, waNumber, message,
}: {
  projectId: string;
  waNumber: string;
  message: string;
}) {
  return (
    <div className="lp__stickybar">
      <WhatsAppLink
        projectId={projectId} waNumber={waNumber} message={message}
        className="ds-btn ds-btn--secondary ds-btn--sm ds-btn--block"
      >
        WhatsApp
      </WhatsAppLink>
      <a href="#minta-info" className="ds-btn ds-btn--primary ds-btn--sm ds-btn--block">Minta info</a>
    </div>
  );
}
```

- [ ] **Step 5: Sambungkan ke tema dan halaman**

Ganti isi `lib/landing/themes/wireframe/AgentCta.tsx` menjadi:

```tsx
import { WhatsAppLink } from '@/components/landing/WhatsAppLink';
import type { ResolvedBlock } from '../../resolve';

export function AgentCta({
  block, projectId,
}: {
  block: Extract<ResolvedBlock, { type: 'agentCta' }>;
  projectId?: string;
}) {
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Tertarik dengan properti ini?</h2>
        <p className="lw-body" style={{ marginTop: 8, color: 'var(--sage)' }}>
          Hubungi {block.agentName} untuk jadwal survei dan simulasi KPR.
        </p>
        <div style={{ marginTop: 20 }}>
          <WhatsAppLink
            projectId={projectId ?? ''} waNumber={block.waNumber} message={block.defaultMessage}
            className="ds-btn ds-btn--primary ds-btn--md"
          >
            Chat WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}
```

Ganti `ContactFormBlock.tsx`:

```tsx
import { ContactForm } from '@/components/landing/ContactForm';
import type { ResolvedBlock } from '../../resolve';

export function ContactFormBlock({
  block, projectId,
}: {
  block: Extract<ResolvedBlock, { type: 'contactForm' }>;
  projectId?: string;
}) {
  return (
    <section className="lp__section" id="minta-info">
      <div className="lp__inner">
        <h2 className="lw-h2">Minta info</h2>
        <ContactForm projectId={projectId ?? ''} houseTypes={block.houseTypes} askHouseType={block.askHouseType} />
      </div>
    </section>
  );
}
```

`BlockRenderer` sudah meneruskan `projectId` sejak Task 12 — tidak ada perubahan tanda tangan di sini. Kedua komponen di atas cukup mengganti `projectId?: string` menjadi `projectId: string` agar sesuai `BlockThemeProps`.

Di `app/(public)/[slug]/page.tsx`, tambahkan setelah `<script type="application/ld+json">`:

```tsx
<PageViewTracker projectId={data.project.id} />
```

dan sebelum `</div>` penutup, dengan `cta` diambil dari `blocks.find((b) => b.type === 'agentCta')`:

```tsx
{cta && cta.type === 'agentCta' ? (
  <StickyCtaBar projectId={data.project.id} waNumber={cta.waNumber} message={cta.defaultMessage} />
) : null}
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npm test && npm run test:e2e -- landing-lead`
Expected: seluruh tes unit PASS, 3 tes e2e PASS.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)" components/landing lib/landing tests
git commit -m "feat(landing): wire WhatsApp CTA, contact form and event tracking"
```

---

## Task 15: AI mock dan layar Generate AI

**Files:**
- Create: `lib/ai/{schema,generator,mock,index}.ts`, `app/(dashboard)/projects/[id]/generate/page.tsx`, `app/(dashboard)/projects/[id]/generate/actions.ts`, `components/ai/GeneratePanel.tsx`
- Test: `tests/unit/ai-mock.test.ts`

**Interfaces:**
- Consumes: `db`, tipe `Project`/`HouseType`, `Progress`/`Skeleton`
- Produces:
  - `AiContentSchema` (Zod) dan `type AiContent`
  - `interface ContentGenerator { generate(input: GenerateInput): Promise<AiContent> }`
  - `class AiGenerationError extends Error`
  - `getGenerator(): ContentGenerator`
  - `generateContentAction(projectId): Promise<{ ok: true } | { ok: false; message: string }>`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/ai-mock.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { AiContentSchema } from '@/lib/ai/schema';
import { mockGenerator } from '@/lib/ai/mock';
import { AiGenerationError } from '@/lib/ai/generator';
import { seedStore } from '@/fixtures/seed';

const store = seedStore();
const project = store.projects[0];
const houseTypes = store.houseTypes.filter((h) => h.projectId === 'prj_parkspring');

describe('mockGenerator', () => {
  it('menghasilkan konten yang lolos skema Gemini', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, delayMs: 0 });
    expect(AiContentSchema.safeParse(content).success).toBe(true);
  });

  it('membuat satu entri per tipe rumah, dengan nama yang cocok', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, delayMs: 0 });
    expect(content.houseTypes.map((h) => h.name)).toEqual(['Villa', 'Midea', 'Grand']);
  });

  it('menyusun teks dari data proyek sungguhan, bukan lorem ipsum', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, delayMs: 0 });
    expect(content.headline).toContain('Parkspring Gading');
    expect(content.description).toContain('Gading Serpong');
    expect(content.description.split(/\s+/).length).toBeGreaterThanOrEqual(120);
    expect(content.description.toLowerCase()).not.toContain('lorem');
  });

  it('menghasilkan teks berbeda untuk proyek berbeda', async () => {
    const other = store.projects[2];
    const otherTypes = store.houseTypes.filter((h) => h.projectId === other.id);
    const a = await mockGenerator.generate({ project, houseTypes, delayMs: 0 });
    const b = await mockGenerator.generate({ project: other, houseTypes: otherTypes, delayMs: 0 });
    expect(a.description).not.toBe(b.description);
  });

  it('mematuhi aturan copy: tanpa tanda seru dan tanpa sapaan informal', async () => {
    const content = await mockGenerator.generate({ project, houseTypes, delayMs: 0 });
    const all = JSON.stringify(content);
    expect(all).not.toContain('!');
    expect(all).not.toMatch(/\bkamu\b/i);
  });

  it('gagal dengan AiGenerationError saat mode gagal diaktifkan', async () => {
    await expect(mockGenerator.generate({ project, houseTypes, delayMs: 0, forceFail: true }))
      .rejects.toBeInstanceOf(AiGenerationError);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- ai-mock`
Expected: FAIL — `Cannot find module '@/lib/ai/schema'`

- [ ] **Step 3: Tulis skema dan kontrak generator**

`lib/ai/schema.ts`:

```ts
import { z } from 'zod';

/**
 * Cermin persis `responseSchema` yang akan dikirim ke Gemini 2.5 Flash.
 * Menjaga bentuk ini stabil membuat pergantian mock → Gemini tidak menyentuh UI.
 */
export const AiContentSchema = z.object({
  headline: z.string().min(1),
  description: z.string().min(1),
  houseTypes: z.array(
    z.object({
      name: z.string().min(1),
      shortDescription: z.string().min(1),
      sellingPoints: z.array(z.string().min(1)),
    }),
  ),
  sellingPoints: z.array(z.string().min(1)),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  captions: z.object({
    instagram: z.string().min(1),
    facebook: z.string().min(1),
    whatsapp: z.string().min(1),
  }),
});

export type AiContent = z.infer<typeof AiContentSchema>;
```

`lib/ai/generator.ts`:

```ts
import type { HouseType, Project } from '@/lib/data/types';
import type { AiContent } from './schema';

export interface GenerateInput {
  project: Project;
  houseTypes: HouseType[];
  /** Diekspos supaya tes bisa menjalankan mock tanpa menunggu. */
  delayMs?: number;
  forceFail?: boolean;
}

export interface ContentGenerator {
  readonly model: string;
  generate(input: GenerateInput): Promise<AiContent>;
}

export class AiGenerationError extends Error {
  constructor(message = 'AI sedang gangguan.') {
    super(message);
    this.name = 'AiGenerationError';
  }
}
```

- [ ] **Step 4: Tulis generator mock**

`lib/ai/mock.ts`:

```ts
import { formatArea, formatRupiahShort } from '@/lib/format';
import type { ContentGenerator, GenerateInput } from './generator';
import { AiGenerationError } from './generator';
import type { AiContent } from './schema';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function paragraphs(input: GenerateInput): string {
  const { project, houseTypes } = input;
  const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : 0;
  const names = houseTypes.map((h) => h.name);
  const fasilitas = project.facilities.length ? project.facilities.join(', ').toLowerCase() : 'fasilitas dasar cluster';

  return [
    `${project.name} adalah ${houseTypes.length > 1 ? `cluster dengan ${houseTypes.length} pilihan tipe` : 'hunian'} di ${project.location}${project.developer ? `, dikembangkan oleh ${project.developer}` : ''}. ${project.description}`,
    `Setiap tipe dirancang untuk kebutuhan keluarga yang berbeda. ${names.map((n, i) => `${n} menawarkan ${formatArea(houseTypes[i].landArea)} luas tanah dengan ${formatArea(houseTypes[i].buildingArea)} bangunan dan ${houseTypes[i].bedrooms} kamar tidur`).join('. ')}.`,
    `Kawasan ini dilengkapi ${fasilitas}. Lingkungan cluster tertutup membuat penghuni lebih tenang, sementara akses ke pusat aktivitas tetap singkat untuk perjalanan harian.`,
    `Harga dimulai dari ${formatRupiahShort(cheapest)} untuk tipe ${names[0] ?? 'terkecil'}. Skema pembayaran dapat disesuaikan, termasuk KPR melalui bank rekanan dan cicilan bertahap ke developer.`,
    `Unit terbatas pada setiap tipe. Kami menyarankan Anda menjadwalkan survei lebih awal untuk memastikan posisi dan hadap unit yang masih tersedia di ${project.name}.`,
    `Dokumen legalitas lengkap dan proses serah terima dijadwalkan sesuai perjanjian pengikatan jual beli. Tim pemasaran siap membantu Anda menghitung simulasi angsuran sesuai kemampuan.`,
  ].join(' ');
}

export const mockGenerator: ContentGenerator = {
  model: 'mock-gemini-2.5-flash',

  async generate(input: GenerateInput): Promise<AiContent> {
    const delay = input.delayMs ?? 3000 + Math.floor(Math.random() * 5000);
    if (delay > 0) await wait(delay);

    if (input.forceFail || process.env.AI_MOCK_FAIL === '1') throw new AiGenerationError();

    const { project, houseTypes } = input;
    const cheapest = houseTypes.length ? Math.min(...houseTypes.map((h) => h.price)) : 0;

    return {
      headline: `${project.name} — ${houseTypes.length} tipe hunian di ${project.location.split(',')[0]}`,
      description: paragraphs(input),
      houseTypes: houseTypes.map((h) => ({
        name: h.name,
        shortDescription: `Tipe ${h.name} dengan ${formatArea(h.landArea)} tanah, ${formatArea(h.buildingArea)} bangunan, ${h.bedrooms} kamar tidur dan ${h.bathrooms} kamar mandi.`,
        sellingPoints: [
          `Luas bangunan ${formatArea(h.buildingArea)}`,
          `${h.bedrooms} kamar tidur, ${h.bathrooms} kamar mandi`,
          `Carport ${h.carport} mobil`,
          `Mulai ${formatRupiahShort(h.price)}`,
        ],
      })),
      sellingPoints: [
        ...project.facilities.slice(0, 3),
        `${houseTypes.length} tipe unit dalam satu lokasi`,
        `Harga mulai ${formatRupiahShort(cheapest)}`,
      ].filter(Boolean),
      faq: [
        { q: 'Apakah bisa KPR?', a: 'Bisa. Pengajuan KPR dilayani melalui bank rekanan dan kami bantu siapkan dokumennya.' },
        { q: 'Kapan serah terima unit?', a: 'Jadwal serah terima mengikuti perjanjian pengikatan jual beli dan progres pembangunan tiap tipe.' },
        { q: 'Apakah harga sudah termasuk pajak?', a: 'Harga yang tercantum belum termasuk pajak dan biaya administrasi. Rinciannya kami kirim saat penawaran resmi.' },
      ],
      seo: {
        title: `${project.name} — dijual di ${project.location}`,
        description: `${houseTypes.length} tipe unit di ${project.name}, ${project.location}. Mulai ${formatRupiahShort(cheapest)}. Hubungi agen untuk survei dan simulasi KPR.`,
      },
      captions: {
        instagram: `${houseTypes.length} tipe, satu cluster. ${project.name} — mulai ${formatRupiahShort(cheapest)}. Link di bio untuk detail tiap tipe.`,
        facebook: `${project.name} di ${project.location} membuka ${houseTypes.length} pilihan tipe mulai ${formatRupiahShort(cheapest)}. Kirim pesan untuk price list lengkap.`,
        whatsapp: `Halo, saya bagikan detail ${project.name} di ${project.location}. Tersedia ${houseTypes.length} tipe mulai ${formatRupiahShort(cheapest)}.`,
      },
    };
  },
};
```

`lib/ai/index.ts`:

```ts
import type { ContentGenerator } from './generator';
import { mockGenerator } from './mock';

/** Saat Gemini asli masuk, cabang kedua ditambahkan di sini. Tidak ada tempat lain. */
export function getGenerator(): ContentGenerator {
  return mockGenerator;
}

export { AiContentSchema } from './schema';
export type { AiContent } from './schema';
export { AiGenerationError } from './generator';
export type { ContentGenerator, GenerateInput } from './generator';
```

- [ ] **Step 5: Tulis action dan layar Generate AI**

`app/(dashboard)/projects/[id]/generate/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { getGenerator, AiContentSchema } from '@/lib/ai';

export async function generateContentAction(
  projectId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const userId = await requireSessionUserId();
  const project = await db.projects.get(projectId);
  if (!project) return { ok: false, message: 'Project tidak ditemukan.' };

  const houseTypes = await db.houseTypes.listByProject(projectId);
  if (houseTypes.length === 0) return { ok: false, message: 'Tambahkan minimal satu tipe rumah lebih dulu.' };

  const generator = getGenerator();
  const started = Date.now();

  try {
    const raw = await generator.generate({ project, houseTypes });
    const content = AiContentSchema.parse(raw);

    // Respons dipecah: bagian proyek ke projects, tiap tipe ke barisnya sendiri.
    await db.projects.update(projectId, {
      aiContent: {
        headline: content.headline,
        description: content.description,
        sellingPoints: content.sellingPoints,
        faq: content.faq,
        seo: content.seo,
        captions: content.captions,
      },
      seo: { title: content.seo.title, description: content.seo.description },
    });

    for (const entry of content.houseTypes) {
      const match = houseTypes.find((h) => h.name === entry.name);
      if (!match) continue;
      await db.houseTypes.update(match.id, {
        aiContent: { shortDescription: entry.shortDescription, sellingPoints: entry.sellingPoints },
      });
    }

    await db.aiUsage.record({
      userId, projectId, model: generator.model,
      promptTokens: 0, completionTokens: 0,
      latencyMs: Date.now() - started, success: true, error: null,
    });

    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch (error) {
    await db.aiUsage.record({
      userId, projectId, model: generator.model,
      promptTokens: 0, completionTokens: 0,
      latencyMs: Date.now() - started, success: false,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return { ok: false, message: 'AI sedang gangguan.' };
  }
}
```

`components/ai/GeneratePanel.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button, Card, Chip } from '@/components/ds';
import { Progress, Skeleton } from '@/components/ui';
import { generateContentAction } from '@/app/(dashboard)/projects/[id]/generate/actions';
import type { ProjectAiContent } from '@/lib/data/types';

type Phase = 'idle' | 'loading' | 'done' | 'error';

const STAGES = ['Menyusun deskripsi proyek…', 'Menyusun konten per tipe rumah…', 'Menyusun FAQ dan SEO…'];

export function GeneratePanel({
  projectId, projectName, houseTypeNames, existing,
}: {
  projectId: string;
  projectName: string;
  houseTypeNames: string[];
  existing: ProjectAiContent | null;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(existing ? 'done' : 'idle');
  const [stage, setStage] = useState(0);
  const [, startTransition] = useTransition();

  function run() {
    setPhase('loading');
    setStage(0);
    const ticker = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2500);

    startTransition(async () => {
      const result = await generateContentAction(projectId);
      clearInterval(ticker);
      if (!result.ok) setPhase('error');
      else {
        setPhase('done');
        router.refresh();
      }
    });
  }

  if (phase === 'loading') {
    return (
      <Card style={{ marginTop: 24 }}>
        <Progress value={((stage + 1) / STAGES.length) * 100} />
        <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500 }}>{STAGES[stage]}</p>
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Skeleton width="62%" />
          <Skeleton width="78%" />
          <Skeleton width="44%" />
        </div>
      </Card>
    );
  }

  if (phase === 'error') {
    return (
      <Card style={{ marginTop: 24, textAlign: 'center' }}>
        <p className="lw-label-lg">AI sedang gangguan</p>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          Konten Anda tidak hilang. Coba lagi atau lanjut isi manual.
        </p>
        <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="primary" size="sm" onClick={run}>Coba lagi</Button>
          <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/editor`)}>
            Isi manual saja
          </Button>
        </div>
        <p style={{ marginTop: 24, background: 'var(--stone)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 12, color: 'var(--sage)' }}>
          AI opsional — Anda tetap bisa menyusun konten sendiri dan publish.
        </p>
      </Card>
    );
  }

  if (phase === 'done' && existing) {
    return (
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Headline proyek</p>
          <p className="lw-h3" style={{ marginTop: 10 }}>{existing.headline}</p>
        </Card>
        <Card>
          <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>
            Deskripsi proyek · {existing.description.split(/\s+/).length} kata
          </p>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: 'var(--sage)' }}>
            {existing.description.slice(0, 260)}…
          </p>
        </Card>
        <Card>
          <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Konten per tipe rumah</p>
          <p style={{ marginTop: 10, fontSize: 14, color: 'var(--sage)' }}>
            {houseTypeNames.join(' · ')} — tersusun.
          </p>
        </Card>
        <Card>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip tone="tint">Instagram</Chip>
            <Chip tone="outline">Facebook</Chip>
            <Chip tone="outline">WhatsApp</Chip>
          </div>
          <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)' }}>
            {existing.captions.instagram}
          </p>
        </Card>
        <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
          <Button variant="primary" size="sm" onClick={() => router.push(`/projects/${projectId}/editor`)}>
            Lanjut ke editor
          </Button>
          <Button variant="secondary" size="sm" onClick={run}>Ulangi</Button>
        </div>
      </div>
    );
  }

  return (
    <Card style={{ marginTop: 24, textAlign: 'center', padding: '56px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--orange)' }}>
        <Sparkles size={26} />
      </div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
        <Button variant="primary" size="md" onClick={run}>Generate AI</Button>
      </div>
      <p style={{ marginTop: 16, fontSize: 14, color: 'var(--sage)', maxWidth: 420, margin: '16px auto 0', lineHeight: 1.6 }}>
        Sekitar 15 detik — AI menyusun deskripsi proyek untuk {projectName}, konten per tipe rumah, selling points, FAQ, dan SEO.
      </p>
      <button
        type="button"
        style={{ marginTop: 22, background: 'none', border: 0, fontSize: 12, color: 'var(--sage)', cursor: 'pointer' }}
        onClick={() => setPhase('error')}
      >
        Lihat state error
      </button>
    </Card>
  );
}
```

`app/(dashboard)/projects/[id]/generate/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { GeneratePanel } from '@/components/ai/GeneratePanel';

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireSessionUserId();
  const { id } = await params;

  const project = await db.projects.get(id);
  if (!project || project.userId !== userId) notFound();
  const houseTypes = await db.houseTypes.listByProject(id);

  return (
    <div style={{ maxWidth: 780 }}>
      <Link href={`/projects/${id}`} className="pj__back lw-label-sm">
        <ArrowLeft size={14} /> {project.name}
      </Link>
      <h1 className="lw-h2" style={{ marginTop: 14 }}>Generate konten AI</h1>
      <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
        Satu kali jalan untuk seluruh primary property — proyek dan semua tipe rumahnya.
      </p>
      <GeneratePanel
        projectId={id}
        projectName={project.name}
        houseTypeNames={houseTypes.map((h) => h.name)}
        existing={project.aiContent}
      />
    </div>
  );
}
```

Catatan jujur untuk reviewer: tahapan bercentang di layar loading **nyata di mock**, tapi akan menjadi estimasi berbasis waktu saat Gemini asli masuk — panggilan Gemini hanya satu round trip dan tidak melaporkan progres. Ini disepakati di spec §9, bukan bug.

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npm test -- ai-mock && npm run build`
Expected: 6 tes PASS; build bersih.

- [ ] **Step 7: Commit**

```bash
git add lib/ai components/ai "app/(dashboard)/projects/[id]/generate" tests/unit/ai-mock.test.ts
git commit -m "feat(ai): add mock content generator behind the Gemini response schema"
```

---

## Task 16: Block editor terpimpin

**Files:**
- Create: `app/(dashboard)/projects/[id]/editor/page.tsx`, `app/(dashboard)/projects/[id]/editor/actions.ts`
- Create: `components/editor/{EditorShell,BlockList,BlockSettingsPanel,PreviewFrame,ThemePicker}.tsx`, `components/editor/editor.css`
- Modify: `styles/globals.css`
- Test: `tests/e2e/editor.spec.ts`

**Interfaces:**
- Consumes: `resolveBlocks`, `BlockRenderer`, reducer `moveBlock`/`toggleBlock`/`updateBlockProps`, `AVAILABLE_THEMES`
- Produces:
  - `saveBlocksAction(projectId, blocks): Promise<{ ok: boolean }>`
  - `setThemeAction(projectId, theme): Promise<{ ok: boolean }>`
  - `<EditorShell project houseTypes media agent />`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/e2e/editor.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await page.goto('/projects/prj_parkspring/editor');
});

test('menampilkan seluruh sebelas blok dalam urutan default', async ({ page }) => {
  const rows = page.getByRole('button', { name: /^Blok / });
  await expect(rows).toHaveCount(11);
  await expect(rows.first()).toHaveAccessibleName('Blok Hero');
});

test('mengedit judul hero dan melihatnya di pratinjau', async ({ page }) => {
  await page.getByRole('button', { name: 'Blok Hero' }).click();
  await page.getByLabel('Judul').fill('Judul hasil edit manual');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();

  await expect(page.getByText('Tersimpan')).toBeVisible();
  await expect(page.locator('.ed__preview').getByRole('heading', { level: 1 }))
    .toHaveText('Judul hasil edit manual');
});

test('panel blok FAQ menyediakan toggle tampil/sembunyi', async ({ page }) => {
  // Seed belum punya konten AI, jadi blok FAQ kosong dan tidak dirender.
  await expect(page.locator('.ed__preview').getByRole('heading', { name: /Pertanyaan yang sering/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Blok FAQ' }).click();
  const toggle = page.getByRole('switch', { name: 'Tampilkan blok' });
  await expect(toggle).toBeVisible();
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

test('menaikkan urutan blok Galeri', async ({ page }) => {
  await page.getByRole('button', { name: 'Naikkan Galeri' }).click();
  await expect(page.getByRole('button', { name: /^Blok / }).first()).toHaveAccessibleName('Blok Galeri');
});

test('tema Showcase dan Luxury tampil nonaktif sampai desainnya masuk', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Showcase' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Luxury' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Modern' })).toBeEnabled();
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm run test:e2e -- editor`
Expected: FAIL — halaman editor belum ada.

- [ ] **Step 3: Tulis action editor**

`app/(dashboard)/projects/[id]/editor/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import type { Block } from '@/lib/landing/blocks';
import type { ThemeName } from '@/lib/data/types';

export async function saveBlocksAction(projectId: string, blocks: Block[]): Promise<{ ok: boolean }> {
  await requireSessionUserId();
  const project = await db.projects.update(projectId, { blocks });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/${project.slug}`);
  return { ok: true };
}

export async function setThemeAction(projectId: string, theme: ThemeName): Promise<{ ok: boolean }> {
  await requireSessionUserId();
  const project = await db.projects.update(projectId, { theme });
  revalidatePath(`/${project.slug}`);
  return { ok: true };
}
```

- [ ] **Step 4: Tulis CSS editor**

`components/editor/editor.css`:

```css
.ed__grid{margin-top:18px;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start}
.ed__previewwrap{min-width:0;background:var(--white);border:1px solid var(--ash);
  border-radius:var(--radius-md);padding:14px}
.ed__previewhead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 4px 12px}
.ed__device{display:flex;gap:6px;font-family:var(--font-text);font-weight:600;font-size:12px}
.ed__devicebtn{border:1px solid var(--ash);color:var(--sage);padding:4px 9px;
  border-radius:var(--radius-sm);background:none;cursor:pointer;text-transform:uppercase;letter-spacing:.04em}
.ed__devicebtn[aria-pressed="true"]{background:var(--evergreen);color:var(--white);border-color:var(--evergreen)}
.ed__stage{background:var(--stone);border-radius:var(--radius-sm);padding:14px;max-height:640px;overflow:auto}
.ed__preview{transform-origin:top left;background:var(--white)}
.ed__frame{border:1px solid transparent;border-radius:var(--radius-sm);padding:2px;
  cursor:pointer;display:block;width:100%;text-align:left;background:none}
.ed__frame[aria-current="true"]{border-color:var(--evergreen);border-width:2px}
.ed__panel{background:var(--white);border:1px solid var(--ash);border-radius:var(--radius-md);
  padding:18px;position:sticky;top:24px}
.ed__themes{margin-top:8px;display:flex;gap:6px}
.ed__theme{flex:1;text-align:center;border:1px solid var(--ash);border-radius:var(--radius-sm);
  padding:8px;font-size:12px;color:var(--sage);background:none;cursor:pointer}
.ed__theme[aria-pressed="true"]{border-color:var(--evergreen);background:var(--mint);
  color:var(--evergreen);font-weight:600}
.ed__theme:disabled{opacity:.4;cursor:not-allowed}
.ed__blocks{margin-top:8px;display:flex;flex-direction:column;gap:1px;max-height:280px;overflow-y:auto}
.ed__row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;
  border-radius:var(--radius-sm);cursor:pointer;font-size:14px;color:var(--evergreen);background:none;border:0}
.ed__row[aria-current="true"]{background:var(--mint);font-weight:600}
.ed__row--off{color:var(--sage);text-decoration:line-through}
.ed__rowbtns{display:flex;align-items:center;gap:4px;color:var(--sage)}
.ed__settings{margin-top:18px;border-top:1px solid var(--stone);padding-top:16px;
  display:flex;flex-direction:column;gap:12px}
@media (max-width:1100px){.ed__grid{grid-template-columns:1fr}.ed__panel{position:static}}
```

Tambahkan di `styles/globals.css`: `@import "../components/editor/editor.css";`

- [ ] **Step 5: Tulis komponen editor**

`components/editor/EditorShell.tsx`:

```tsx
'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ds';
import { toast } from '@/components/ui';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { resolveBlocks } from '@/lib/landing/resolve';
import { BLOCK_LABELS, moveBlock, toggleBlock, updateBlockProps } from '@/lib/landing/blocks';
import type { Block } from '@/lib/landing/blocks';
import { AVAILABLE_THEMES } from '@/lib/landing/themes';
import { saveBlocksAction, setThemeAction } from '@/app/(dashboard)/projects/[id]/editor/actions';
import type { AgentProfile, HouseType, Media, Project, ThemeName } from '@/lib/data/types';
import { BlockSettingsPanel } from './BlockSettingsPanel';

const ALL_THEMES: ThemeName[] = ['modern', 'showcase', 'luxury'];
const THEME_LABEL: Record<ThemeName, string> = { modern: 'Modern', showcase: 'Showcase', luxury: 'Luxury' };

export function EditorShell({
  project, houseTypes, media, agent,
}: {
  project: Project;
  houseTypes: HouseType[];
  media: Media[];
  agent: AgentProfile;
}) {
  const [blocks, setBlocks] = useState<Block[]>(project.blocks);
  const [theme, setTheme] = useState<ThemeName>(project.theme);
  const [selected, setSelected] = useState(blocks[0]?.id ?? '');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [pending, startTransition] = useTransition();

  const resolved = useMemo(
    () => resolveBlocks({ project: { ...project, blocks }, houseTypes, media, agent }),
    [project, blocks, houseTypes, media, agent],
  );

  const current = blocks.find((b) => b.id === selected);

  function save() {
    startTransition(async () => {
      await saveBlocksAction(project.id, blocks);
      toast.success('Tersimpan');
    });
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 className="lw-h3">Sesuaikan halaman</h1>
          <p className="lw-label-sm" style={{ marginTop: 5, color: 'var(--sage)' }}>
            listingku.app/{project.slug} · {project.status === 'published' ? 'Live' : 'Draft'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/${project.slug}`} target="_blank">
            <Button variant="secondary" size="sm">Preview</Button>
          </Link>
          <Link href={`/projects/${project.id}/publish`}>
            <Button variant="primary" size="sm">Publish</Button>
          </Link>
        </div>
      </div>

      <div className="ed__grid">
        <div className="ed__previewwrap">
          <div className="ed__previewhead">
            <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>Pratinjau</span>
            <div className="ed__device">
              {(['desktop', 'mobile'] as const).map((d) => (
                <button key={d} type="button" className="ed__devicebtn" aria-pressed={device === d} onClick={() => setDevice(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="ed__stage">
            {/* Pratinjau memakai BlockRenderer yang SAMA dengan halaman live —
                karena itu tidak mungkin berbeda dari yang dilihat calon pembeli. */}
            <div
              className="ed__preview"
              style={
                device === 'mobile'
                  ? { width: 390, transform: 'scale(.72)' }
                  : { width: 1200, transform: 'scale(.42)' }
              }
            >
              {resolved.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  className="ed__frame"
                  aria-current={block.id === selected}
                  aria-label={`Pilih blok ${BLOCK_LABELS[blocks.find((b) => b.id === block.id)!.type]}`}
                  onClick={() => setSelected(block.id)}
                >
                  <BlockRenderer blocks={[block]} theme={theme} projectId={project.id} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ed__panel">
          <p className="lw-label">Tema</p>
          <div className="ed__themes">
            {ALL_THEMES.map((t) => (
              <button
                key={t}
                type="button"
                className="ed__theme"
                aria-pressed={theme === t}
                disabled={!AVAILABLE_THEMES.includes(t)}
                onClick={() => {
                  setTheme(t);
                  startTransition(async () => { await setThemeAction(project.id, t); });
                }}
              >
                {THEME_LABEL[t]}
              </button>
            ))}
          </div>
          <p className="lw-caption" style={{ marginTop: 6, color: 'var(--sage)' }}>
            Showcase dan Luxury tersedia setelah desain temanya masuk.
          </p>

          <p className="lw-label" style={{ marginTop: 18 }}>Blok</p>
          <div className="ed__blocks">
            {blocks.map((block) => (
              <div key={block.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`ed__row${block.enabled ? '' : ' ed__row--off'}`}
                  style={{ flex: 1 }}
                  aria-current={block.id === selected}
                  aria-label={`Blok ${BLOCK_LABELS[block.type]}`}
                  onClick={() => setSelected(block.id)}
                >
                  {BLOCK_LABELS[block.type]}
                </button>
                <span className="ed__rowbtns">
                  <button type="button" aria-label={`Naikkan ${BLOCK_LABELS[block.type]}`} onClick={() => setBlocks(moveBlock(blocks, block.id, 'up'))}>
                    <ChevronUp size={13} />
                  </button>
                  <button type="button" aria-label={`Turunkan ${BLOCK_LABELS[block.type]}`} onClick={() => setBlocks(moveBlock(blocks, block.id, 'down'))}>
                    <ChevronDown size={13} />
                  </button>
                </span>
              </div>
            ))}
          </div>

          {current ? (
            <BlockSettingsPanel
              block={current}
              houseTypes={houseTypes}
              media={media}
              onToggle={() => setBlocks(toggleBlock(blocks, current.id))}
              onPatch={(patch) => setBlocks(updateBlockProps(blocks, current.id, patch))}
            />
          ) : null}

          <div style={{ marginTop: 18 }}>
            <Button variant="primary" size="sm" fullWidth onClick={save} disabled={pending}>
              Simpan perubahan
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
```

`components/editor/BlockSettingsPanel.tsx`:

```tsx
'use client';

import * as Switch from '@radix-ui/react-switch';
import { Input } from '@/components/ds';
import { BLOCK_LABELS } from '@/lib/landing/blocks';
import type { Block } from '@/lib/landing/blocks';
import type { HouseType, Media } from '@/lib/data/types';

export function BlockSettingsPanel({
  block, houseTypes, media, onToggle, onPatch,
}: {
  block: Block;
  houseTypes: HouseType[];
  media: Media[];
  onToggle: () => void;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const p = block.props as Record<string, unknown>;

  return (
    <div className="ed__settings">
      <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Pengaturan blok</p>
      <p className="lw-label">{BLOCK_LABELS[block.type]}</p>

      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 14 }}>Tampilkan blok</span>
        <Switch.Root
          checked={block.enabled}
          onCheckedChange={onToggle}
          aria-label="Tampilkan blok"
          style={{
            width: 40, height: 23, borderRadius: 999, padding: 3,
            background: block.enabled ? 'var(--evergreen)' : 'var(--ash)', border: 0, cursor: 'pointer',
          }}
        >
          <Switch.Thumb
            style={{
              display: 'block', width: 17, height: 17, borderRadius: '50%', background: 'var(--white)',
              transform: block.enabled ? 'translateX(17px)' : 'translateX(0)',
              transition: 'transform var(--dur-base) var(--ease-standard)',
            }}
          />
        </Switch.Root>
      </label>

      {block.type === 'hero' ? (
        <>
          <Input label="Judul" value={(p.title as string) ?? ''} hint="Kosongkan untuk memakai judul dari AI." onChange={(e) => onPatch({ title: e.target.value || undefined })} />
          <Input label="Subjudul" value={(p.subtitle as string) ?? ''} onChange={(e) => onPatch({ subtitle: e.target.value || undefined })} />
          <div>
            <span className="lw-caption" style={{ color: 'var(--evergreen)' }}>Gambar latar</span>
            <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {media.filter((m) => m.type === 'photo').slice(0, 6).map((m) => (
                <button
                  key={m.id} type="button" onClick={() => onPatch({ mediaId: m.id })}
                  style={{
                    height: 40, borderRadius: 4, background: 'var(--mint)', cursor: 'pointer',
                    border: p.mediaId === m.id ? '2px solid var(--evergreen)' : '1px solid var(--ash)',
                  }}
                  aria-label="Pilih gambar latar"
                />
              ))}
            </div>
          </div>
        </>
      ) : null}

      {block.type === 'gallery' ? (
        <div>
          <span className="lw-caption" style={{ color: 'var(--evergreen)' }}>Layout</span>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            {(['carousel', 'grid'] as const).map((layout) => (
              <button
                key={layout} type="button" className="ed__theme" aria-pressed={p.layout === layout}
                onClick={() => onPatch({ layout })}
              >
                {layout === 'carousel' ? 'Carousel' : 'Grid'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {block.type === 'houseTypes' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {houseTypes.map((h) => {
            const hidden = ((p.hidden as string[]) ?? []).includes(h.id);
            return (
              <button
                key={h.id} type="button" className="ed__row" style={{ border: '1px solid var(--ash)' }}
                onClick={() =>
                  onPatch({
                    hidden: hidden
                      ? ((p.hidden as string[]) ?? []).filter((id) => id !== h.id)
                      : [...(((p.hidden as string[]) ?? [])), h.id],
                  })
                }
              >
                {h.name}
                <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>{hidden ? 'Sembunyi' : 'Tampil'}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {block.type === 'faq' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(((p.items as { q: string; a: string }[]) ?? [])).map((item, i) => (
            <Input
              key={i} label={`Pertanyaan ${i + 1}`} value={item.q}
              onChange={(e) => {
                const items = [...((p.items as { q: string; a: string }[]) ?? [])];
                items[i] = { ...items[i], q: e.target.value };
                onPatch({ items });
              }}
            />
          ))}
          <button
            type="button" className="ds-btn ds-btn--link ds-btn--sm"
            onClick={() => onPatch({ items: [...(((p.items as { q: string; a: string }[]) ?? [])), { q: '', a: '' }] })}
          >
            Tambah FAQ
          </button>
        </div>
      ) : null}

      {block.type === 'agentCta' ? (
        <>
          <Input label="Nomor WhatsApp" value={(p.waNumber as string) ?? ''} hint="Kosongkan untuk memakai nomor dari profil." onChange={(e) => onPatch({ waNumber: e.target.value || undefined })} />
          <Input label="Pesan default" textarea rows={2} value={(p.defaultMessage as string) ?? ''} onChange={(e) => onPatch({ defaultMessage: e.target.value || undefined })} />
        </>
      ) : null}

      {block.type === 'highlights' ? (
        <Input
          label="Selling points" textarea rows={4}
          hint="Satu poin per baris. Kosongkan untuk memakai hasil AI."
          value={(((p.items as string[]) ?? []).join('\n'))}
          onChange={(e) => {
            const items = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
            onPatch({ items: items.length ? items : undefined });
          }}
        />
      ) : null}

      {block.type === 'location' ? (
        <>
          <Input label="Alamat" value={(p.address as string) ?? ''} onChange={(e) => onPatch({ address: e.target.value || undefined })} />
          <Input label="URL peta" value={(p.mapUrl as string) ?? ''} onChange={(e) => onPatch({ mapUrl: e.target.value || undefined })} />
        </>
      ) : null}

      {block.type === 'contactForm' ? (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 14 }}>Tanyakan tipe yang diminati</span>
          <input
            type="checkbox"
            checked={(p.askHouseType as boolean) ?? true}
            onChange={(e) => onPatch({ askHouseType: e.target.checked })}
          />
        </label>
      ) : null}

      {block.type === 'specs' || block.type === 'facilities' ? (
        <p className="lw-caption" style={{ color: 'var(--sage)' }}>
          Isi blok ini diturunkan otomatis dari data project dan tipe rumah. Ubah datanya di halaman detail project.
        </p>
      ) : null}

      {block.type === 'floorPlans' ? (
        <p className="lw-caption" style={{ color: 'var(--sage)' }}>
          Menampilkan denah yang sudah diunggah pada setiap tipe rumah.
        </p>
      ) : null}
    </div>
  );
}
```

Tambahkan dependensi: `npm install @radix-ui/react-switch@^1`.

`app/(dashboard)/projects/[id]/editor/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { EditorShell } from '@/components/editor/EditorShell';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireSessionUserId();
  const { id } = await params;

  const project = await db.projects.get(id);
  if (!project || project.userId !== userId) notFound();

  const [houseTypes, media, agent] = await Promise.all([
    db.houseTypes.listByProject(id),
    db.media.listByProject(id),
    db.agentProfile.get(userId),
  ]);
  if (!agent) notFound();

  return <EditorShell project={project} houseTypes={houseTypes} media={media} agent={agent} />;
}
```

- [ ] **Step 6: Jalankan tes untuk memastikan lulus**

Run: `npm run test:e2e -- editor`
Expected: 5 tes PASS.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/projects/[id]/editor" components/editor styles/globals.css package.json tests/e2e/editor.spec.ts
git commit -m "feat(editor): add guided block editor sharing the live block renderer"
```

---

## Task 17: Publish, QR, dan share

**Files:**
- Create: `app/(dashboard)/projects/[id]/publish/page.tsx`, `app/api/qr/route.ts`, `components/publish/PublishPanel.tsx`
- Test: `tests/unit/qr-route.test.ts`, `tests/e2e/publish.spec.ts`

**Interfaces:**
- Consumes: `publishProjectAction` (Task 9), `Dialog`, `toast`, `qrcode`
- Produces:
  - `GET /api/qr?slug=<slug>&format=png|svg&download=1` — 400 bila slug kosong, 404 bila project tidak published
  - `<PublishPanel project={Project} published={boolean} captions={ProjectAiContent['captions']|null} />`

- [ ] **Step 1: Tulis tes yang gagal**

`tests/unit/qr-route.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { qrTargetUrl, isValidQrFormat } from '@/app/api/qr/helpers';

describe('helper QR', () => {
  it('menyusun URL absolut dari slug', () => {
    expect(qrTargetUrl('parkspring-gading')).toMatch(/\/parkspring-gading$/);
  });

  it('hanya menerima png dan svg', () => {
    expect(isValidQrFormat('png')).toBe(true);
    expect(isValidQrFormat('svg')).toBe(true);
    expect(isValidQrFormat('pdf')).toBe(false);
    expect(isValidQrFormat(null)).toBe(false);
  });
});
```

`tests/e2e/publish.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
});

test('mempublikasikan project draft setelah konfirmasi', async ({ page }) => {
  await page.goto('/projects/prj_casaverde/publish');
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();

  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();
  await expect(page.getByText('listingku.app/casa-verde-alam-sutera')).toBeVisible();
});

test('menyediakan QR dalam PNG dan SVG untuk project yang sudah live', async ({ page, request }) => {
  await page.goto('/projects/prj_parkspring/publish');
  await expect(page.getByRole('img', { name: /QR/ })).toBeVisible();

  const png = await request.get('/api/qr?slug=parkspring-gading&format=png');
  expect(png.headers()['content-type']).toContain('image/png');

  const svg = await request.get('/api/qr?slug=parkspring-gading&format=svg');
  expect(await svg.text()).toContain('<svg');
});

test('menolak QR untuk project yang belum published', async ({ request }) => {
  expect((await request.get('/api/qr?slug=tidak-ada&format=png')).status()).toBe(404);
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `npm test -- qr-route`
Expected: FAIL — `Cannot find module '@/app/api/qr/helpers'`

- [ ] **Step 3: Tulis route QR**

`app/api/qr/helpers.ts`:

```ts
import { siteUrl } from '@/lib/landing/seo';

export const QR_FORMATS = ['png', 'svg'] as const;
export type QrFormat = (typeof QR_FORMATS)[number];

export function qrTargetUrl(slug: string): string {
  return `${siteUrl()}/${slug}`;
}

export function isValidQrFormat(value: string | null): value is QrFormat {
  return value !== null && (QR_FORMATS as readonly string[]).includes(value);
}
```

`app/api/qr/route.ts`:

```ts
import QRCode from 'qrcode';
import { db } from '@/lib/data';
import { isValidQrFormat, qrTargetUrl } from './helpers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const format = searchParams.get('format') ?? 'png';
  const download = searchParams.get('download') === '1';

  if (!slug) return new Response('Slug wajib diisi.', { status: 400 });
  if (!isValidQrFormat(format)) return new Response('Format harus png atau svg.', { status: 400 });

  const project = await db.projects.getBySlug(slug);
  if (!project || project.status !== 'published') return new Response('Tidak ditemukan.', { status: 404 });

  const url = qrTargetUrl(slug);
  const disposition = download ? `attachment; filename="${slug}.${format}"` : 'inline';
  const options = { margin: 1, width: 512, color: { dark: '#233D2D', light: '#FFFFFF' } } as const;

  if (format === 'svg') {
    const svg = await QRCode.toString(url, { ...options, type: 'svg' });
    return new Response(svg, {
      headers: { 'content-type': 'image/svg+xml', 'content-disposition': disposition },
    });
  }

  const buffer = await QRCode.toBuffer(url, { ...options, type: 'png' });
  return new Response(new Uint8Array(buffer), {
    headers: { 'content-type': 'image/png', 'content-disposition': disposition },
  });
}
```

- [ ] **Step 4: Tulis panel publish**

`components/publish/PublishPanel.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button, Card, Chip } from '@/components/ds';
import { Dialog, toast } from '@/components/ui';
import { publishProjectAction } from '@/app/(dashboard)/projects/actions';
import type { Project, ProjectAiContent } from '@/lib/data/types';

type Platform = 'instagram' | 'facebook' | 'whatsapp';

export function PublishPanel({
  project, captions,
}: {
  project: Project;
  captions: ProjectAiContent['captions'] | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [platform, setPlatform] = useState<Platform>('instagram');
  const published = project.status === 'published';
  const url = `listingku.app/${project.slug}`;

  function publish() {
    startTransition(async () => {
      const result = await publishProjectAction(project.id);
      setConfirming(false);
      if (!result.ok) {
        toast.error('Lengkapi deskripsi project sebelum publish.');
        return;
      }
      await navigator.clipboard.writeText(`https://${url}`).catch(() => {});
      toast.success('Link tersalin');
      router.refresh();
    });
  }

  if (!published) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', paddingTop: 24 }}>
        <h1 className="lw-h2">Publikasikan {project.name}</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          Halaman akan live di {url} dan bisa dibagikan ke calon pembeli.
        </p>
        <div style={{ marginTop: 24 }}>
          <Button variant="primary" size="md" onClick={() => setConfirming(true)}>Publikasikan</Button>
        </div>

        <Dialog
          open={confirming}
          onOpenChange={setConfirming}
          title="Publikasikan landing ini?"
          description="Halaman akan live dan bisa dibagikan ke calon pembeli."
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>Batal</Button>
              <Button variant="primary" size="sm" onClick={publish} disabled={pending}>Ya, publikasikan</Button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', paddingTop: 24 }}>
      <div
        style={{
          width: 48, height: 48, borderRadius: '50%', background: 'var(--mint)',
          color: 'var(--status-success)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto',
        }}
      >
        <Check size={22} />
      </div>
      <h1 className="lw-h2" style={{ marginTop: 20 }}>Landing Anda sudah live</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
        Bagikan link atau QR ke calon pembeli. Perubahan konten langsung tampil tanpa publish ulang.
      </p>

      <Card padded={false} style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 12px 18px', textAlign: 'left' }}>
        <span className="lw-label" style={{ flex: 1, color: 'var(--evergreen)' }}>{url}</span>
        <Button
          variant="primary" size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(`https://${url}`);
            toast.success('Link tersalin');
          }}
        >
          Salin
        </Button>
      </Card>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, textAlign: 'left' }}>
        <Card>
          <p className="lw-label">QR code</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr?slug=${project.slug}&format=svg`}
            alt={`QR menuju ${url}`}
            style={{ marginTop: 12, width: '100%', border: '1px solid var(--ash)', borderRadius: 'var(--radius-sm)' }}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <a className="ds-btn ds-btn--secondary ds-btn--sm ds-btn--block" href={`/api/qr?slug=${project.slug}&format=png&download=1`}>PNG</a>
            <a className="ds-btn ds-btn--secondary ds-btn--sm ds-btn--block" href={`/api/qr?slug=${project.slug}&format=svg&download=1`}>SVG</a>
          </div>
        </Card>

        <Card>
          <p className="lw-label">Bagikan</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {(['instagram', 'facebook', 'whatsapp'] as Platform[]).map((p) => (
              <button key={p} type="button" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => setPlatform(p)}>
                <Chip tone={platform === p ? 'accent' : 'outline'}>
                  {p === 'instagram' ? 'Instagram' : p === 'facebook' ? 'Facebook' : 'WhatsApp'}
                </Chip>
              </button>
            ))}
          </div>
          <p style={{ marginTop: 12, border: '1px solid var(--ash)', borderRadius: 'var(--radius-sm)', padding: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)', minHeight: 104 }}>
            {captions ? captions[platform] : 'Caption tersedia setelah konten AI dibuat.'}
          </p>
          <div style={{ marginTop: 12 }}>
            <Button
              variant="secondary" size="sm" disabled={!captions}
              onClick={async () => {
                if (!captions) return;
                await navigator.clipboard.writeText(captions[platform]);
                toast.success('Caption tersalin');
              }}
            >
              Salin caption
            </Button>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <a className="ds-btn ds-btn--primary ds-btn--sm" href={`/${project.slug}`} target="_blank" rel="noopener noreferrer">Buka landing</a>
        <a className="ds-btn ds-btn--secondary ds-btn--sm" href={`/projects/${project.id}`}>Kembali ke project</a>
      </div>
    </div>
  );
}
```

`app/(dashboard)/projects/[id]/publish/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { PublishPanel } from '@/components/publish/PublishPanel';

export default async function PublishPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireSessionUserId();
  const { id } = await params;

  const project = await db.projects.get(id);
  if (!project || project.userId !== userId) notFound();

  return <PublishPanel project={project} captions={project.aiContent?.captions ?? null} />;
}
```

- [ ] **Step 5: Jalankan tes untuk memastikan lulus**

Run: `npm test -- qr-route && npm run test:e2e -- publish`
Expected: 2 tes unit PASS, 3 tes e2e PASS.

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/projects/[id]/publish" app/api/qr components/publish tests
git commit -m "feat(publish): add publish confirmation, QR download and social captions"
```

---

## Task 18: Spec Playwright tulang punggung

**Files:**
- Create: `tests/e2e/spine.spec.ts`
- Modify: `package.json` (tambah script `verify`)

**Interfaces:**
- Consumes: seluruh task sebelumnya
- Produces: `npm run verify` — unit test, build, dan e2e dalam satu perintah

- [ ] **Step 1: Tulis tes tulang punggung**

`tests/e2e/spine.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

/**
 * Satu tes yang menjaga seluruh slice: jalur North Star dari login sampai
 * landing publik yang benar-benar server-rendered. Kalau tes ini hijau,
 * produk inti bekerja.
 */
test('jalur North Star: dari login sampai landing publik live', async ({ page, request }) => {
  const nama = `Uji Spine ${Date.now()}`;

  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // Fase 3 — Create Project
  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill(nama);
  await page.getByLabel('Lokasi').fill('Gading Serpong, Tangerang');
  await page.getByLabel('Developer').fill('Paramount Land');
  await page.getByLabel('Deskripsi').fill('Cluster uji dengan dua tipe unit dan akses tol lima menit.');
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan project' }).click();

  await expect(page.getByRole('heading', { name: nama })).toBeVisible();
  const projectUrl = page.url();

  // Fase 4 — dua tipe rumah
  for (const [tipe, harga, lt, lb, kt] of [
    ['Villa', '2450000000', '90', '120', '3'],
    ['Midea', '3100000000', '112', '145', '4'],
  ]) {
    await page.getByRole('button', { name: 'Add house type' }).click();
    await page.getByLabel(/Nama tipe/).fill(tipe);
    await page.getByLabel(/Harga/).fill(harga);
    await page.getByLabel(/Luas tanah/).fill(lt);
    await page.getByLabel(/Luas bangunan/).fill(lb);
    await page.getByLabel(/Kamar tidur/).fill(kt);
    await page.getByLabel(/Kamar mandi/).fill('2');
    await page.getByLabel(/Carport/).fill('1');
    await page.getByRole('button', { name: 'Simpan tipe' }).click();
    await expect(page.getByText(tipe)).toBeVisible();
  }

  // Fase 5 — Generate AI
  await page.getByRole('link', { name: 'Generate AI' }).click();
  await page.getByRole('button', { name: 'Generate AI' }).click();
  await expect(page.getByRole('button', { name: 'Lanjut ke editor' })).toBeVisible({ timeout: 30_000 });

  // Fase 6 — Block Editor
  await page.getByRole('button', { name: 'Lanjut ke editor' }).click();
  await page.getByRole('button', { name: 'Blok Hero' }).click();
  await page.getByLabel('Judul').fill('Judul hero hasil uji');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByText('Tersimpan')).toBeVisible();

  // Fase 7 — Publish
  await page.goto(`${projectUrl}/publish`);
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();
  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();

  const slug = (await page.getByText(/^listingku\.app\//).textContent())?.replace('listingku.app/', '').trim();
  expect(slug).toBeTruthy();

  // Landing publik — dibuktikan dari HTML mentah, bukan setelah hidrasi
  const html = await (await request.get(`/${slug}`)).text();
  expect(html).toContain('Judul hero hasil uji');
  expect(html).toContain('Rp 2,45 M');
  expect(html).toContain('wa.me/6281288994410');
  expect(html).toContain('"@type":"RealEstateListing"');
  expect(html).toMatch(/<link[^>]+rel="canonical"/);
});

test('publish tetap berhasil tanpa konten AI sama sekali', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Kirim magic link' }).click();

  await page.getByRole('link', { name: /Create project/i }).click();
  await page.getByLabel(/Nama project/).fill(`Tanpa AI ${Date.now()}`);
  await page.getByLabel('Deskripsi').fill('Konten diisi manual tanpa bantuan AI sama sekali.');
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan project' }).click();

  await page.goto(`${page.url()}/publish`);
  await page.getByRole('button', { name: 'Publikasikan' }).click();
  await page.getByRole('button', { name: 'Ya, publikasikan' }).click();
  await expect(page.getByText('Landing Anda sudah live')).toBeVisible();
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan lulus**

Run: `npm run test:e2e -- spine`
Expected: 2 tes PASS. Bila gagal, jangan longgarkan asersinya — perbaiki kode yang salah.

- [ ] **Step 3: Tambahkan script verifikasi**

Di `package.json`, tambahkan:

```json
"verify": "npm run test && npm run build && npm run test:e2e"
```

- [ ] **Step 4: Jalankan verifikasi penuh**

Run: `npm run seed:reset && npm run verify`
Expected: seluruh tes unit PASS, build bersih, seluruh spec e2e PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/spine.spec.ts package.json
git commit -m "test: add end-to-end spine spec covering the North Star publish flow"
```

---

## Verifikasi akhir slice

Setelah Task 18, periksa keenam butir "Definisi selesai" di spec §14 secara manual:

1. Hapus `node_modules/.cache` dan `.data/`, jalankan `npm run dev` tanpa satu pun variabel lingkungan. Aplikasi harus jalan.
2. Selesaikan alur penuh dengan data yang diketik sendiri, restart dev server, pastikan datanya masih ada. Jalankan `npm run seed:reset`, pastikan kembali ke fixture.
3. Buka `view-source:` pada landing yang sudah dipublish. Konten, `<link rel="canonical">`, dan JSON-LD harus ada di HTML mentah. Buka `/sitemap.xml` dan `/robots.txt`.
4. Set `AI_MOCK_FAIL=1`, jalankan Generate AI, pastikan state error muncul dan publish tetap bisa dilakukan.
5. Bandingkan ketujuh layar dengan `Listingku App.dc.html` — warna, spasi, dan copy.
6. `npm run verify` hijau.

---

## Catatan untuk pelaksana

- **Jangan longgarkan tes agar hijau.** Kalau asersi gagal, yang salah kodenya.
- **Jangan menambah warna di luar token DS.** Ada tes yang gagal bila `#2563EB` muncul; warna lain di luar palette tidak tertangkap tes, jadi tanggung jawab reviewer.
- **Jangan merender konten AI lewat `dangerouslySetInnerHTML`.** Satu-satunya pemakaian yang sah ada di JSON-LD (Task 13), atas objek yang kita bentuk sendiri.
- **Copy mengikuti aturan DS.** Bila ragu, salin dari `Listingku App.dc.html`.
- Bila menemukan kebutuhan yang tidak tercakup plan ini, hentikan dan tanyakan — jangan mengarang di luar spec.
