import Link from 'next/link';
import { Plus } from 'lucide-react';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { Button, Card } from '@/components/ds';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatNumber } from '@/lib/format';

export const metadata = { title: 'Dashboard — Listingku' };

export default async function DashboardPage() {
  const userId = await requireSessionUserId();
  const [agent, projects, leads, totals] = await Promise.all([
    db.agentProfile.get(userId),
    db.projects.list(userId),
    db.leads.listByUser(userId),
    db.events.totalsByUser(userId),
  ]);

  const counts = await Promise.all(
    projects.map(async (p) => (await db.houseTypes.listByProject(p.id)).length),
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <h1 className="lw-h2">Dashboard</h1>
          <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
            Kelola listing dan pantau prospek Anda.
          </p>
        </div>
        <Link href="/projects/new">
          <Button variant="primary" size="sm" iconLeft={<Plus size={15} />}>
            Create project
          </Button>
        </Link>
      </div>

      <div className="dash__grid3" style={{ marginTop: 26 }}>
        <MetricCard label="Total projects" value={formatNumber(projects.length)} />
        <MetricCard label="Total leads" value={formatNumber(leads.length)} />
        <MetricCard label="Total visitors" value={formatNumber(totals.visitor)} />
      </div>

      {agent?.isPublished ? (
        <Card
          tone="tint"
          padded={false}
          style={{
            marginTop: 16, padding: '16px 20px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
          }}
        >
          <div>
            <p className="lw-label">Website Anda sudah live</p>
            <p style={{ marginTop: 4, fontSize: 14 }}>{agent.subdomain}.listingku.app</p>
          </div>
          <Button variant="secondary" size="sm" disabled>
            Kelola profil
          </Button>
        </Card>
      ) : null}

      <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="lw-label-lg">Projects</h2>
        <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>
          {projects.length} primary property
        </span>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="dash__grid3" style={{ marginTop: 14 }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} houseTypeCount={counts[i]} />
          ))}
        </div>
      )}
    </>
  );
}
