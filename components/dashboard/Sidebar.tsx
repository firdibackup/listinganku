'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AgentProfile } from '@/lib/data/types';
import { NAV_ITEMS, isNavItemActive } from './navItems';

/**
 * Client Component semata-mata supaya `usePathname()` bisa menurunkan item nav
 * yang aktif. Sebelumnya layout mengoper prop `active` yang di-hardcode
 * "dashboard", sehingga setiap halaman dashboard menyalakan item yang sama.
 */
export function Sidebar({ agent }: { agent: AgentProfile }) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="dash__aside">
      <Image src="/brand/listingku-logo.png" alt="Listingku" width={128} height={30} />
      <nav className="dash__nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="dash__navitem"
            aria-current={isNavItemActive(item.id, pathname) ? 'page' : undefined}
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
          {/* Static plan-tier label — AgentProfile has no plan/tier field. Billing
              and quota are explicitly out of MVP scope, so this isn't backed by data. */}
          <div className="lw-label-sm" style={{ color: 'var(--sage)' }}>Starter</div>
        </div>
      </div>
    </aside>
  );
}
