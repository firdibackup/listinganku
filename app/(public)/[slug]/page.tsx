import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/data';
import { LandingView } from '@/lib/landing/LandingView';
import { buildMetadata } from '@/lib/landing/seo';

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

  return <LandingView data={data} />;
}
