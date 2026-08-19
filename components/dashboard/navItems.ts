export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'projects', label: 'Projects', href: '/dashboard' },
  { id: 'leads', label: 'Leads', href: '/leads' },
  { id: 'settings', label: 'Pengaturan', href: '/settings' },
] as const;

export type SidebarSection = (typeof NAV_ITEMS)[number]['id'];

/**
 * Peta aktif disalin dari `activeNav` di file design (Listingku App.dc.html):
 * wizard buat project termasuk kelompok Dashboard, sedangkan detail project
 * beserta layar generate/editor/publish termasuk kelompok Projects.
 *
 * `/projects/new` karenanya harus DIKECUALIKAN dari Projects — pencocokan
 * prefiks `/projects` yang naif akan menyalakan dua item sekaligus.
 */
export function isNavItemActive(id: SidebarSection, pathname: string): boolean {
  switch (id) {
    case 'dashboard':
      return pathname === '/dashboard' || pathname === '/projects/new';
    case 'projects':
      return pathname.startsWith('/projects/') && pathname !== '/projects/new';
    case 'leads':
      return pathname === '/leads';
    case 'settings':
      return pathname === '/settings';
  }
}
