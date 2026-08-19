import Link from 'next/link';
import type { LeadStatus, Project } from '@/lib/data/types';
import { LEAD_STATUSES, LEAD_STATUS_META } from './leadStatus';

export interface LeadFilterState {
  status: LeadStatus | null;
  project: string | null;
}

function hrefWith(current: LeadFilterState, patch: Partial<LeadFilterState>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.status) params.set('status', next.status);
  if (next.project) params.set('project', next.project);
  const qs = params.toString();
  return qs ? `/leads?${qs}` : '/leads';
}

/**
 * Filter berbasis URL, bukan state klien: halaman tetap Server Component, hasil
 * saringan bisa di-bookmark dan dibagikan, dan tombol back browser bekerja.
 *
 * <details> dipakai supaya dropdown berfungsi tanpa JavaScript sama sekali dan
 * tanpa dependency baru. Batasnya: panel tidak menutup saat klik di luar —
 * memilih opsi mana pun menavigasi halaman, yang menutupnya juga.
 */
export function LeadFilters({
  filters, projects,
}: { filters: LeadFilterState; projects: Pick<Project, 'id' | 'name'>[] }) {
  const activeProject = projects.find((p) => p.id === filters.project);

  return (
    <div className="leads__filters">
      <details className="leads__filter">
        <summary>{filters.status ? LEAD_STATUS_META[filters.status].label : 'Semua status'}</summary>
        <ul className="leads__menu">
          <li><Link href={hrefWith(filters, { status: null })}>Semua status</Link></li>
          {LEAD_STATUSES.map((status) => (
            <li key={status}>
              <Link href={hrefWith(filters, { status })}>{LEAD_STATUS_META[status].label}</Link>
            </li>
          ))}
        </ul>
      </details>

      <details className="leads__filter">
        <summary>{activeProject ? activeProject.name : 'Semua project'}</summary>
        <ul className="leads__menu">
          <li><Link href={hrefWith(filters, { project: null })}>Semua project</Link></li>
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={hrefWith(filters, { project: project.id })}>{project.name}</Link>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
