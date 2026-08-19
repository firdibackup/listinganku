import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { EventRow, HouseType, Lead, Project } from '@/lib/data/types';

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    projects: { list: vi.fn() },
    houseTypes: { listByProject: vi.fn() },
    leads: { listByUser: vi.fn() },
    events: { listByUser: vi.fn() },
  },
}));

vi.mock('@/lib/data', () => ({ db: dbMock }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => 'usr_audi' }));

import LeadsPage from '@/app/(dashboard)/leads/page';

const PROJECT: Project = {
  id: 'prj_park', userId: 'usr_audi', name: 'Parkspring Gading', slug: 'parkspring-gading',
  location: 'Gading Serpong', developer: 'Paramount', description: '', facilities: [],
  status: 'published', theme: 'modern', blocks: [], seo: {}, aiContent: null,
  createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z', publishedAt: null,
};

const VILLA = { id: 'ht_villa', projectId: 'prj_park', name: 'Villa' } as HouseType;

function lead(over: Partial<Lead>): Lead {
  return {
    id: 'lead_1', projectId: 'prj_park', houseTypeId: 'ht_villa', name: 'Rina Wijaya',
    phone: '081322449087', email: null, message: 'Tipe Midea masih ada unit hadap timur?',
    source: 'form', status: 'new', createdAt: '2026-08-10T09:12:00.000Z', ...over,
  };
}

const EVENTS: EventRow[] = [
  { id: 'e1', projectId: 'prj_park', houseTypeId: null, type: 'visitor', date: '2026-08-18', count: 1842 },
  { id: 'e2', projectId: 'prj_park', houseTypeId: null, type: 'whatsapp_click', date: '2026-08-18', count: 96 },
  { id: 'e3', projectId: 'prj_park', houseTypeId: null, type: 'form_submit', date: '2026-08-18', count: 27 },
];

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.projects.list.mockResolvedValue([PROJECT]);
  dbMock.houseTypes.listByProject.mockResolvedValue([VILLA]);
  dbMock.events.listByUser.mockResolvedValue(EVENTS);
  dbMock.leads.listByUser.mockResolvedValue([]);
});

async function renderPage(search: Record<string, string> = {}) {
  render(await LeadsPage({ searchParams: Promise.resolve(search) }));
}

describe('LeadsPage — kartu metrik', () => {
  it('menampilkan keempat metrik dari event, bukan dari jumlah baris lead', async () => {
    dbMock.leads.listByUser.mockResolvedValue([lead({})]);
    await renderPage();

    expect(screen.getByText('1.842')).toBeInTheDocument();
    expect(screen.getByText('96')).toBeInTheDocument();
    expect(screen.getByText('27')).toBeInTheDocument();
  });

  it('menampilkan em dash, bukan NaN, saat belum ada visitor sama sekali', async () => {
    dbMock.events.listByUser.mockResolvedValue([]);
    dbMock.leads.listByUser.mockResolvedValue([lead({})]);
    await renderPage();

    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Infinity/)).not.toBeInTheDocument();
  });
});

describe('LeadsPage — tabel', () => {
  it('merender tiap lead sebagai baris tabel sungguhan dengan nama, telepon, dan status', async () => {
    dbMock.leads.listByUser.mockResolvedValue([
      lead({ id: 'l1', name: 'Rina Wijaya', status: 'new' }),
      lead({ id: 'l2', name: 'Hendra S.', status: 'contacted', source: 'whatsapp', houseTypeId: null }),
    ]);
    await renderPage();

    const rows = screen.getAllByRole('row');
    // 1 baris header + 2 baris data. Header wajib ada supaya tabel punya semantik kolom.
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByText('Rina Wijaya')).toBeInTheDocument();
    expect(within(rows[1]).getByText('0813-2244-9087')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Villa')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Hendra S.')).toBeInTheDocument();
    // Lead tanpa tipe rumah tetap harus punya sel, bukan kolom yang bergeser.
    expect(within(rows[2]).getByText('—')).toBeInTheDocument();
  });

  it('menampilkan empty state alih-alih tabel kosong', async () => {
    dbMock.leads.listByUser.mockResolvedValue([]);
    await renderPage();

    expect(screen.getByText('Belum ada lead')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('LeadsPage — filter lewat URL', () => {
  it('menyaring menurut status dari query string', async () => {
    dbMock.leads.listByUser.mockResolvedValue([
      lead({ id: 'l1', name: 'Rina Wijaya', status: 'new' }),
      lead({ id: 'l2', name: 'Hendra S.', status: 'contacted' }),
    ]);
    await renderPage({ status: 'contacted' });

    expect(screen.getByText('Hendra S.')).toBeInTheDocument();
    expect(screen.queryByText('Rina Wijaya')).not.toBeInTheDocument();
  });

  it('menyaring menurut project dari query string', async () => {
    dbMock.leads.listByUser.mockResolvedValue([
      lead({ id: 'l1', name: 'Rina Wijaya', projectId: 'prj_park' }),
      lead({ id: 'l2', name: 'Hendra S.', projectId: 'prj_lain' }),
    ]);
    await renderPage({ project: 'prj_lain' });

    expect(screen.getByText('Hendra S.')).toBeInTheDocument();
    expect(screen.queryByText('Rina Wijaya')).not.toBeInTheDocument();
  });

  it('mengabaikan nilai status yang tidak dikenal daripada menampilkan tabel kosong', async () => {
    dbMock.leads.listByUser.mockResolvedValue([lead({ name: 'Rina Wijaya' })]);
    await renderPage({ status: 'bukan-status' });

    expect(screen.getByText('Rina Wijaya')).toBeInTheDocument();
  });
});
