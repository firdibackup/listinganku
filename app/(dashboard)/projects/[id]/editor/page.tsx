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
