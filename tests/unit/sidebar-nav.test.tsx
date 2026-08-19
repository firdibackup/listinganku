import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NAV_ITEMS, isNavItemActive } from '@/components/dashboard/navItems';

describe('isNavItemActive', () => {
  it('menandai Dashboard di /dashboard', () => {
    expect(isNavItemActive('dashboard', '/dashboard')).toBe(true);
    expect(isNavItemActive('projects', '/dashboard')).toBe(false);
  });

  it('menandai Dashboard — bukan Projects — di wizard /projects/new', () => {
    // Sesuai activeNav file design: layar "create" masuk kelompok dashboard.
    // Prefiks /projects yang naif akan menyalakan Projects di sini.
    expect(isNavItemActive('dashboard', '/projects/new')).toBe(true);
    expect(isNavItemActive('projects', '/projects/new')).toBe(false);
  });

  it('menandai Projects di detail project dan seluruh sub-rutenya', () => {
    for (const path of [
      '/projects/prj_1', '/projects/prj_1/generate', '/projects/prj_1/editor', '/projects/prj_1/publish',
    ]) {
      expect(isNavItemActive('projects', path)).toBe(true);
      expect(isNavItemActive('dashboard', path)).toBe(false);
    }
  });

  it('menandai Leads dan Pengaturan di rutenya masing-masing', () => {
    expect(isNavItemActive('leads', '/leads')).toBe(true);
    expect(isNavItemActive('settings', '/settings')).toBe(true);
    // Tab settings adalah query param, bukan segmen — tetap harus aktif.
    expect(isNavItemActive('settings', '/settings')).toBe(true);
    expect(isNavItemActive('leads', '/settings')).toBe(false);
  });

  it('tidak menyalakan apa pun di rute yang tidak dikenal', () => {
    expect(NAV_ITEMS.every((i) => !isNavItemActive(i.id, '/login'))).toBe(true);
  });
});

describe('NAV_ITEMS', () => {
  it('menaut Leads dan Pengaturan ke halamannya sendiri, bukan ke /dashboard', () => {
    const byId = Object.fromEntries(NAV_ITEMS.map((i) => [i.id, i.href]));
    expect(byId.leads).toBe('/leads');
    expect(byId.settings).toBe('/settings');
  });
});

describe('Sidebar', () => {
  it('menandai item yang cocok dengan rute aktif lewat aria-current', async () => {
    vi.doMock('next/navigation', () => ({ usePathname: () => '/leads' }));
    const { Sidebar } = await import('@/components/dashboard/Sidebar');

    render(
      <Sidebar
        agent={{ fullName: 'Audi', id: 'a', userId: 'u' } as never}
      />,
    );

    expect(screen.getByRole('link', { name: 'Leads' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });
});
