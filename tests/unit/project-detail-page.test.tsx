import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { HouseType, Media, Project } from '@/lib/data/types';

const { dbMock, session, notFoundMock } = vi.hoisted(() => ({
  dbMock: {
    projects: { get: vi.fn() },
    houseTypes: { listByProject: vi.fn() },
    media: { listByProject: vi.fn() },
  },
  session: { userId: 'usr_audi' },
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/data', () => ({ db: dbMock }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => session.userId }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock, useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import ProjectPage from '@/app/(dashboard)/projects/[id]/page';

const PROJECT: Project = {
  id: 'prj_1', userId: 'usr_audi', name: 'Parkspring Gading', slug: 'parkspring-gading',
  location: 'Gading Serpong', developer: 'Paramount Land', description: 'Cluster baru dengan tiga tipe unit.',
  facilities: [], status: 'published', theme: 'modern', blocks: [], seo: {}, aiContent: null,
  createdAt: '2026-08-10T09:00:00.000Z', updatedAt: '2026-08-10T09:00:00.000Z', publishedAt: '2026-08-10T09:00:00.000Z',
};

function houseType(id: string, name: string, price: number, sortOrder: number): HouseType {
  return {
    id, projectId: 'prj_1', name, slug: name.toLowerCase(), price, landArea: 90, buildingArea: 120,
    bedrooms: 3, bathrooms: 2, carport: 1, status: 'published', aiContent: null, sortOrder,
    createdAt: '2026-08-10T09:00:00.000Z', updatedAt: '2026-08-10T09:00:00.000Z',
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = 'usr_audi';
});

describe('ProjectPage — kontrol akses', () => {
  it('memanggil notFound() saat project tidak pernah ada, tanpa merender apa pun', async () => {
    dbMock.projects.get.mockResolvedValue(null);

    await expect(ProjectPage({ params: Promise.resolve({ id: 'prj_hantu' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalled();
    expect(dbMock.houseTypes.listByProject).not.toHaveBeenCalled();
  });

  it('memanggil notFound() saat project ada tapi milik user lain, tanpa membocorkan datanya', async () => {
    dbMock.projects.get.mockResolvedValue({ ...PROJECT, userId: 'usr_bob' });

    await expect(ProjectPage({ params: Promise.resolve({ id: 'prj_1' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalled();
    // Tidak pernah lanjut mengambil house types/media project orang lain.
    expect(dbMock.houseTypes.listByProject).not.toHaveBeenCalled();
  });
});

describe('ProjectPage — rendering', () => {
  it('project tanpa tipe rumah: tombol tambah tetap ada, banner Generate AI tidak muncul', async () => {
    dbMock.projects.get.mockResolvedValue(PROJECT);
    dbMock.houseTypes.listByProject.mockResolvedValue([]);
    dbMock.media.listByProject.mockResolvedValue([]);

    const jsx = await ProjectPage({ params: Promise.resolve({ id: 'prj_1' }) });
    render(jsx);

    expect(screen.getByRole('heading', { name: 'Parkspring Gading' })).toBeInTheDocument();
    expect(screen.getByText(/0 tipe unit/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add house type/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Generate AI/ })).not.toBeInTheDocument();
  });

  it('project dengan banyak tipe rumah: semua kartu tampil dan banner Generate AI muncul', async () => {
    const houseTypes: HouseType[] = [
      houseType('hts_villa', 'Villa', 2_450_000_000, 0),
      houseType('hts_midea', 'Midea', 3_100_000_000, 1),
      houseType('hts_grand', 'Grand', 4_600_000_000, 2),
    ];
    dbMock.projects.get.mockResolvedValue(PROJECT);
    dbMock.houseTypes.listByProject.mockResolvedValue(houseTypes);
    dbMock.media.listByProject.mockResolvedValue([] as Media[]);

    const jsx = await ProjectPage({ params: Promise.resolve({ id: 'prj_1' }) });
    render(jsx);

    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByText('Midea')).toBeInTheDocument();
    expect(screen.getByText('Grand')).toBeInTheDocument();
    expect(screen.getByText('Rp 2,45 M')).toBeInTheDocument();
    expect(screen.getByText(/3 tipe unit/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Generate AI/ })).toBeInTheDocument();
  });
});
