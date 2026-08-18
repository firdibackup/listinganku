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
