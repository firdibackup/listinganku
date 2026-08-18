import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { GeneratePanel } from '@/components/ai/GeneratePanel';

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireSessionUserId();
  const { id } = await params;

  const project = await db.projects.get(id);
  if (!project || project.userId !== userId) notFound();
  const houseTypes = await db.houseTypes.listByProject(id);

  return (
    <div style={{ maxWidth: 780 }}>
      <Link href={`/projects/${id}`} className="pj__back lw-label-sm">
        <ArrowLeft size={14} /> {project.name}
      </Link>
      <h1 className="lw-h2" style={{ marginTop: 14 }}>Generate konten AI</h1>
      <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
        Satu kali jalan untuk seluruh primary property — proyek dan semua tipe rumahnya.
      </p>
      <GeneratePanel
        projectId={id}
        projectName={project.name}
        houseTypeNames={houseTypes.map((h) => h.name)}
        existing={project.aiContent}
      />
    </div>
  );
}
