import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/data';
import { LandingView } from '@/lib/landing/LandingView';
import { THEME_NAMES, THEME_LABELS } from '@/lib/landing/themeNames';
import type { ThemeName } from '@/lib/landing/themeNames';

/**
 * Pratinjau satu tema di atas project demo. Project yang dipakai SELALU sama
 * untuk kesepuluh tema — itu justru gunanya: satu-satunya yang berbeda antar
 * halaman ini adalah tampilannya.
 */
const PREVIEW_SLUG = 'parkspring-gading';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ThemePreview({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  if (!(THEME_NAMES as string[]).includes(theme)) notFound();
  const name = theme as ThemeName;

  const project = await db.projects.getBySlug(PREVIEW_SLUG);
  if (!project) notFound();

  const [houseTypes, media, agent] = await Promise.all([
    db.houseTypes.listByProject(project.id),
    db.media.listByProject(project.id),
    db.agentProfile.get(project.userId),
  ]);
  if (!agent) notFound();

  return (
    <>
      <h1 className="pv__srtitle">Pratinjau tema {THEME_LABELS[name]}</h1>
      <LandingView data={{ project, houseTypes, media, agent }} theme={name} track={false} />
    </>
  );
}
