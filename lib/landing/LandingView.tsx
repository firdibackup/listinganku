import type { AgentProfile, HouseType, Media, PaletteName, Project, ThemeName } from '@/lib/data/types';
import { applyThemeOrder } from './blocks';
import { resolveBlocks } from './resolve';
import { BlockRenderer } from './BlockRenderer';
import { THEMES } from './themes';
import { paletteStyle } from './palettes';
import { THEME_DEFAULT_PALETTE } from './themeNames';
import { buildJsonLd, jsonLdScript } from './seo';
import { PageViewTracker } from '@/components/landing/PageViewTracker';
import { StickyCtaBar } from '@/components/landing/StickyCtaBar';

export interface LandingData {
  project: Project;
  houseTypes: HouseType[];
  media: Media[];
  agent: AgentProfile;
}

/**
 * Satu-satunya tempat halaman landing dirakit. Dipakai halaman publik `/{slug}`
 * DAN halaman pratinjau tema `/preview/{tema}` — kalau keduanya merakit sendiri,
 * pratinjau akan diam-diam berbeda dari yang dilihat pembeli.
 *
 * `theme`/`palette` hanya untuk pratinjau: menukar tema juga menyusun ulang blok
 * ke urutan bawaan tema itu (isi blok dibawa apa adanya), karena urutan section
 * memang bagian dari desain tiap tema.
 *
 * `track` mati di pratinjau — melihat-lihat tema sendiri bukan kunjungan
 * pembeli, dan menghitungnya akan mengotori metrik di dashboard.
 */
export function LandingView({
  data, theme, palette, track = true,
}: {
  data: LandingData;
  theme?: ThemeName;
  palette?: PaletteName;
  track?: boolean;
}) {
  const themeName = theme ?? data.project.theme;
  const paletteName = palette ?? (theme ? THEME_DEFAULT_PALETTE[theme] : data.project.palette);
  const project = theme
    ? { ...data.project, theme: themeName, blocks: applyThemeOrder(data.project.blocks, themeName) }
    : data.project;

  const blocks = resolveBlocks({ ...data, project });
  const faqBlock = blocks.find((b) => b.type === 'faq');
  const jsonLd = buildJsonLd(
    project,
    data.houseTypes,
    faqBlock && faqBlock.type === 'faq' ? faqBlock.items : [],
  );

  const typesBlock = blocks.find((b) => b.type === 'houseTypes');
  const ctaBlock = blocks.find((b) => b.type === 'agentCta');
  const types = typesBlock && typesBlock.type === 'houseTypes' ? typesBlock.houseTypes : [];

  const themeConfig = THEMES[themeName] ?? THEMES.tropicalWarm;
  const { Header, Footer } = themeConfig.Chrome;

  return (
    <div
      className={`lp ${themeConfig.fonts.className}`}
      data-lp-theme={themeName}
      data-lp-palette={paletteName}
      /* Menyalakan latar panggung `.lp[data-lp-standalone]::before`. Hanya
         halaman yang memiliki viewport-nya SENDIRI (publik + /preview) yang
         boleh memasangnya. Pratinjau editor merakit `.lp`-nya sendiri lalu
         men-transform-nya: pseudo `fixed` di dalam elemen ber-transform
         berbalik menutupi halaman, bukan jadi latar di belakangnya —
         penjelasan lengkap di lib/landing/landing.css. */
      data-lp-standalone=""
      style={paletteStyle(paletteName)}
    >
      {/* JSON-LD dibentuk dari data kita sendiri lalu diserialisasi lewat
          jsonLdScript() (escape '<') — bukan konten AI/markdown, jadi
          dangerouslySetInnerHTML di sini aman sesuai aturan proyek. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      {/* Mencatat satu event visitor per project per sesi tab, di klien —
          sengaja bukan di SSR untuk menghindari hitung ganda dari cache/prefetch. */}
      {track ? <PageViewTracker projectId={project.id} /> : null}

      <Header project={project} agent={data.agent} houseTypes={types} />

      <BlockRenderer blocks={blocks} theme={themeName} />

      <Footer project={project} agent={data.agent} houseTypes={types} />

      {/* Nomor dan pesan diambil dari blok agentCta yang sudah diresolve, bukan
          dari agent mentah — kalau agen menimpanya di editor, bar ini ikut. Blok
          yang dinonaktifkan tidak ikut ke blocks, jadi bar pun ikut hilang. */}
      {ctaBlock && ctaBlock.type === 'agentCta' ? (
        <StickyCtaBar
          projectId={project.id}
          waNumber={ctaBlock.waNumber}
          message={ctaBlock.defaultMessage}
        />
      ) : null}
    </div>
  );
}
