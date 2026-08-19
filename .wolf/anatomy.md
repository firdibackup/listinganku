# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-08-18T23:21:30.058Z
> Files: 270 tracked | Anatomy hits: 0 | Misses: 0

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
- `tsconfig.tsbuildinfo` (~47948 tok)
- `vitest.config.ts` — Vitest test configuration (~109 tok)

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

## .data/

- `store.json` (~7446 tok)

## .impeccable/

- `config.local.json` (~14 tok)
- `hook.cache.json` (~3668 tok)

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

- `actions.ts` — Satu project hanya boleh diubah oleh pemiliknya. requireSessionUserId() cuma (~1373 tok)
  - fn `requireOwnedProject` L23-28 (~65 tok)
  - fn `createProjectAction` L29-49 (~314 tok)
  - fn `updateProjectAction` L50-67 (~209 tok)
  - fn `publishProjectAction` L68-88 (~238 tok)
  - fn `deleteProjectAction` L89-108 (~268 tok)

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

- `actions.ts` — Exports saveBlocksAction, setThemeAction (~244 tok)
- `page.tsx` — EditorPage (~223 tok)

## app/(dashboard)/projects/[id]/generate/

- `actions.ts` — Exports generateContentAction (~666 tok)
  - fn `generateContentAction` L8-64 (~589 tok)
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
- `page.tsx` — cache() menyatukan panggilan load() dari generateMetadata dan dari komponen (~1163 tok)
  - fn `generateMetadata` L32-40 (~110 tok)
  - fn `LandingPage` L41-97 (~654 tok)

## app/api/qr/

- `helpers.ts` — Exports QR_FORMATS, QrFormat, qrTargetUrl, isValidQrFormat (~116 tok)
- `route.ts` — Next.js API route: GET (~401 tok)

## app/login/

- `actions.ts` — Sesi dummy slice 1: tidak ada auth sungguhan. Tombol mana pun menandatangani (~125 tok)
- `page.tsx` — metadata — renders form (~484 tok)

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

- `BlockSettingsPanel.tsx` — BlockSettingsPanel (~2158 tok)
  - fn `BlockSettingsPanel` L9-179 (~2031 tok)
- `editor.css` — Styles: 22 rules, 1 media queries (~704 tok)
- `EditorShell.tsx` — ALL_THEMES — uses useState, useMemo (~2072 tok)
  - fn `EditorShell` L20-178 (~1740 tok)

## components/landing/

- `ContactForm.tsx` — Form kontak publik (klien); submit ke submitLeadAction, validasi di server, konfirmasi datar "Permintaan terkirim". Select tipe rumah opsional. (~1040 tok)
  - fn `ContactForm` L16-109 (~813 tok)
- `PageViewTracker.tsx` — Komponen klien tak-merender; catat 1 event visitor per project per sesi tab via sessionStorage. (~377 tok)
- `StickyCtaBar.tsx` — Klien; bar CTA melekat di bawah untuk layar <900px (kelas .lp__stickybar). WhatsApp + tautan #minta-info ke blok form. Dirender di app/(public)/[slug]/page.tsx dari blok agentCta yang sudah diresolve. (~304 tok)
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

- `CreateProjectWizard.tsx` — Terisi begitu langkah 1 disimpan; langkah berikutnya meng-update baris yang sama. (~1930 tok)
  - fn `CreateProjectWizard` L13-162 (~1810 tok)
- `StepProgress.tsx` — StepProgress (~107 tok)
- `wizard.css` — Styles: 13 rules, 1 media queries (~402 tok)

## docs/superpowers/plans/

- `2026-08-16-listingku-frontend-slice1.md` — Listingku Front-End Slice 1 — Implementation Plan (~66573 tok)

## docs/superpowers/specs/

- `2026-08-16-listingku-frontend-slice1-design.md` — Spec design Slice 1 front-end yang sudah disetujui. Sumber kebenaran untuk implementasi: batas slice, aturan design system + konten, repository seam, model blocks/theme, landing wireframe, AI mock, pengujian, definisi selesai, 9 keputusan tercatat. **Baca ini sebelum menulis kode aplikasi.** (~7093 tok)

## fixtures/

- `seed.ts` — Exports SEED_USER_ID, seedStore (~1714 tok)
  - fn `seedStore` L34-113 (~1278 tok)

## graphify-out/

- `.graphify_detect.json` (~145 tok)
- `.graphify_python` (~21 tok)
- `.graphify_root` (~7 tok)

## graphify-out/cache/

- `stat-index.json` (~36 tok)

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

- `generator.ts` — Diekspos supaya tes bisa menjalankan mock tanpa menunggu. (~171 tok)
- `index.ts` — Saat Gemini asli masuk, cabang kedua ditambahkan di sini. Tidak ada tempat lain. (~136 tok)
- `mock.ts` — Exports mockGenerator (~1316 tok)
  - fn `wait` L6-7 (~20 tok)
  - fn `paragraphs` L8-71 (~1213 tok)
- `schema.ts` — Cermin persis `responseSchema` yang akan dikirim ke Gemini 2.5 Flash. (~254 tok)

## lib/data/

- `index.ts` — Singleton disimpan di globalThis supaya HMR Next.js tidak me-reset store (~294 tok)
- `repo.ts` — Satu-satunya kontrak yang dilihat UI. Slice 1 mengisinya dengan mock store; (~776 tok)
  - section `DataStore` L17-66 (~515 tok)
- `types.ts` — Stat ke-3 pada tab Profil di file design ("Wilayah Spesialis"). Teks, jadi (~984 tok)
  - section `SeoContent` L11-15 (~22 tok)
  - section `ProjectAiContent` L16-24 (~75 tok)
  - section `HouseTypeAiContent` L25-29 (~28 tok)
  - section `AgentProfile` L30-54 (~206 tok)
  - section `Project` L55-73 (~105 tok)
  - section `HouseType` L74-91 (~97 tok)
  - section `Media` L92-104 (~60 tok)
  - section `Lead` L105-117 (~63 tok)
  - section `EventRow` L118-126 (~39 tok)
  - section `AiUsage` L127-139 (~65 tok)
  - section `StoreShape` L140-149 (~56 tok)

## lib/data/mock/

- `repos.ts` — Setiap metode baca (dan hasil create/update) HARUS lewat clone() sebelum (~2791 tok)
  - fn `now` L8-20 (~190 tok)
  - fn `createMockStore` L21-248 (~2436 tok)
- `snapshot.ts` — Direktori data bisa dioverride lewat LISTINGKU_DATA_DIR — dibaca ulang setiap (~1632 tok)
  - fn `dataDir` L14-17 (~32 tok)
  - fn `storeFile` L18-23 (~55 tok)
  - fn `isPlainObject` L24-28 (~77 tok)
  - fn `isRowLike` L29-43 (~229 tok)
  - fn `repairShape` L44-58 (~174 tok)
  - fn `loadSnapshot` L59-76 (~205 tok)
  - fn `renameWithRetry` L77-100 (~278 tok)
  - fn `saveSnapshot` L101-121 (~256 tok)
  - fn `sweepStaleTmp` L122-136 (~143 tok)
- `store.ts` — Tulis sinkron, tanpa debounce. Ini mock single-user untuk dev lokal atas (~251 tok)

## lib/data/supabase/

- `README.md` — Project documentation (~142 tok)

## lib/landing/

- `BlockRenderer.tsx` — Satu-satunya tempat yang menerjemahkan ResolvedBlock[] menjadi markup nyata. (~289 tok)
- `blocks.ts` — Block model & types for landing pages: BlockType union, BLOCK_ORDER, BLOCK_LABELS, defaultBlocks/moveBlock/toggleBlock/updateBlockProps functions (~1286 tok)
  - section `BlockBase` L17-82 (~726 tok)
  - fn `defaultBlocks` L83-88 (~52 tok)
  - fn `moveBlock` L89-98 (~108 tok)
  - fn `toggleBlock` L99-106 (~87 tok)
  - fn `updateBlockProps` L107-118 (~118 tok)
- `landing.css` — Styles: 21 rules, 2 media queries (~576 tok)
- `resolve.ts` — Rantai yang menopang tombol "Use AI suggestion": override, lalu AI, lalu fallback. (~2152 tok)
  - section `ResolvedHouseType` L4-33 (~360 tok)
  - section `ResolveInput` L34-56 (~233 tok)
  - fn `resolveHouseTypes` L57-83 (~335 tok)
  - fn `resolveBlocks` L84-199 (~1190 tok)
- `seo.ts` — Serialisasi aman untuk dipasang lewat dangerouslySetInnerHTML di dalam (~935 tok)
  - fn `siteUrl` L4-7 (~31 tok)
  - fn `buildMetadata` L8-40 (~293 tok)
  - fn `buildJsonLd` L41-95 (~545 tok)
  - fn `jsonLdScript` L96-99 (~38 tok)

## lib/landing/themes/

- `index.ts` — Ketiga nama tema disimpan di data, tapi selama slice 1 semuanya dipetakan ke (~249 tok)

## lib/landing/themes/wireframe/

- `AgentCta.tsx` — Server Component; merender WhatsAppLink (klien) dengan projectId/waNumber/defaultMessage dari block. (~268 tok)
- `ContactFormBlock.tsx` — Server Component; merender ContactForm (klien) dengan projectId/houseTypes/askHouseType. (~257 tok)
- `Facilities.tsx` — Facilities (~170 tok)
- `Faq.tsx` — Faq (~168 tok)
- `FloorPlans.tsx` — FloorPlans (~314 tok)
- `Gallery.tsx` — Gallery (~346 tok)
- `Hero.tsx` — PlaceholderBox (~288 tok)
- `Highlights.tsx` — Highlights (~169 tok)
- `HouseTypes.tsx` — HouseTypes (~504 tok)
  - fn `HouseTypes` L5-41 (~460 tok)
- `index.ts` — Exports wireframe (~232 tok)
- `Location.tsx` — Location (~158 tok)
- `Specs.tsx` — Specs — renders table (~338 tok)

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

## lib/schemas/

- `agentProfile.ts` — Lima tema situs profil agen, disalin dari file design. Sengaja BERBEDA dari (~602 tok)
- `houseType.ts` — z.coerce.number() tanpa invalid_type_error membiarkan pesan bawaan Zod (~380 tok)
- `index.ts` (~150 tok)
- `lead.ts` — Nomor Indonesia: 08xx / +62 / 62, 9–15 digit setelah normalisasi. (~187 tok)
- `project.ts` — Publish menuntut lebih dari draft: minimal deskripsi supaya halaman tidak kosong. (~268 tok)

## public/uploads/

- `.gitkeep` (~0 tok)

## styles/

- `globals.css` — Styles: 19 rules, 10 vars, 2 layers (~525 tok)
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

- `editor.spec.ts` — Declares rows (~739 tok)
- `house-type.spec.ts` (~770 tok)
- `landing-lead.spec.ts` — Declares link (~590 tok)
- `landing-ssr.spec.ts` — API routes: GET (5 endpoints) (~538 tok)
- `leads.spec.ts` — Declares nama (~1164 tok)
- `login.spec.ts` (~193 tok)
- `publish.spec.ts` — API routes: GET (3 endpoints) (~457 tok)
- `settings.spec.ts` (~928 tok)
- `spine.spec.ts` — Satu tes yang menjaga seluruh slice: jalur North Star dari login sampai (~1464 tok)
- `zz-ai-failure.spec.ts` — Verifikasi §14 #4: dengan AI_MOCK_FAIL=1 di server, Generate AI harus (~591 tok)

## tests/unit/

- `agent-profile-schema.test.ts` — Declares parsed (~955 tok)
- `ai-mock.test.ts` — Declares store (~680 tok)
- `block-renderer.test.tsx` — blocks (~571 tok)
- `blocks.test.ts` — Declares blocks (~773 tok)
- `contact-form.test.tsx` — houseType (~585 tok)
  - fn `houseType` L11-44 (~493 tok)
- `create-project-wizard.test.tsx` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~1671 tok)
- `dashboard.test.tsx` — AGENT (~1318 tok)
- `ds-components.test.tsx` — btn (~838 tok)
- `format.test.ts` (~1316 tok)
- `house-type-actions.test.ts` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~3461 tok)
  - fn `makeProject` L41-273 (~3051 tok)
- `house-type-sheet.test.tsx` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi — sama seperti (~1718 tok)
  - fn `makeProject` L46-139 (~1210 tok)
- `landing-actions.test.ts` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~2923 tok)
  - fn `makeProject` L28-37 (~118 tok)
  - fn `makeHouseType` L38-44 (~65 tok)
  - fn `validInput` L45-251 (~2466 tok)
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
- `mock-store.test.ts` — API routes: GET (4 endpoints) (~7037 tok)
- `page-view-tracker.test.tsx` — recordEventActionMock (~473 tok)
- `phone-display.test.ts` (~352 tok)
- `project-actions.test.ts` — LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db (~2342 tok)
- `project-detail-page.test.tsx` — PROJECT (~1334 tok)
  - fn `houseType` L30-102 (~972 tok)
- `qr-route.test.ts` (~154 tok)
- `resolve.test.ts` — fixture: describe (~2498 tok)
  - fn `fixture` L7-209 (~2414 tok)
- `schemas.test.ts` — Declares result (~1144 tok)
- `seo.test.ts` — Declares store (~898 tok)
- `session.test.ts` — Declares store (~322 tok)
- `settings-actions.test.ts` — Pola sama dengan house-type-actions.test.ts: LISTINGKU_DATA_DIR harus di-set (~1373 tok)
- `settings-page.test.tsx` — AGENT — uses useRouter (~1374 tok)
  - fn `renderPage` L33-109 (~984 tok)
- `setup.ts` (~13 tok)
- `sidebar-nav.test.tsx` — path (~733 tok)
- `slug.test.ts` — Declares reserved (~476 tok)
- `snapshot-retry.test.ts` — Declares errWithCode (~381 tok)
- `sticky-cta-bar.test.tsx` — StickyCtaBar merender WhatsAppLink, yang memanggil recordEventAction (Server (~431 tok)
- `tokens.test.ts` — STYLES: allCss (~536 tok)
  - fn `read` L6-7 (~21 tok)
  - fn `allCss` L8-50 (~462 tok)
- `ui-primitives.test.tsx` — read — renders modal (~800 tok)
  - fn `read` L8-61 (~715 tok)
- `whatsapp-link.test.tsx` — recordEventActionMock (~767 tok)
