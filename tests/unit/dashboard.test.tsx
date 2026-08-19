import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { AgentProfile, Project } from '@/lib/data/types';

const { dbMock, session, redirectMock } = vi.hoisted(() => ({
  dbMock: {
    agentProfile: { get: vi.fn() },
    projects: { list: vi.fn() },
    houseTypes: { listByProject: vi.fn() },
    leads: { listByUser: vi.fn() },
    events: { totalsByUser: vi.fn() },
  },
  session: { userId: null as string | null },
  redirectMock: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/lib/data', () => ({ db: dbMock }));
vi.mock('@/lib/session', () => ({
  getSessionUserId: async () => session.userId,
  requireSessionUserId: async () => {
    if (!session.userId) throw new Error('Sesi tidak ditemukan.');
    return session.userId;
  },
}));
// Sidebar kini Client Component yang memakai usePathname() untuk menurunkan
// item nav aktif; mock next/navigation harus menyediakannya juga.
vi.mock('next/navigation', () => ({ redirect: redirectMock, usePathname: () => '/dashboard' }));

import DashboardLayout from '@/app/(dashboard)/layout';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

const AGENT: AgentProfile = {
  id: 'agp_audi', userId: 'usr_audi', fullName: 'Audi', email: 'audi@listingku.app',
  whatsapp: '081288994410', siteName: 'Audi Property', subdomain: 'audi', theme: 'Modern',
  logoUrl: null, colorScheme: 'Oranye', about: '', stats: { closings: 0, listings: 0, years: 0 },
  services: [], isPublished: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = null;
});

describe('DashboardLayout', () => {
  it('mengarahkan ke /login saat tidak ada sesi', async () => {
    session.userId = null;
    await expect(DashboardLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('mengarahkan ke /login saat cookie sesi menunjuk userId yang tidak punya agent profile', async () => {
    session.userId = 'usr_hantu';
    dbMock.agentProfile.get.mockResolvedValue(null);
    await expect(DashboardLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(dbMock.agentProfile.get).toHaveBeenCalledWith('usr_hantu');
  });

  it('merender Sidebar dan children saat sesi valid', async () => {
    session.userId = 'usr_audi';
    dbMock.agentProfile.get.mockResolvedValue(AGENT);
    const jsx = await DashboardLayout({ children: <div data-testid="anak">isi</div> });
    render(jsx);
    expect(screen.getByTestId('anak')).toBeInTheDocument();
    expect(screen.getByText('Audi')).toBeInTheDocument();
  });
});

describe('DashboardPage — dashboard kosong', () => {
  it('menampilkan EmptyState saat agen belum punya project', async () => {
    session.userId = 'usr_audi';
    dbMock.agentProfile.get.mockResolvedValue(AGENT);
    dbMock.projects.list.mockResolvedValue([]);
    dbMock.leads.listByUser.mockResolvedValue([]);
    dbMock.events.totalsByUser.mockResolvedValue({ visitor: 0, whatsapp_click: 0, form_submit: 0 });

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText('Belum ada listing')).toBeInTheDocument();
    expect(screen.getByText('0 primary property')).toBeInTheDocument();
    expect(screen.queryByText(/tipe unit/)).not.toBeInTheDocument();
  });

  it('menampilkan kartu project dengan jumlah tipe unit nol saat project belum punya house type', async () => {
    session.userId = 'usr_audi';
    const project: Project = {
      id: 'prj_kosong', userId: 'usr_audi', name: 'Cluster Kosong', slug: 'cluster-kosong',
      location: 'Bandung', developer: 'Dev X', description: '', facilities: [],
      status: 'draft', theme: 'modern', blocks: [], seo: {}, aiContent: null,
      createdAt: '2026-08-10T09:00:00.000Z', updatedAt: '2026-08-10T09:00:00.000Z', publishedAt: null,
    };
    dbMock.agentProfile.get.mockResolvedValue(AGENT);
    dbMock.projects.list.mockResolvedValue([project]);
    dbMock.houseTypes.listByProject.mockResolvedValue([]);
    dbMock.leads.listByUser.mockResolvedValue([]);
    dbMock.events.totalsByUser.mockResolvedValue({ visitor: 0, whatsapp_click: 0, form_submit: 0 });

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText('Cluster Kosong')).toBeInTheDocument();
    expect(screen.getByText('0 tipe unit · Bandung')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
