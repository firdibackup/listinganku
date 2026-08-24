# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-08-23T10:34:46.398Z
> Files: 402 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~51 tok)
- `AGENTS.md` — OpenWolf (~68 tok)
- `CLAUDE.md` — Listingku product/architecture summary for Claude Code (no app code yet; distilled from PRD + flow doc) (~1977 tok)
- `Flow Onboarding & Alur Produk Listingku (MVP — Landing per Primary Property).md` — Flow Onboarding & Alur Produk Listingku (MVP — Landing per Primary Property) (~3435 tok)
- `GEMINI.md` — OpenWolf (~68 tok)
- `middleware.ts` — Exports middleware, config (~179 tok)
- `next-env.d.ts` — / <reference types="next" /> (~77 tok)
- `next.config.ts` — Next.js configuration (~181 tok)
- `package-lock.json` — npm lock file (~56856 tok)
- `package.json` — Node.js package manifest (~398 tok)
- `playwright.config.ts` — Playwright test configuration (~376 tok)
- `postcss.config.mjs` (~16 tok)
- `Product Requirements Document (PRD).md` — Product Requirements Document (PRD) (~10162 tok)
- `skills-lock.json` (~86 tok)
- `tsconfig.json` — TypeScript configuration (~161 tok)
- `tsconfig.tsbuildinfo` (~48686 tok)
- `vitest.config.ts` — Vitest test configuration (~142 tok)

## .agents/skills/web-design-guidelines/

- `SKILL.md` — Web Interface Guidelines (~308 tok)

## .claude/

- `settings.json` (~699 tok)
- `settings.json.graphify-bak` (~506 tok)
- `settings.local.json` — Declares p (~417 tok)

## .claude/commands/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .claude/rules/

- `openwolf.md` (~328 tok)

## .codex/

- `config.toml` (~7 tok)
- `hooks.json` (~1021 tok)

## .codex/prompts/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .impeccable/

- `config.json` (~201 tok)
- `config.local.json` (~14 tok)
- `hook.cache.json` (~4405 tok)

## .opencode/command/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .opencode/plugin/

- `openwolf.ts` — OpenWolf plugin entry — installed by `openwolf init --agent opencode`. (~74 tok)

## .opencode/plugin/openwolf/

- `anatomy.ts` — Exports parseAnatomy, serializeAnatomy, extractDescription, STORE_FILE + 12 more (~2922 tok)
  - fn `parseAnatomy` L5-28 (~207 tok)
  - fn `serializeAnatomy` L29-53 (~240 tok)
  - fn `extractDescription` L54-106 (~577 tok)
  - fn `sha256` L107-110 (~33 tok)
  - section `StoreFileEntry` L111-121 (~83 tok)
  - section `AnatomyStoreData` L122-127 (~63 tok)
  - fn `newStore` L128-132 (~64 tok)
  - fn `loadStore` L133-142 (~92 tok)
  - fn `saveStore` L143-157 (~162 tok)
  - fn `renderStore` L158-188 (~380 tok)
  - fn `renderToFile` L189-202 (~146 tok)
  - fn `importFromMarkdown` L203-227 (~305 tok)
  - fn `loadStoreReconciled` L228-240 (~137 tok)
  - fn `lockSleep` L241-244 (~31 tok)
  - fn `withAnatomyLock` L245-276 (~373 tok)
- `fs.ts` — Exports getWolfDir, wolfDirExists, readJSON, writeJSON + 6 more (~538 tok)
  - fn `getWolfDir` L5-8 (~28 tok)
  - fn `wolfDirExists` L9-12 (~31 tok)
  - fn `readJSON` L13-20 (~50 tok)
  - fn `writeJSON` L21-33 (~144 tok)
  - fn `readMarkdown` L34-41 (~41 tok)
  - fn `appendMarkdown` L42-47 (~64 tok)
  - fn `timeShort` L48-52 (~46 tok)
  - fn `timestamp` L53-56 (~22 tok)
  - fn `normalizePath` L57-60 (~24 tok)
  - fn `estimateTokens` L61-64 (~60 tok)
- `index.ts` — Exports OpenWolf (~1081 tok)
- `post-read.ts` — Exports handlePostRead (~629 tok)
  - fn `handlePostRead` L7-57 (~553 tok)
- `post-write.ts` — Exports handlePostWrite, summarizeEdit, autoDetectBugFix, detectFixPattern (~3226 tok)
  - fn `handlePostWrite` L8-39 (~302 tok)
  - fn `updateAnatomy` L40-86 (~473 tok)
  - fn `appendToMemory` L87-114 (~302 tok)
  - fn `trackSession` L115-150 (~338 tok)
  - fn `summarizeEdit` L151-184 (~471 tok)
  - fn `autoDetectBugFix` L185-228 (~523 tok)
  - fn `detectFixPattern` L229-265 (~610 tok)
  - fn `extractChangedLines` L266-270 (~88 tok)
- `pre-read.ts` — Exports handlePreRead (~685 tok)
  - fn `handlePreRead` L7-63 (~613 tok)
- `pre-write.ts` — Exports handlePreWrite (~1167 tok)
  - fn `tokenize` L14-21 (~63 tok)
  - fn `handlePreWrite` L22-35 (~132 tok)
  - fn `checkCerebrum` L36-65 (~369 tok)
  - section `BugEntry` L66-74 (~37 tok)
  - fn `checkBugLog` L75-105 (~399 tok)
- `session.ts` — Exports getSessionState, setSessionState, deleteSession, handleSessionStart (~952 tok)
  - fn `getSessionState` L8-11 (~33 tok)
  - fn `setSessionState` L12-15 (~33 tok)
  - fn `deleteSession` L16-19 (~26 tok)
  - fn `handleSessionStart` L20-89 (~783 tok)
- `stop.ts` — Exports handleStop (~1444 tok)
  - fn `handleStop` L6-35 (~262 tok)
  - fn `checkForMissingBugLogs` L36-50 (~165 tok)
  - fn `buildLedgerEntry` L51-114 (~743 tok)
  - fn `appendSessionSummary` L115-126 (~218 tok)
- `types.ts` — Exports FileRead, FileWrite, SessionState, PartialSessionState + 2 more (~217 tok)

## .superpowers/sdd/

- `.gitignore` — Git ignore rules (~1 tok)

## .superpowers/sdd/2026-08-16-listingku-frontend-slice1/

- `progress.md` — SDD ledger — plan: docs/superpowers/plans/2026-08-16-listingku-frontend-slice1.md (~13629 tok)
- `review-01d0ffe..0465457.diff` — + * Model blok landing page. (~2074 tok)
- `review-0d91b8f..d57bd6a.diff` — + * cache() menyatukan panggilan load() dari generateMetadata dan dari komponen (~3914 tok)
- `review-1002fd6..6c510a3.diff` — Pemisah ribuan titik, desimal koma — konvensi Indonesia. (~1824 tok)
- `review-168334a..8d0f781.diff` — Setiap metode baca (dan hasil create/update) HARUS lewat clone() sebelum (~8821 tok)
- `review-3f46db1..6753d1b.diff` — Rantai yang menopang tombol "Use AI suggestion": override, lalu AI, lalu fallback. (~4131 tok)
- `review-411f706..3f46db1.diff` — + * Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma (~12967 tok)
- `review-4655f1f..e9e5272.diff` — Review package: 4655f1f..e9e5272 (~3844 tok)
- `review-4bf09e3..80d9909.diff` — + * Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma (~11248 tok)
- `review-5282b43..6a1b1a9.diff` — + * Sesi dummy slice 1: tidak ada auth sungguhan. Tombol mana pun menandatangani (~6754 tok)
- `review-612eed4..4bf09e3.diff` — + * Direktori unggahan bisa dioverride lewat LISTINGKU_UPLOAD_DIR — dibaca ulang (~6852 tok)
- `review-725b119..fd37db3.diff` — + * Satu-satunya tempat yang menerjemahkan ResolvedBlock[] menjadi markup nyata. (~5866 tok)
- `review-80d9909..85e7ce4.diff` — + * Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma (~9048 tok)
- `review-a7c8878..168334a.diff` — + * Singleton disimpan di globalThis supaya HMR Next.js tidak me-reset store (~8707 tok)
- `review-cfd945e..4655f1f.diff` — Review package: cfd945ed18278cfa7ff593984ba4a21895b25a7b..HEAD (~57592 tok)
- `review-e0be27e..457d822.diff` — Review package: e0be27e..457d822 (~3571 tok)
- `task-1-brief.md` — Task 1: Scaffold, toolchain, dan design token (~3588 tok)
- `task-1-report.md` — Task 1 Report: Scaffold, toolchain, dan design token (~1549 tok)
- `task-10-brief.md` — Task 10: Detail Primary Property dan sheet tipe rumah (~4231 tok)
- `task-10-report.md` — Task 10 report — project detail page + house type sheet (~3600 tok)
- `task-11-brief.md` — Task 11: `resolve.ts` — rantai override → AI → kosong (~2815 tok)
- `task-11-report.md` — Task 11 Report: `lib/landing/resolve.ts` — rantai override → AI → kosong (~2300 tok)
- `task-12-brief.md` — Task 12: Tema wireframe dan `BlockRenderer` (~4585 tok)
- `task-12-report.md` — Task 12 report — Tema wireframe dan `BlockRenderer` (~2059 tok)
- `task-13-brief.md` — Task 13: Landing publik SSR, metadata, JSON-LD, sitemap (~2404 tok)
- `task-13-report.md` — Task 13 Report — Landing publik SSR, metadata, JSON-LD, sitemap (~3839 tok)
- `task-14-brief.md` — Task 14: Landing interaktif — WhatsApp, form lead, event (~2762 tok)
- `task-15-brief.md` — Task 15: AI mock dan layar Generate AI (~4909 tok)
- `task-16-brief.md` — Task 16: Block editor terpimpin (~5552 tok)
- `task-17-brief.md` — Task 17: Publish, QR, dan share (~2951 tok)
- `task-18-brief.md` — Task 18: Spec Playwright tulang punggung (~1673 tok)
- `task-2-brief.md` — Task 2: Komponen design system — Button, Card, Chip, Input (~3269 tok)
- `task-2-report.md` — Task 2 Report: Design System Components (~1315 tok)
- `task-3-brief.md` — Task 3: Primitif Radix dicat token DS (~2756 tok)
- `task-3-report.md` — Task 3 Report: Primitif Radix dicat token DS (~1564 tok)
- `task-4-brief.md` — Task 4: Utilitas murni — format, slug, ids (~1752 tok)
- `task-4-report.md` — Task 4 Report — Utilitas murni: format, slug, ids (~1382 tok)
- `task-5-brief.md` — Task 5: Model blocks (~2038 tok)
- `task-5-report.md` — Task 5 Report: Model blocks (~1089 tok)
- `task-6-brief.md` — Task 6: Lapisan data — tipe, kontrak repo, mock store, seed (~6082 tok)
- `task-6-report.md` — Task 6 report — lapisan data: tipe, kontrak repo, mock store, seed (~5084 tok)
- `task-7-brief.md` — Task 7: Sesi dummy, Login, dan Dashboard (~4440 tok)
- `task-7-report.md` — Task 7 report — sesi dummy, login, dashboard (~2307 tok)
- `task-8-brief.md` — Task 8: Pipeline media — downscale, unggah, hapus (~2849 tok)
- `task-8-report.md` — Task 8 Report — Pipeline media: downscale, unggah, hapus (~4808 tok)
- `task-9-brief.md` — Task 9: Skema Zod dan wizard Create Project (~4094 tok)
- `task-9-report.md` — Task 9 Report: Skema Zod dan wizard Create Project (~2880 tok)

## .superpowers/sdd/2026-08-23-listingku-brief-pipeline-slice3a/

- `progress.md` — SDD ledger — plan: docs/superpowers/plans/2026-08-23-listingku-brief-pipeline-slice3a.md (~3222 tok)
- `review-4959a53..5cc810d.diff` — Rantai yang menopang tombol "Use AI suggestion": override, lalu AI, lalu fallback. (~5002 tok)
- `review-5cc810d..7900309.diff` — Menyalin blok bawaan tema lalu menambal props blok tertentu dengan konten seed. (~4144 tok)
- `review-a138325..4959a53.diff` — Setiap metode baca (dan hasil create/update) HARUS lewat clone() sebelum (~2176 tok)
- `review-b40f485..a138325.diff` — Kalimat pemasaran di bawah judul hero. Opsional: aiContent lama tidak punya. (~3236 tok)
- `task-1-brief.md` — Nama kawasan, diketik bebas: "Gading Serpong". Bukan unit administratif. (~2529 tok)
- `task-1-report.md` — Task 1 Report: Tipe brief + skema Zod (~2027 tok)
- `task-2-brief.md` — ## Task 2: Repo, default store, dan repairShape (~1272 tok)
- `task-2-report.md` — Task 2 report — Repo, default store, dan repairShape (~2309 tok)
- `task-3-brief.md` — aiContent lengkap dengan nilai KONTRAS supaya kebocoran AI ke fakta terdeteksi. (~2971 tok)
- `task-3-report.md` — Task 3 report — pickFirst() + rantai brief di resolve() (~1625 tok)
- `task-4-brief.md` — Fakta Parkspring — dipindahkan dari blocks[].props ke brief (spec §12.2). (~2347 tok)
- `task-4-report.md` — Task 4 report — seed Parkspring pindah ke brief (render wajib identik) (~2837 tok)
- `task-5-brief.md` — Hanya pesan WhatsApp yang menjadi data di 3A. Label CTA tetap milik tema — (~1801 tok)
- `task-6-brief.md` — Section yang MENYALA per tipe project. Yang tidak disebut di sini dimatikan. (~2028 tok)
- `task-7-brief.md` — Dataset administratif berhenti di KECAMATAN. Nama kawasan komersial (~2294 tok)
- `task-8-brief.md` — Dataset statis, jadi tidak ada sesi maupun store yang disentuh — route ini (~658 tok)
- `task-9-brief.md` — Combobox ARIA yang ditulis sendiri, BUKAN Radix Popover — dua alasan: (~2592 tok)

## app/

- `layout.tsx` — archivo (~188 tok)
- `page.tsx` — Home (~30 tok)
- `robots.ts` — Tanpa data dinamis (hanya aturan tetap + siteUrl(), yang sudah konstan saat (~134 tok)
- `sitemap.ts` — Tanpa ini, Next.js membekukan sitemap.xml sebagai halaman statis saat build (~276 tok)

## app/(dashboard)/

- `layout.tsx` — DashboardLayout (~168 tok)

## app/(dashboard)/dashboard/

- `page.tsx` — metadata (~863 tok)
  - fn `DashboardPage` L13-86 (~719 tok)

## app/(dashboard)/leads/

- `page.tsx` — metadata (~1051 tok)
  - fn `deltaLabel` L12-15 (~27 tok)
  - fn `LeadsPage` L16-88 (~874 tok)

## app/(dashboard)/projects/

- `actions.ts` — Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma (~1550 tok)
  - fn `requireOwnedProject` L24-28 (~65 tok)
  - fn `createProjectAction` L30-56 (~360 tok)
  - fn `updateProjectAction` L57-87 (~310 tok)
  - fn `publishProjectAction` L88-108 (~238 tok)
  - fn `deleteProjectAction` L109-127 (~268 tok)

## app/(dashboard)/projects/[id]/

- `houseTypeActions.ts` — Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma (~1836 tok)
  - fn `requireOwnedProject` L21-35 (~223 tok)
  - fn `requireOwnedHouseType` L36-50 (~230 tok)
  - fn `stripHouseTypeFromBlocks` L51-63 (~101 tok)
  - fn `createHouseTypeAction` L64-92 (~396 tok)
  - fn `updateHouseTypeAction` L93-117 (~266 tok)
  - fn `deleteHouseTypeAction` L118-144 (~348 tok)
- `page.tsx` — ProjectPage (~302 tok)

## app/(dashboard)/projects/[id]/editor/

- `actions.ts` — Ganti tema SEKALIGUS menyetel palet ke bawaan tema itu. (~564 tok)
  - fn `saveBlocksAction` L10-29 (~262 tok)
  - fn `setThemeAction` L30-41 (~117 tok)
  - fn `setPaletteAction` L42-48 (~78 tok)
- `page.tsx` — EditorPage (~223 tok)

## app/(dashboard)/projects/[id]/generate/

- `actions.ts` — Exports generateContentAction (~711 tok)
  - fn `generateContentAction` L9-67 (~620 tok)
- `page.tsx` — GeneratePage (~361 tok)

## app/(dashboard)/projects/[id]/publish/

- `page.tsx` — PublishPage (~166 tok)

## app/(dashboard)/projects/new/

- `page.tsx` — metadata (~64 tok)

## app/(dashboard)/settings/

- `actions.ts` — Tidak ada gate kepemilikan bergaya requireOwnedProject di sini: setiap action (~952 tok)
  - fn `revalidate` L20-26 (~65 tok)
  - fn `updateAppearanceAction` L27-40 (~128 tok)
  - fn `updateProfileAction` L41-67 (~294 tok)
  - fn `updateGeneralAction` L68-81 (~135 tok)
  - fn `setProfilePublishedAction` L82-92 (~91 tok)
- `page.tsx` — metadata (~775 tok)
  - fn `SettingsPage` L13-74 (~604 tok)

## app/(public)/[slug]/

- `actions.ts` — houseTypeId dianggap valid HANYA kalau baris itu benar-benar ada DAN milik (~2478 tok)
  - fn `resolvedHouseTypeId` L26-60 (~568 tok)
  - fn `submitLeadAction` L61-134 (~1089 tok)
  - fn `recordEventAction` L135-169 (~501 tok)
- `page.tsx` — cache() menyatukan panggilan load() dari generateMetadata dan dari komponen (~483 tok)

## app/api/qr/

- `helpers.ts` — Exports QR_FORMATS, QrFormat, qrTargetUrl, isValidQrFormat (~116 tok)
- `route.ts` — Next.js API route: GET (~401 tok)

## app/login/

- `actions.ts` — Sesi dummy slice 1: tidak ada auth sungguhan. Tombol mana pun menandatangani (~125 tok)
- `page.tsx` — metadata — renders form (~484 tok)

## app/preview/

- `page.tsx` — Papan banding. Tiap bingkai memuat `/preview/{tema}` yang sungguhan, bukan (~509 tok)
  - fn `ThemeGalleryPage` L15-50 (~368 tok)
- `preview.css` — Styles: 16 rules, 1 media queries (~600 tok)

## app/preview/[theme]/

- `page.tsx` — Pratinjau satu tema di atas project demo. Project yang dipakai SELALU sama (~389 tok)

## components/ai/

- `GeneratePanel.tsx` — STAGES — uses useRouter, useState (~1586 tok)
  - fn `GeneratePanel` L15-140 (~1384 tok)

## components/dashboard/

- `dashboard.css` — Styles: 23 rules, 1 media queries (~856 tok)
- `EmptyState.tsx` — EmptyState (~193 tok)
- `MetricCard.tsx` — `delta` opsional supaya pemakaian lama di /dashboard (tiga kartu tanpa (~161 tok)
- `navItems.ts` — Peta aktif disalin dari `activeNav` di file design (Listingku App.dc.html): (~324 tok)
- `ProjectCard.tsx` — ProjectCard (~396 tok)
- `Sidebar.tsx` — Client Component semata-mata supaya `usePathname()` bisa menurunkan item nav (~478 tok)

## components/ds/

- `Button.tsx` — Button (~275 tok)
- `Card.tsx` — Card (~154 tok)
- `Chip.tsx` — Chip (~179 tok)
- `ds.css` — Styles: 39 rules, 4 vars (~1266 tok)
- `index.ts` (~102 tok)
- `Input.tsx` — Input (~544 tok)
  - section `InputProps` L6-14 (~59 tok)
  - fn `Input` L15-73 (~448 tok)

## components/editor/

- `BlockSettingsPanel.tsx` — BlockSettingsPanel (~4569 tok)
  - fn `BlockSettingsPanel` L9-292 (~4409 tok)
- `editor.css` — Styles: 28 rules, 1 media queries (~852 tok)
- `EditorShell.tsx` — EditorShell — uses useState, useMemo (~2673 tok)
  - fn `EditorShell` L20-223 (~2308 tok)
- `PalettePicker.tsx` — Baris 10 swatch palet. Warna swatch diambil dari PALETTES[name].accent lewat (~318 tok)

## components/landing/

- `ContactForm.tsx` — Form kontak publik. Tidak melakukan validasi Zod di klien: submitLeadAction (~1042 tok)
  - fn `ContactForm` L16-109 (~815 tok)
- `PageViewTracker.tsx` — Komponen klien tak-merender; catat 1 event visitor per project per sesi tab via sessionStorage. (~377 tok)
- `StickyCtaBar.tsx` — Dua aksi utama landing yang ikut ke mana pun pengunjung menggulir. Sejak (~326 tok)
- `WhatsAppLink.tsx` — Klien; toWaHref() membangun URL wa.me (reuse normalizeIndonesianPhone), catat whatsapp_click saat klik. (~421 tok)

## components/leads/

- `LeadFilters.tsx` — Filter berbasis URL, bukan state klien: halaman tetap Server Component, hasil (~642 tok)
  - section `LeadFilterState` L5-9 (~27 tok)
  - fn `hrefWith` L10-26 (~214 tok)
  - fn `LeadFilters` L27-60 (~357 tok)
- `leads.css` — Styles: 34 rules, 1 media queries (~1091 tok)
- `LeadsTable.tsx` — Nama tipe rumah sudah diselesaikan di server; null bila lead tidak menyebut tipe. (~606 tok)
  - section `LeadRow` L7-16 (~108 tok)
  - fn `LeadsTable` L17-54 (~425 tok)
- `leadStatus.ts` — Label dan tone disalin dari `statusTone` di file design. Nilai tone-nya (~292 tok)

## components/media/

- `media.css` — Styles: 14 rules, 1 media queries (~483 tok)
- `MediaUploader.tsx` — MediaUploader (~1233 tok)
  - section `MediaUploaderProps` L9-17 (~52 tok)
  - fn `MediaUploader` L18-128 (~1082 tok)

## components/project/

- `HouseTypeCard.tsx` — HouseTypeCard (~565 tok)
  - section `HouseTypeCardProps` L5-10 (~30 tok)
  - fn `HouseTypeCard` L11-46 (~489 tok)
- `HouseTypeSheet.tsx` — EMPTY — uses useRouter, useState (~1622 tok)
  - section `HouseTypeSheetProps` L13-20 (~49 tok)
  - fn `HouseTypeSheet` L21-133 (~1408 tok)
- `project.css` — Styles: 15 rules, 2 media queries (~441 tok)
- `ProjectHeader.tsx` — ProjectDetail — uses useState (~1134 tok)
  - fn `ProjectDetail` L11-105 (~1032 tok)

## components/publish/

- `PublishPanel.tsx` — PublishPanel — renders modal — uses useRouter, useState (~1794 tok)
  - fn `PublishPanel` L13-147 (~1624 tok)

## components/settings/

- `AppearanceForm.tsx` — Titik warna sampel di chip aksen — hanya untuk pratinjau, bukan sumber kebenaran. (~1318 tok)
  - fn `AppearanceForm` L17-110 (~1133 tok)
- `GeneralForm.tsx` — GeneralForm — renders modal — uses useRouter, useState (~1205 tok)
  - fn `GeneralForm` L10-111 (~1077 tok)
- `ProfileForm.tsx` — ProfileForm — renders form — uses useState (~670 tok)
  - fn `ProfileForm` L9-68 (~601 tok)
- `ProfilePreview.tsx` — Pratinjau situs profil agen. Situsnya sendiri ({subdomain}.listingku.app) (~370 tok)
- `SaveBar.tsx` — Baris simpan bersama untuk ketiga form Settings: status pending, pesan galat (~228 tok)
- `settings.css` — Styles: 56 rules, 2 media queries (~1812 tok)
- `SettingsTabs.tsx` — Tab sebagai navigasi URL, bukan panel klien: tiap tab adalah form berbeda, (~298 tok)

## components/ui/

- `accordion.tsx` — Accordion (~297 tok)
- `dialog.tsx` — Dialog (~293 tok)
- `index.ts` (~113 tok)
- `progress.tsx` — Progress (~108 tok)
- `sheet.tsx` — Sheet (~321 tok)
- `skeleton.tsx` — Skeleton (~43 tok)
- `toaster.tsx` — Toaster (~154 tok)
- `ui.css` — Styles: 23 rules, 3 animations (~784 tok)

## components/wizard/

- `CreateProjectWizard.tsx` — Terisi begitu langkah 1 disimpan; langkah berikutnya meng-update baris yang sama. Step 2 render `<SectionPlanner>` dengan `panelFor` (Task 12) tersambung ke lima panel materi (`./panels/*`) — hero/highlights/facilities/location/pricePromo; tipe lain jatuh ke fallback catatan bebas SectionPlanner. `applyType(next)` satu-satunya jalur yang menulis `projectType` DAN menerapkan `applySectionPreset` ke state `blocks` — dipanggil dari `chooseType` (pilihan pertama) dan tombol konfirmasi "Sesuaikan section" (ganti tipe), supaya keduanya tidak divergen. (~2150 tok)
  - fn `CreateProjectWizard` L21-268 (~1980 tok)
- `SectionPlanner.tsx` — Task 11: Content Planner step 2 — satu baris per BlockType (checkbox enabled + tombol buka/tutup panel materi), progressive disclosure (satu panel terbuka sekaligus), fallback catatan bebas (`brief.notes[type]`) saat `panelFor` tidak menyediakan panel khusus, ringkasan materi yang sudah dimiliki agen. BUKAN page builder — sengaja tanpa reorder/copy-per-blok. Panel materi sungguhan disambung di Task 12 lewat prop `panelFor`. (~950 tok)
- `StepProgress.tsx` — StepProgress (~107 tok)
- `wizard.css` — Styles: 13 rules, 1 media queries + blok `.wz-plan*` Task 11 (Content Planner) + blok `.wz-panel*` Task 12 (lima panel materi) (~540 tok)

## components/wizard/panels/

Lima panel materi step 2 (Task 12) — mengumpulkan fakta mentah (bahan AI), BUKAN copy final. `PanelProps = { brief, onChange }` diekspor SEKALI dari `HeroPanel.tsx`, diimpor keempat panel lain.

- `HeroPanel.tsx` — Mengumpulkan INTENT (radio `heroEmphasis`, checkbox multi `ctaGoals`), sengaja TANPA field judul/subjudul/CTA copy — itu pekerjaan AI. Ekspor `PanelProps`. (~350 tok)
- `HighlightsPanel.tsx` — Daftar baris teks bebas `brief.highlights` (tambah/hapus). Keunggulan kawasan ("bebas banjir"), beda dari fasilitas. (~230 tok)
- `FacilitiesPanel.tsx` — Chip preset dari `FACILITY_OPTIONS` (toggle tambah/lepas by name) + baris custom nama/keterangan di luar preset. (~260 tok)
- `LocationPanel.tsx` — Alamat lengkap opsional + daftar `nearby` (kategori/nama/menit). Menit kosong → `e.target.value === '' ? null : Number(...)`, TIDAK PERNAH 0 — halaman publik merender `${minutes} mnt`. Pesan peringatan saat ada item ber-`minutes: null` ("tidak tampil sebagai kartu akses"). (~320 tok)
- `PromoPanel.tsx` — Checkbox "Ada promo" toggle `brief.promo` null/objek. Field "Butir promo" TETAP controlled (`value={promo.items.join('\n')}`, konsisten dengan 5 field lain di panel ini) lewat `parsePromoLines()` (diekspor) — baris TERAKHIR (sedang diketik) dikecualikan dari trim/filter per-keystroke supaya spasi/baris-baru yang baru diketik tidak tersapu balik sebelum keystroke berikutnya tiba (`restoreControlledState`); `onBlur` merapikan baris kosong sisa. Fix round 1 Task 12, `bug-042` — koreksi dari fix pertama yang salah bikin field ini uncontrolled. (~380 tok)

## data/

- `id-regions.json` — Dataset STARTER wilayah offline (39 kecamatan) untuk searchRegions. Sumber/lisensi dataset penuh (~7.300 kecamatan) belum diputuskan — blocker eksternal terbuka; bentuk baris `{district,city,province}` stabil sehingga dataset penuh nanti hanya mengganti isi file (~640 tok)

## design/

- `README.md` — Project documentation (~427 tok)

## design/project/

- `.thumbnail` (~3409 tok)
- `00 Index.dc.html` — Declares Component (~1118 tok)
- `01 Premium Gelap.dc.html` (~6841 tok)
- `02 Editorial Putih.dc.html` (~6025 tok)
- `03 Korporat Biru.dc.html` (~6707 tok)
- `04 Soft Luxury Beige.dc.html` (~6409 tok)
- `05 Bold Retail.dc.html` (~5859 tok)
- `06 Arsitektural Beton.dc.html` (~6059 tok)
- `07 Nature Calm.dc.html` (~6429 tok)
- `08 Klasik Navy.dc.html` (~6182 tok)
- `09 Playful Pastel.dc.html` (~6273 tok)
- `10 Tropis Hangat.dc.html` (~6282 tok)
- `support.js` — getReact: getReactDOM, parseDcDocument, parseDcText + 10 more (~20299 tok)

## docs/superpowers/plans/

- `2026-08-16-listingku-frontend-slice1.md` — Listingku Front-End Slice 1 — Implementation Plan (~66573 tok)
- `2026-08-19-listingku-landing-tema-tropis.md` — Listingku Landing Slice 2A — Implementation Plan (~13147 tok)
- `2026-08-23-listingku-brief-pipeline-slice3a.md` — Slice 3A — Pipeline Brief Implementation Plan (~32614 tok)

## docs/superpowers/specs/

- `2026-08-16-listingku-frontend-slice1-design.md` — Spec design Slice 1 front-end yang sudah disetujui. Sumber kebenaran untuk implementasi: batas slice, aturan design system + konten, repository seam, model blocks/theme, landing wireframe, AI mock, pengujian, definisi selesai, 9 keputusan tercatat. **Baca ini sebelum menulis kode aplikasi.** (~7093 tok)
- `2026-08-19-listingku-landing-tema-tropis-design.md` — Design — Listingku Landing Slice 2: sistem tema + Tropis Hangat (~7823 tok)
- `2026-08-23-listingku-brief-pipeline-slice3a-design.md` — Design — Listingku Slice 3A: pipeline brief (Content Planner → AI → landing) (~8021 tok)

## fixtures/

- `seed.ts` — Menyalin blok bawaan tema lalu menambal props blok tertentu dengan konten seed. (~3533 tok)
  - fn `withContent` L11-165 (~1988 tok)
  - fn `seedStore` L166-249 (~1331 tok)

## graphify-out/

- `.graphify_detect.json` (~145 tok)
- `.graphify_labels.json` (~821 tok)
- `.graphify_labels.json.sig` (~636 tok)
- `.graphify_python` (~21 tok)
- `.graphify_root` (~1 tok)
- `GRAPH_REPORT.md` — Graph Report - listinganku  (2026-08-23) (~4930 tok)
- `manifest.json` (~14358 tok)

## graphify-out/2026-08-23/

- `.graphify_labels.json` (~816 tok)
- `GRAPH_REPORT.md` — Graph Report - listinganku  (2026-08-23) (~4885 tok)
- `manifest.json` (~14245 tok)

## graphify-out/cache/

- `last_query_stamp` (~5 tok)
- `stat-index.json` (~11734 tok)

## graphify-out/cache/ast/v0.9.44/

- `003f52c07e4e5b0b0b55a566c0964d93d8650ecae684c5175694c01a470153d2.json` (~788 tok)
- `02a6deb6b6f79f3cd8bc845cdd21c4f266036f0904041199560f750707a3a1b4.json` — /*.ts", "file_type": "concept", "source_file": "tsconfig.json", "source_location": "L19"}, {"id": "$graphify-root$_tsconfig_exclude", "label": "exc... (~2903 tok)
- `0434b6213e1900295bffcecfc5ce6ac3d32c398013657b847a06fd780f9e0c23.json` (~67 tok)
- `132fd8ea13f7c3364baa3e2344705dd1ca7fa33d6475c51865e2880315d5a4e1.json` (~172 tok)
- `1d27c48e7537f337a6c8f15361c2f461cf99f5d46e099a783bd6591f7d9a9676.json` (~5237 tok)
- `2368428a7b17df81a0e12b360a5192b62cf44648c730af11f3b0a830da03770f.json` (~5042 tok)
- `28dff31d3856d99b9e0807daa63e0d81ba79e7bc27ccb0d8ef8e587eff80e725.json` (~2790 tok)
- `2e51d9e0b8b141bc028b0e5fecc5387c3541274a1ec94d0a5c12880cd776bc0e.json` (~577 tok)
- `44aebbf32b49c85f8db1990ee081e67b6b6747b51ad2da9cae543559b71a9c0b.json` (~3452 tok)
- `44eda2ec07dd1a0e4b7f828cbe7eabbaaccf4715f778e6172b7e55fa067b0e99.json` (~6313 tok)
- `4aba9aeb1abca43278b238354d24de7fa1f1d90a0ae95b6b8cbbd8a1c85b316d.json` (~214 tok)
- `53cc24bb36f6bdbbae1ee128f9aebba8239e306aeb8cd0f92381e3c737802a38.json` (~811 tok)
- `5ddc95fe5d8ed1e37932a74dd9ae93d05507f708e8d554602ef95ffcfd6e8e4b.json` (~4198 tok)
- `6bfba8f338e03b49ceeaf3351ff1f0c47141c79f82284077953c6dfa290cc925.json` (~7321 tok)
- `79254ad5647d674ed8ea7513f76dd67c80d96d1ecb3abdf0686a1c39887a9fda.json` (~168 tok)
- `815611b95a9b5a4ba04af6e8f1ce4589363edd7974ccf462828cc289afd05dd7.json` (~156 tok)
- `84b75419639b657060d7969507150c1fb365694e33a6fbbf104731ade6608a80.json` (~2646 tok)
- `93b008dc621fd591d269e2d35a57f306484285722c00f84b57b428aa319e71ac.json` (~928 tok)
- `af8c917961112b02850cf77695f5843e8082ed29f573b51073015e845c71b1cb.json` (~469 tok)
- `afe1e91a6d1236a45110ee3e3ece2b52e5daade38e606dc5838c5d15d86848ca.json` (~3722 tok)
- `b052467ae66d74c4556361059c5ddb90a5ae1e5cd641f955dc44c514c04fbd9a.json` (~9559 tok)
- `b1ecfb5fb6dd6856e31677af9b0b9de798b68d1091c1a80c1509a72a8770cc98.json` (~638 tok)
- `bf0268e67c35865c8ba1268e04489a37a438b655b7937dd16aec83f0a0c82043.json` (~8259 tok)
- `c5fd8f570bc9d8c9c190fa2d4820193f1b77fe3fb7c6d5b2aaa0152c3d18a2b4.json` (~2704 tok)
- `c67d84ef56052e4f8cebb46d14077e1fdaebacd1e636c2c8a8d0f101f2fa32b8.json` (~1486 tok)
- `c8116e4153824c6b3b9c80cc1b95aef0d0f0e099774c91e82f543282b48b8999.json` (~156 tok)
- `c8d9093a194cdda6d1d6f5eabb4ae93644367a2eafd25e6ac9834621f57e2c55.json` (~474 tok)
- `d200fbab766f9a690204dd2b7509fa72e941380761cf13237fe414e771a74cc2.json` (~460 tok)
- `d7ec25b9205404502440302cdebbc7d79dd3f03de9f0c9ea0d0e325326d85f0d.json` (~638 tok)
- `f07181cc84704d658af4484d18a22c7d740be3f8a262f708ca294128bb32db65.json` (~3312 tok)
- `f66102626c67f1c9d0edfdac45e7ad3c34ab490341988db223cafe7edfb510c0.json` (~719 tok)
- `f7b67c6dfca50ce12b9bf6cd3be1ee2b2e759c8464a2d7303ceca957ff3561c5.json` (~803 tok)
- `f861dd5a1290a67e61ff61357d6c9c4cf9a168539742fdc8d22e40461b2873b8.json` (~9428 tok)

## lib/

- `format.ts` — Guard untuk nilai kosong atau tidak valid. Formatter adalah pertahanan terakhir (~1032 tok)
  - fn `isAbsent` L14-21 (~97 tok)
  - fn `formatNumber` L22-26 (~49 tok)
  - fn `formatRupiah` L27-32 (~69 tok)
  - fn `formatRupiahShort` L33-43 (~126 tok)
  - fn `formatArea` L44-48 (~40 tok)
  - fn `formatDateLong` L49-55 (~84 tok)
  - fn `formatDateShort` L56-66 (~128 tok)
  - fn `formatPercent` L67-80 (~178 tok)
  - fn `formatDateTimeShort` L81-89 (~115 tok)
- `ids.ts` — Id berprefiks supaya mudah dibaca saat men-debug isi .data/store.json. (~59 tok)
- `phone.ts` — Menormalkan nomor Indonesia yang sudah lolos phoneSchema (lib/schemas/lead.ts) (~394 tok)
- `session.ts` — Sesi dummy slice 1: TIDAK ADA autentikasi sungguhan di sini. Ini hanyalah (~296 tok)
- `slug.ts` — Landing publik hidup di `/{project-slug}`, satu ruang nama dengan rute aplikasi. (~354 tok)

## lib/ai/

- `generator.ts` — Bahan mentah dari agen. Generator WAJIB memakai hanya fakta di sini dan di (~260 tok)
- `index.ts` — Saat Gemini asli masuk, cabang kedua ditambahkan di sini. Tidak ada tempat lain. (~136 tok)
- `mock.ts` — Nearby menjadi kalimat. Yang punya menit menyebut angkanya; yang tidak punya (~1665 tok)
  - fn `wait` L6-12 (~83 tok)
  - fn `nearbyPhrase` L13-27 (~153 tok)
  - fn `paragraphs` L28-100 (~1337 tok)
- `schema.ts` — Cermin persis `responseSchema` yang akan dikirim ke Gemini 2.5 Flash. (~329 tok)

## lib/data/

- `index.ts` — Singleton disimpan di globalThis supaya HMR Next.js tidak me-reset store (~294 tok)
- `repo.ts` — Satu-satunya kontrak yang dilihat UI. Slice 1 mengisinya dengan mock store; (~792 tok)
  - section `DataStore` L19-68 (~515 tok)
- `types.ts` — Kalimat pemasaran di bawah judul hero. Opsional: aiContent lama tidak punya. (~1775 tok)
  - section `SeoContent` L15-19 (~22 tok)
  - section `ProjectAiContent` L20-32 (~138 tok)
  - section `HouseTypeAiContent` L33-46 (~130 tok)
  - section `LocationDetail` L47-56 (~85 tok)
  - section `NearbyItem` L57-68 (~108 tok)
  - section `BriefFacility` L69-75 (~39 tok)
  - section `BriefPromo` L76-86 (~80 tok)
  - section `ProjectBrief` L87-103 (~156 tok)
  - fn `emptyBrief` L104-110 (~58 tok)
  - section `AgentProfile` L111-135 (~206 tok)
  - section `Project` L136-157 (~128 tok)
  - section `HouseType` L158-175 (~97 tok)
  - section `Media` L176-188 (~60 tok)
  - section `Lead` L189-201 (~63 tok)
  - section `EventRow` L202-210 (~39 tok)
  - section `AiUsage` L211-223 (~65 tok)
  - section `StoreShape` L224-233 (~56 tok)

## lib/data/mock/

- `repos.ts` — Setiap metode baca (dan hasil create/update) HARUS lewat clone() sebelum (~2879 tok)
  - fn `now` L10-22 (~190 tok)
  - fn `createMockStore` L23-253 (~2487 tok)
- `snapshot.ts` — Direktori data bisa dioverride lewat LISTINGKU_DATA_DIR — dibaca ulang setiap (~2045 tok)
  - fn `dataDir` L18-21 (~32 tok)
  - fn `storeFile` L22-27 (~55 tok)
  - fn `isPlainObject` L28-32 (~77 tok)
  - fn `isRowLike` L33-47 (~229 tok)
  - fn `repairShape` L48-84 (~503 tok)
  - fn `loadSnapshot` L85-102 (~205 tok)
  - fn `renameWithRetry` L103-126 (~278 tok)
  - fn `saveSnapshot` L127-147 (~256 tok)
  - fn `sweepStaleTmp` L148-162 (~143 tok)
- `store.ts` — Tulis sinkron, tanpa debounce. Ini mock single-user untuk dev lokal atas (~251 tok)

## lib/data/supabase/

- `README.md` — Project documentation (~142 tok)

## lib/landing/

- `BlockRenderer.tsx` — Satu-satunya tempat yang menerjemahkan ResolvedBlock[] menjadi markup nyata. (~302 tok)
- `blocks.ts` — Model blok landing page. (~3013 tok)
  - section `BlockBase` L21-197 (~2072 tok)
  - fn `defaultBlocksForTheme` L198-213 (~219 tok)
  - fn `applyThemeOrder` L214-221 (~97 tok)
  - fn `moveBlock` L222-231 (~108 tok)
  - fn `toggleBlock` L232-239 (~87 tok)
  - fn `updateBlockProps` L240-251 (~118 tok)
- `fonts.ts` — next/font tidak bisa dipanggil kondisional — semua pasangan font tema (~1717 tok)
- `landing.css` — Styles: 16 rules, 1 vars, 1 media queries (~1272 tok)
- `LandingView.tsx` — Satu-satunya tempat halaman landing dirakit. Dipakai halaman publik `/{slug}` (~1197 tok)
  - section `LandingData` L12-30 (~202 tok)
  - fn `LandingView` L31-102 (~835 tok)
- `palettes.ts` — KONTRAK PERAN TOKEN — dibaca sebelum menyentuh nilai apa pun di bawah. (~3079 tok)
  - fn `paletteStyle` L196-200 (~60 tok)
- `resolve.ts` — Task 3: `pickFirst()` (rantai N lapis, satu `isAbsent`) + `pick()` sebagai pembungkus 3-arg. `resolveBlocks` menyisipkan `project.brief`: access/facilities/pricePromo brief-only (nol `ai.*`, penjaga anti-halusinasi), highlights/hero.subtitle/agentCta.defaultMessage AI-di-atas-brief. (~3919 tok)
  - section `ResolvedHouseType` L6-38 (~548 tok)
  - section `ResolveInput` L39-57 (~172 tok)
  - fn `pickFirst` L58-66 (~118 tok)
  - fn `resolveHouseTypes` L67-93 (~335 tok)
  - fn `resolveBlocks` L94-308 (~2599 tok)
- `sectionPreset.ts` — Task 6: `SECTION_PRESET` (tabel deterministik, bukan panggilan AI) — section yang MENYALA per ProjectType. `testimonials` tidak pernah masuk preset mana pun (resolve.ts sengaja tanpa fallback AI untuk itu). `applySectionPreset()` hanya menyentuh flag `enabled`, tidak pernah urutan atau props. (~600 tok)
  - fn `applySectionPreset` L44-48 (~90 tok)
- `seo.ts` — Serialisasi aman untuk dipasang lewat dangerouslySetInnerHTML di dalam (~935 tok)
  - fn `siteUrl` L4-7 (~31 tok)
  - fn `buildMetadata` L8-40 (~293 tok)
  - fn `buildJsonLd` L41-95 (~545 tok)
  - fn `jsonLdScript` L96-99 (~38 tok)
- `themeNames.ts` — Peta datar, BUKAN diambil dari THEMES. Lapisan data (mock/store.ts) (~578 tok)
  - fn `normalizeTheme` L42-47 (~64 tok)

## lib/landing/themes/

- `index.ts` — Header dan Footer setiap tema menerima seluruh konteks project, bukan satu blok. (~1135 tok)
- `slots.ts` — Slot media bersama untuk kesepuluh tema. (~412 tok)

## lib/landing/themes/architectural/

- `blocks.tsx` — 06 Arsitektural Beton — ditranskrip dari (~4655 tok)
  - fn `Header` L22-30 (~74 tok)
  - fn `Hero` L31-70 (~421 tok)
  - fn `Highlights` L71-90 (~212 tok)
  - fn `HouseTypes` L91-134 (~504 tok)
  - fn `Specs` L135-169 (~380 tok)
  - fn `FloorPlans` L170-196 (~294 tok)
  - fn `Location` L197-225 (~298 tok)
  - fn `Facilities` L226-246 (~226 tok)
  - fn `Gallery` L247-266 (~195 tok)
  - fn `PricePromo` L267-295 (~355 tok)
  - fn `Developer` L296-316 (~213 tok)
  - fn `Testimonials` L317-333 (~175 tok)
  - fn `Faq` L334-360 (~274 tok)
  - fn `AgentCta` L361-387 (~290 tok)
  - fn `ContactFormBlock` L388-403 (~152 tok)
  - fn `Footer` L404-423 (~225 tok)
- `index.ts` — Exports architecturalComponents, architecturalChrome (~194 tok)
- `theme.css` — Styles: 103 rules, 5 vars (~3645 tok)

## lib/landing/themes/boldRetail/

- `blocks.tsx` — 05 Bold Retail — ditranskrip dari `design/project/05 Bold Retail.dc.html`. (~4513 tok)
  - fn `Header` L24-38 (~116 tok)
  - fn `Hero` L39-59 (~230 tok)
  - fn `Developer` L60-83 (~218 tok)
  - fn `Highlights` L84-103 (~204 tok)
  - fn `HouseTypes` L104-155 (~637 tok)
  - fn `Specs` L156-190 (~377 tok)
  - fn `PricePromo` L191-218 (~362 tok)
  - fn `Location` L219-248 (~310 tok)
  - fn `Facilities` L249-268 (~205 tok)
  - fn `FloorPlans` L269-290 (~214 tok)
  - fn `Gallery` L291-308 (~185 tok)
  - fn `Testimonials` L309-331 (~257 tok)
  - fn `Faq` L332-358 (~277 tok)
  - fn `AgentCta` L359-384 (~284 tok)
  - fn `ContactFormBlock` L385-399 (~137 tok)
  - fn `Footer` L400-419 (~216 tok)
- `index.ts` — Exports boldRetailComponents, boldRetailChrome (~192 tok)
- `theme.css` — Styles: 103 rules, 4 vars (~4064 tok)

## lib/landing/themes/classicNavy/

- `blocks.tsx` — 08 Klasik Navy — ditranskrip dari `design/project/08 Klasik Navy.dc.html`. (~4745 tok)
  - fn `Header` L20-28 (~80 tok)
  - fn `Hero` L29-73 (~476 tok)
  - fn `Highlights` L74-91 (~185 tok)
  - fn `HouseTypes` L92-140 (~596 tok)
  - fn `Specs` L141-176 (~393 tok)
  - fn `Facilities` L177-195 (~201 tok)
  - fn `Location` L196-224 (~295 tok)
  - fn `FloorPlans` L225-247 (~228 tok)
  - fn `Gallery` L248-266 (~192 tok)
  - fn `PricePromo` L267-295 (~378 tok)
  - fn `Testimonials` L296-314 (~218 tok)
  - fn `Developer` L315-335 (~228 tok)
  - fn `Faq` L336-362 (~268 tok)
  - fn `AgentCta` L363-387 (~284 tok)
  - fn `ContactFormBlock` L388-403 (~157 tok)
  - fn `Footer` L404-423 (~216 tok)
- `index.ts` — Exports classicNavyComponents, classicNavyChrome (~193 tok)
- `theme.css` — Styles: 104 rules, 3 vars (~3812 tok)

## lib/landing/themes/corporateBlue/

- `blocks.tsx` — 03 Korporat Biru — ditranskrip dari `design/project/03 Korporat Biru.dc.html`. (~4800 tok)
  - fn `Header` L22-30 (~76 tok)
  - fn `Hero` L31-50 (~220 tok)
  - fn `ContactFormBlock` L51-66 (~177 tok)
  - fn `Developer` L67-91 (~245 tok)
  - fn `Highlights` L92-112 (~226 tok)
  - fn `HouseTypes` L113-171 (~719 tok)
  - fn `Specs` L172-207 (~394 tok)
  - fn `Location` L208-238 (~338 tok)
  - fn `Facilities` L239-259 (~224 tok)
  - fn `FloorPlans` L260-282 (~228 tok)
  - fn `Gallery` L283-301 (~195 tok)
  - fn `PricePromo` L302-330 (~389 tok)
  - fn `Testimonials` L331-353 (~252 tok)
  - fn `Faq` L354-381 (~290 tok)
  - fn `AgentCta` L382-409 (~342 tok)
  - fn `Footer` L410-429 (~216 tok)
- `index.ts` — Exports corporateBlueComponents, corporateBlueChrome (~194 tok)
- `theme.css` — Styles: 99 rules, 3 vars (~4321 tok)

## lib/landing/themes/editorialWhite/

- `blocks.tsx` — 02 Editorial Putih — ditranskrip dari `design/project/02 Editorial Putih.dc.html`. (~4744 tok)
  - fn `Header` L22-31 (~98 tok)
  - fn `TitleWithAccent` L32-42 (~81 tok)
  - fn `Hero` L43-81 (~416 tok)
  - fn `Highlights` L82-102 (~219 tok)
  - fn `HouseTypes` L103-139 (~441 tok)
  - fn `Specs` L140-175 (~393 tok)
  - fn `Location` L176-202 (~285 tok)
  - fn `Facilities` L203-221 (~198 tok)
  - fn `FloorPlans` L222-244 (~227 tok)
  - fn `Gallery` L245-263 (~188 tok)
  - fn `PricePromo` L264-292 (~365 tok)
  - fn `Testimonials` L293-313 (~230 tok)
  - fn `Developer` L314-334 (~229 tok)
  - fn `Faq` L335-359 (~248 tok)
  - fn `AgentCta` L360-386 (~332 tok)
  - fn `ContactFormBlock` L387-404 (~187 tok)
  - fn `Footer` L405-424 (~216 tok)
- `index.ts` — Exports editorialWhiteComponents, editorialWhiteChrome (~194 tok)
- `theme.css` — Styles: 100 rules, 4 vars (~4104 tok)

## lib/landing/themes/natureCalm/

- `blocks.tsx` — 07 Nature Calm — ditranskrip dari `design/project/07 Nature Calm.dc.html`. (~4908 tok)
  - fn `Header` L20-28 (~72 tok)
  - fn `Hero` L29-71 (~468 tok)
  - fn `Highlights` L72-90 (~210 tok)
  - fn `Facilities` L91-109 (~203 tok)
  - fn `HouseTypes` L110-158 (~598 tok)
  - fn `Specs` L159-194 (~393 tok)
  - fn `Location` L195-225 (~328 tok)
  - fn `FloorPlans` L226-248 (~228 tok)
  - fn `Gallery` L249-269 (~218 tok)
  - fn `PricePromo` L270-298 (~380 tok)
  - fn `Testimonials` L299-321 (~252 tok)
  - fn `Developer` L322-342 (~223 tok)
  - fn `Faq` L343-370 (~285 tok)
  - fn `AgentCta` L371-397 (~324 tok)
  - fn `ContactFormBlock` L398-413 (~152 tok)
  - fn `Footer` L414-433 (~216 tok)
- `index.ts` — Exports natureCalmComponents, natureCalmChrome (~192 tok)
- `theme.css` — Styles: 111 rules, 3 vars (~3858 tok)

## lib/landing/themes/playfulPastel/

- `blocks.tsx` — 09 Playful Pastel — ditranskrip dari `design/project/09 Playful Pastel.dc.html`. (~4886 tok)
  - fn `Header` L22-30 (~73 tok)
  - fn `Hero` L31-72 (~531 tok)
  - fn `Highlights` L73-90 (~191 tok)
  - fn `HouseTypes` L91-140 (~607 tok)
  - fn `Specs` L141-175 (~382 tok)
  - fn `Facilities` L176-193 (~194 tok)
  - fn `Location` L194-223 (~317 tok)
  - fn `FloorPlans` L224-245 (~214 tok)
  - fn `Gallery` L246-263 (~194 tok)
  - fn `PricePromo` L264-293 (~386 tok)
  - fn `Testimonials` L294-316 (~258 tok)
  - fn `Developer` L317-337 (~232 tok)
  - fn `Faq` L338-364 (~273 tok)
  - fn `AgentCta` L365-390 (~286 tok)
  - fn `ContactFormBlock` L391-405 (~138 tok)
  - fn `Footer` L406-425 (~216 tok)
- `index.ts` — Exports playfulPastelComponents, playfulPastelChrome (~194 tok)
- `theme.css` — Styles: 107 rules, 7 vars (~4304 tok)

## lib/landing/themes/premiumDark/

- `blocks.tsx` — 01 Premium Gelap — ditranskrip dari `design/project/01 Premium Gelap.dc.html`. (~4830 tok)
  - fn `Header` L21-29 (~81 tok)
  - fn `Hero` L30-67 (~406 tok)
  - fn `Highlights` L68-87 (~207 tok)
  - fn `HouseTypes` L88-137 (~594 tok)
  - fn `Specs` L138-173 (~394 tok)
  - fn `Facilities` L174-194 (~223 tok)
  - fn `Gallery` L195-212 (~170 tok)
  - fn `Location` L213-243 (~328 tok)
  - fn `FloorPlans` L244-276 (~335 tok)
  - fn `PricePromo` L277-307 (~377 tok)
  - fn `Testimonials` L308-328 (~232 tok)
  - fn `Developer` L329-349 (~223 tok)
  - fn `Faq` L350-376 (~266 tok)
  - fn `AgentCta` L377-402 (~332 tok)
  - fn `ContactFormBlock` L403-420 (~190 tok)
  - fn `Footer` L421-440 (~216 tok)
- `index.ts` — Exports premiumDarkComponents, premiumDarkChrome (~193 tok)
- `theme.css` — Styles: 100 rules, 4 vars (~4462 tok)

## lib/landing/themes/shared/

- `parts.tsx` — Primitif media bersama untuk kesepuluh tema. (~368 tok)

## lib/landing/themes/softLuxury/

- `blocks.tsx` — 04 Soft Luxury Beige — ditranskrip dari (~4833 tok)
  - fn `Header` L22-30 (~79 tok)
  - fn `Hero` L31-70 (~428 tok)
  - fn `Highlights` L71-88 (~190 tok)
  - fn `HouseTypes` L89-128 (~474 tok)
  - fn `Specs` L129-164 (~396 tok)
  - fn `Facilities` L165-185 (~232 tok)
  - fn `Location` L186-216 (~328 tok)
  - fn `Gallery` L217-235 (~194 tok)
  - fn `FloorPlans` L236-258 (~228 tok)
  - fn `PricePromo` L259-289 (~398 tok)
  - fn `Testimonials` L290-312 (~254 tok)
  - fn `Developer` L313-333 (~230 tok)
  - fn `Faq` L334-361 (~291 tok)
  - fn `AgentCta` L362-389 (~354 tok)
  - fn `ContactFormBlock` L390-406 (~176 tok)
  - fn `Footer` L407-426 (~216 tok)
- `index.ts` — Exports softLuxuryComponents, softLuxuryChrome (~192 tok)
- `theme.css` — Styles: 113 rules, 4 vars (~3830 tok)

## lib/landing/themes/tropicalWarm/

- `AgentCta.tsx` — Tim marketing (desain #10). Satu kartu agen — multi-agen di luar scope MVP. (~476 tok)
- `ContactFormBlock.tsx` — Blok penutup. Desain #10 tidak punya form, tapi menghapusnya berarti mematikan (~315 tok)
- `Developer.tsx` — Developer (~271 tok)
- `Facilities.tsx` — Facilities (~271 tok)
- `Faq.tsx` — Faq — uses useState (~346 tok)
- `FloorPlans.tsx` — Masterplan kawasan + denah per tipe. Legenda klaster mewarnai diri dari palet. (~428 tok)
- `Footer.tsx` — Footer (~255 tok)
- `Gallery.tsx` — Carousel horizontal. Slot dibentuk dari keterangan (blok) DAN foto (media): (~328 tok)
- `Header.tsx` — Header (~96 tok)
- `Hero.tsx` — Hero + price bar dalam satu komponen (price bar bukan blok tersendiri, spec §11). (~521 tok)
  - fn `Hero` L11-51 (~388 tok)
- `Highlights.tsx` — USP bernomor: judul tebal + satu kalimat penjelas (desain #10, blok "Enam alasan utama"). (~290 tok)
- `HouseTypes.tsx` — Blok tipe unit bertab (desain #10, blok hijau). Ganti tab menukar kartu tanpa (~870 tok)
  - fn `HouseTypes` L13-75 (~721 tok)
- `index.ts` — Exports tropicalWarmComponents, tropicalWarmChrome (~326 tok)
- `Location.tsx` — Location (~358 tok)
- `parts.tsx` — Tropis Hangat memakai primitif bersama. File ini tinggal jembatan supaya (~54 tok)
- `PricePromo.tsx` — PricePromo (~522 tok)
  - fn `PricePromo` L4-48 (~480 tok)
- `Specs.tsx` — Tabel perbandingan semua tipe. Mati by default (spesifikasi sudah di kartu tipe unit). (~517 tok)
  - fn `Specs` L5-47 (~444 tok)
- `Testimonials.tsx` — Testimoni HANYA diisi agen (tidak pernah dari AI). Kosong = tidak dirender. (~318 tok)
- `theme.css` — Styles: 93 rules, 2 vars, 1 media queries (~5158 tok)

## lib/leads/

- `metrics.ts` — Rasio 0..1 dari kartu "Conversion · VISITOR → LEAD". Pembilangnya adalah (~632 tok)
  - section `LeadMetrics` L3-20 (~199 tok)
  - fn `isoDate` L21-28 (~70 tok)
  - fn `computeLeadMetrics` L29-60 (~333 tok)

## lib/media/

- `actions.ts` — Direktori unggahan bisa dioverride lewat LISTINGKU_UPLOAD_DIR — dibaca ulang (~2243 tok)
  - fn `uploadDir` L24-38 (~229 tok)
  - fn `requireOwnedProject` L39-50 (~142 tok)
  - fn `uploadMediaAction` L51-110 (~799 tok)
  - fn `deleteMediaAction` L111-149 (~563 tok)
  - fn `setPrimaryMediaAction` L150-173 (~292 tok)
- `downscale.ts` — Mengecilkan gambar di browser sebelum diunggah. Menjaga .data/store.json dan (~460 tok)

## lib/places/

- `regions.ts` — searchRegions/formatRegion/composeLocationLabel atas dataset offline @/data/id-regions.json (impor JSON statis, BUKAN node:fs — aman dipakai dari route handler; tidak mengimpor @/lib/data). Prefix match didahulukan atas contains match (~450 tok)

## lib/schemas/

- `agentProfile.ts` — Lima tema situs profil agen, disalin dari file design. Sengaja BERBEDA dari (~602 tok)
- `houseType.ts` — z.coerce.number() tanpa invalid_type_error membiarkan pesan bawaan Zod (~380 tok)
- `index.ts` (~183 tok)
- `lead.ts` — Nomor Indonesia: 08xx / +62 / 62, 9–15 digit setelah normalisasi. (~187 tok)
- `project.ts` — Kunci notes dibatasi ke BlockType yang benar-benar ada, bukan string bebas. (~1075 tok)

## public/uploads/

- `.gitkeep` (~0 tok)

## styles/

- `globals.css` — Styles: 30 rules, 10 vars, 2 layers (~713 tok)
- `type-utils.css` — Styles: 12 rules (~486 tok)

## styles/tokens/

- `colors.css` — Styles: 39 vars (~359 tok)
- `elevation.css` — Styles: 5 vars (~66 tok)
- `motion.css` — Styles: 6 vars (~92 tok)
- `radius.css` — Styles: 6 vars (~62 tok)
- `spacing.css` — Styles: 13 vars (~84 tok)
- `typography.css` — Styles: 41 vars (~415 tok)

## test-results/

- `.last-run.json` (~13 tok)

## tests/e2e/

- `editor.spec.ts` — Declares rows (~948 tok)
- `house-type.spec.ts` (~770 tok)
- `landing-lead.spec.ts` — Landing sekarang mobile-only: di layar lebar bingkai 390px dipusatkan, bukan (~749 tok)
- `landing-ssr.spec.ts` — API routes: GET (5 endpoints) (~548 tok)
- `landing-theme.spec.ts` — Menjaga tema "Tropis Hangat": keempat belas blok terisi seed Parkspring dan (~510 tok)
- `leads.spec.ts` — Declares nama (~1164 tok)
- `login.spec.ts` (~203 tok)
- `publish.spec.ts` — API routes: GET (3 endpoints) (~457 tok)
- `settings.spec.ts` (~928 tok)
- `spine.spec.ts` — Satu tes yang menjaga seluruh slice: jalur North Star dari login sampai (~1464 tok)
- `zz-ai-failure.spec.ts` — Verifikasi §14 #4: dengan AI_MOCK_FAIL=1 di server, Generate AI harus (~591 tok)

## tests/mocks/

- `next-font.ts` — Mock untuk `next/font/google` di lingkungan Vitest. next/font adalah konstruksi (~469 tok)

## tests/unit/

- `agent-profile-schema.test.ts` — Declares parsed (~955 tok)
- `ai-mock.test.ts` — Declares store (~1289 tok)
- `block-renderer.test.tsx` — blocks (~1210 tok)
- `blocks.test.ts` — Declares blocks (~1071 tok)
- `brief-resolve.test.ts` — Task 3: pickFirst + rantai resolveBlocks pakai project.brief — access/facilities/pricePromo brief-only (nol ai.*), highlights/hero.subtitle/agentCta.defaultMessage AI-di-atas-brief (~2687 tok)
  - fn `fixture` L8-212 (~2527 tok)
- `brief-schema.test.ts` — Declares brief (~625 tok)
- `brief-store.test.ts` — Task 2: `db.projects.create()` selalu isi `brief`/`projectType` default, terima override, clone (~565 tok)
- `contact-form.test.tsx` — houseType (~585 tok)
  - fn `houseType` L11-44 (~493 tok)
- `create-project-wizard.test.tsx` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~1671 tok)
- `dashboard.test.tsx` — AGENT (~1318 tok)
- `ds-components.test.tsx` — btn (~838 tok)
- `editor-theme-palette.test.ts` — Tiap theme.css ditranskrip 1:1 dari satu file desain yang mengandaikan (~727 tok)
  - fn `makeProject` L28-67 (~432 tok)
- `format.test.ts` (~1316 tok)
- `house-type-actions.test.ts` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~3461 tok)
  - fn `makeProject` L41-273 (~3051 tok)
- `house-type-sheet.test.tsx` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi — sama seperti (~1718 tok)
  - fn `makeProject` L46-139 (~1210 tok)
- `landing-actions.test.ts` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~2923 tok)
  - fn `makeProject` L28-37 (~118 tok)
  - fn `makeHouseType` L38-44 (~65 tok)
  - fn `validInput` L45-251 (~2466 tok)
- `landing-fonts.test.ts` — Declares f (~190 tok)
- `leads-metrics.test.ts` — NOW: evt (~948 tok)
  - fn `evt` L7-92 (~862 tok)
- `leads-page.test.tsx` — PROJECT (~1561 tok)
  - fn `lead` L28-49 (~272 tok)
  - fn `renderPage` L50-132 (~981 tok)
- `media-actions.test.ts` — @vitest-environment node (~4504 tok)
  - fn `makeProject` L55-66 (~78 tok)
  - fn `photoFile` L67-70 (~41 tok)
  - fn `formFor` L71-84 (~94 tok)
  - fn `listUploadFiles` L85-350 (~3604 tok)
- `media-validation.test.ts` — Declares type (~345 tok)
- `material-panels.test.tsx` — Task 12: lima panel materi (Hero/Highlights/Facilities/Location/Promo) — pilih heroEmphasis, ctaGoals multi, tambah/hapus keunggulan, chip preset fasilitas + custom, tambah/hapus nearby, menit kosong -> null (bukan 0), pesan "tidak tampil sebagai kartu akses", toggle promo null/objek, butir promo per baris. `PromoHarness` (wrapper `useState`, fix round 1) menutup lingkaran state sungguhan untuk tes "butir promo dipisah" — assert `toHaveValue` (tampilan) DAN bentuk array items (menangkap split() yang dibuang, yang tidak tertangkap toHaveValue saja). (~950 tok)
- `mock-store.test.ts` — API routes: GET (4 endpoints) (~7047 tok)
- `page-view-tracker.test.tsx` — recordEventActionMock (~473 tok)
- `palettes.test.ts` — Luminansi relatif WCAG 2.1 dari hex #rrggbb. (~997 tok)
  - fn `luminance` L5-13 (~85 tok)
  - fn `contrast` L14-82 (~835 tok)
- `places.test.ts` — searchRegions/formatRegion/composeLocationLabel atas dataset offline (~500 tok)
- `phone-display.test.ts` (~352 tok)
- `project-actions.test.ts` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~2342 tok)
- `project-detail-page.test.tsx` — PROJECT (~1334 tok)
  - fn `houseType` L30-102 (~972 tok)
- `qr-route.test.ts` (~154 tok)
- `resolve.test.ts` — fixture: describe (~3752 tok)
  - fn `fixture` L8-289 (~3652 tok)
- `schemas.test.ts` — Declares result (~1144 tok)
- `section-planner.test.tsx` — Task 11: SectionPlanner satu baris per section, progressive disclosure (semua terkuncup, buka/tutup panel), checkbox onToggle pakai id blok bukan tipe, "Gunakan rekomendasi" -> onUsePreset, fallback catatan bebas saat panelFor kosong, ringkasan materi brief. (~700 tok)
- `section-preset.test.ts` — Task 6: SECTION_PRESET punya entri per ProjectType, hanya BlockType valid, testimonials mati di semua preset, kavling/ruko sesuai spec; applySectionPreset menyalakan/mematikan tanpa mengubah urutan/props. (~450 tok)
- `seo.test.ts` — Declares store (~917 tok)
- `session.test.ts` — Declares store (~322 tok)
- `settings-actions.test.ts` — Pola sama dengan house-type-actions.test.ts: LISTINGKU_DATA_DIR harus di-set (~1373 tok)
- `settings-page.test.tsx` — AGENT — uses useRouter (~1374 tok)
  - fn `renderPage` L33-109 (~984 tok)
- `setup.ts` (~13 tok)
- `sidebar-nav.test.tsx` — path (~733 tok)
- `slug.test.ts` — Declares reserved (~476 tok)
- `snapshot-retry.test.ts` — Declares errWithCode (~381 tok)
- `sticky-cta-bar.test.tsx` — StickyCtaBar merender WhatsAppLink, yang memanggil recordEventAction (Server (~431 tok)
- `theme-migration.test.ts` — Declares old (~812 tok)
- `theme-no-literal-colors.test.ts` — Penegak aturan arsitektur: komponen tema tidak boleh menulis warna literal. (~295 tok)
- `theme-token-pairs.test.ts` — Penegak KONTRAK PERAN TOKEN (lihat header lib/landing/palettes.ts). (~1398 tok)
  - fn `luminance` L24-32 (~85 tok)
  - fn `contrast` L33-50 (~206 tok)
  - section `Decl` L51-59 (~127 tok)
  - fn `collectDeclarations` L60-118 (~647 tok)
- `tokens.test.ts` — STYLES: allCss (~536 tok)
  - fn `read` L6-7 (~21 tok)
  - fn `allCss` L8-50 (~462 tok)
- `ui-primitives.test.tsx` — read — renders modal (~800 tok)
  - fn `read` L8-61 (~715 tok)
- `whatsapp-link.test.tsx` — recordEventActionMock (~767 tok)
