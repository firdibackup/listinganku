import Link from 'next/link';
import { Chip } from '@/components/ds';
import { formatDateShort } from '@/lib/format';
import type { Project } from '@/lib/data/types';

export function ProjectCard({ project, houseTypeCount }: { project: Project; houseTypeCount: number }) {
  const published = project.status === 'published';
  return (
    <Link href={`/projects/${project.id}`} className="dash__project">
      <div className="dash__thumb" />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span className="lw-label-lg">{project.name}</span>
          <Chip tone={published ? 'tint' : 'outline'}>{published ? 'Published' : 'Draft'}</Chip>
        </div>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          {houseTypeCount} tipe unit · {project.location}
        </p>
        <p className="lw-label-sm" style={{ marginTop: 4, color: 'var(--sage)' }}>
          Diperbarui {formatDateShort(project.updatedAt)}
        </p>
      </div>
    </Link>
  );
}
