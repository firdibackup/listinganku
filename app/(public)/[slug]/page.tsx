import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/data';
import { resolveBlocks } from '@/lib/landing/resolve';
import { BlockRenderer } from '@/lib/landing/BlockRenderer';
import { buildJsonLd, buildMetadata, jsonLdScript } from '@/lib/landing/seo';

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

  return (
    <div className="lp">
      {/* JSON-LD dibentuk dari data kita sendiri lalu diserialisasi lewat
          jsonLdScript() (escape '<') — bukan konten AI/markdown, jadi
          dangerouslySetInnerHTML di sini aman sesuai aturan proyek. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

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
