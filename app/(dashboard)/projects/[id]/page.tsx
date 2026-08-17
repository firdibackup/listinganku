import { notFound } from 'next/navigation';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { ProjectDetail } from '@/components/project/ProjectHeader';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireSessionUserId();
  const { id } = await params;

  // Baris tidak ada dan baris ada-tapi-bukan-milik-userId dua-duanya jatuh ke
  // notFound() yang sama — tidak membedakan keduanya di respons supaya sesi
  // yang tidak berwenang tidak bisa membedakan "project tidak pernah ada" dari
  // "project ada, milik orang lain" (bug pattern yang sama dengan
  // requireOwnedProject di app/(dashboard)/projects/actions.ts).
  const project = await db.projects.get(id);
  if (!project || project.userId !== userId) notFound();

  const [houseTypes, media] = await Promise.all([
    db.houseTypes.listByProject(id),
    db.media.listByProject(id),
  ]);

  return <ProjectDetail project={project} houseTypes={houseTypes} media={media} />;
}
