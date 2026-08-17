import Image from 'next/image';
import Link from 'next/link';
import type { AgentProfile } from '@/lib/data/types';

const ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'projects', label: 'Projects', href: '/dashboard' },
  { id: 'leads', label: 'Leads', href: '/dashboard' },
  { id: 'settings', label: 'Pengaturan', href: '/dashboard' },
] as const;

export type SidebarSection = (typeof ITEMS)[number]['id'];

export function Sidebar({ active, agent }: { active: SidebarSection; agent: AgentProfile }) {
  return (
    <aside className="dash__aside">
      <Image src="/brand/listingku-logo.png" alt="Listingku" width={128} height={30} />
      <nav className="dash__nav">
        {ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="dash__navitem"
            aria-current={item.id === active ? 'page' : undefined}
          >
            <span className="dash__navmark" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="dash__user">
        <span className="dash__avatar" aria-hidden="true">
          {agent.fullName.charAt(0)}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="lw-label">{agent.fullName}</div>
          <div className="lw-label-sm" style={{ color: 'var(--sage)' }}>Starter</div>
        </div>
      </div>
    </aside>
  );
}
