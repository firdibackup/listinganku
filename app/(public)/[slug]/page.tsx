import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/data';
import { resolveBlocks } from '@/lib/landing/resolve';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { THEMES } from '@/lib/landing/themes';
import { paletteStyle } from '@/lib/landing/palettes';
import { buildJsonLd, buildMetadata, jsonLdScript } from '@/lib/landing/seo';
import { PageViewTracker } from '@/components/landing/PageViewTracker';
import { StickyCtaBar } from '@/components/landing/StickyCtaBar';

/**
 * cache() menyatukan panggilan load() dari generateMetadata dan dari komponen
 * halaman ke satu eksekusi per request. Tanpa ini keduanya membaca ulang
 * project + house types + media + agent dari db secara terpisah — tidak
 * berbahaya di atas mock store, tapi ini pola yang akan tetap dipakai saat db
 * berpindah ke Supabase, jadi query ganda sebaiknya tidak pernah jadi norma.
 */
const load = cache(async (slug: string) => {
  const project = await db.projects.getBySlug(slug);
  if (!project || project.status !== 'published') return null;

  const [houseTypes, media, agent] = await Promise.all([
    db.houseTypes.listByProject(project.id),
    db.media.listByProject(project.id),
    db.agentProfile.get(project.userId),
  ]);
  if (!agent) return null;

  return { project, houseTypes, media, agent };
});

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
  const ctaBlock = blocks.find((b) => b.type === 'agentCta');
  const types = typesBlock && typesBlock.type === 'houseTypes' ? typesBlock.houseTypes : [];

  const theme = THEMES[data.project.theme] ?? THEMES.tropicalWarm;
  const { Header, Footer } = theme.Chrome;

  return (
    <div
      className={`lp ${theme.fonts.className}`}
      data-lp-theme={data.project.theme}
      data-lp-palette={data.project.palette}
      style={paletteStyle(data.project.palette)}
    >
      {/* JSON-LD dibentuk dari data kita sendiri lalu diserialisasi lewat
          jsonLdScript() (escape '<') — bukan konten AI/markdown, jadi
          dangerouslySetInnerHTML di sini aman sesuai aturan proyek. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      {/* Mencatat satu event visitor per project per sesi tab, di klien —
          sengaja bukan di SSR untuk menghindari hitung ganda dari cache/prefetch. */}
      <PageViewTracker projectId={data.project.id} />

      <Header project={data.project} agent={data.agent} houseTypes={types} />

      {types.length > 1 ? (
        <nav className="lp__pills" aria-label="Lompat ke tipe rumah">
          {types.map((h) => (
            <a key={h.id} href={`#${h.slug}`} className="lp__pill">{h.name}</a>
          ))}
        </nav>
      ) : null}

      <BlockRenderer blocks={blocks} theme={data.project.theme} />

      <Footer project={data.project} agent={data.agent} houseTypes={types} />

      {/* Nomor dan pesan diambil dari blok agentCta yang sudah diresolve, bukan
          dari agent mentah — kalau agen menimpanya di editor, bar ini ikut. Blok
          yang dinonaktifkan tidak ikut ke blocks, jadi bar pun ikut hilang. */}
      {ctaBlock && ctaBlock.type === 'agentCta' ? (
        <StickyCtaBar
          projectId={data.project.id}
          waNumber={ctaBlock.waNumber}
          message={ctaBlock.defaultMessage}
        />
      ) : null}
    </div>
  );
}
