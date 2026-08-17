import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi — sama seperti
// tests/unit/create-project-wizard.test.tsx.
const { dataDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-house-type-sheet-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

const session = vi.hoisted(() => ({ userId: 'usr_sheet' }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => session.userId }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
const routerMock = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => routerMock }));
const toastMock = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui')>('@/components/ui');
  return { ...actual, toast: toastMock };
});

import { db } from '@/lib/data';
import { HouseTypeSheet } from '@/components/project/HouseTypeSheet';
import { ProjectDetail } from '@/components/project/ProjectHeader';
import type { HouseType, Project } from '@/lib/data/types';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
});

afterEach(() => {
  routerMock.push.mockClear();
  routerMock.refresh.mockClear();
  toastMock.error.mockClear();
  toastMock.success.mockClear();
  session.userId = 'usr_sheet';
});

async function makeProject(name = 'Project Uji Sheet') {
  return db.projects.create({
    userId: 'usr_sheet', name, location: '', developer: '', description: '', facilities: [],
  });
}

describe('HouseTypeSheet — validasi', () => {
  it('menolak harga nol dengan pesan Bahasa Indonesia inline, tanpa membuat baris', async () => {
    const project = await makeProject();
    const user = userEvent.setup();
    render(
      <HouseTypeSheet projectId={project.id} houseType={null} media={[]} open onOpenChange={() => {}} />,
    );

    await user.type(screen.getByLabelText(/Nama tipe/), 'Tipe Nol');
    await user.type(screen.getByLabelText(/Harga/), '0');
    await user.type(screen.getByLabelText(/Luas tanah/), '90');
    await user.type(screen.getByLabelText(/Luas bangunan/), '120');
    await user.click(screen.getByRole('button', { name: 'Simpan tipe' }));

    await screen.findByText('Harga harus lebih dari nol.');
    expect(await db.houseTypes.listByProject(project.id)).toHaveLength(0);
  });

  it('input valid membuat baris, memanggil toast.success dan menutup sheet', async () => {
    const project = await makeProject();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <HouseTypeSheet projectId={project.id} houseType={null} media={[]} open onOpenChange={onOpenChange} />,
    );

    await user.type(screen.getByLabelText(/Nama tipe/), 'Villa');
    await user.type(screen.getByLabelText(/Harga/), '2450000000');
    await user.type(screen.getByLabelText(/Luas tanah/), '90');
    await user.type(screen.getByLabelText(/Luas bangunan/), '120');
    await user.click(screen.getByRole('button', { name: 'Simpan tipe' }));

    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(toastMock.success).toHaveBeenCalledWith('Tipe rumah ditambahkan');
    const rows = await db.houseTypes.listByProject(project.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Villa');
  });
});

describe('HouseTypeSheet — hapus', () => {
  it('menghapus tipe rumah, memanggil toast.success dan menutup sheet', async () => {
    const project = await makeProject();
    const created = await db.houseTypes.create({
      projectId: project.id, name: 'Villa', price: 1, landArea: 1, buildingArea: 1,
      bedrooms: 1, bathrooms: 1, carport: 1,
    });
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <HouseTypeSheet projectId={project.id} houseType={created} media={[]} open onOpenChange={onOpenChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Hapus tipe' }));

    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(toastMock.success).toHaveBeenCalledWith('Tipe rumah dihapus');
    expect(await db.houseTypes.get(created.id)).toBeNull();
  });
});

describe('ProjectDetail — sheet tidak membawa data tipe rumah sebelumnya', () => {
  it('membuka tipe rumah lain menampilkan data tipe itu, bukan data tipe sebelumnya (bug remount)', async () => {
    const project: Project = await makeProject('Project Dua Tipe');
    const villa: HouseType = await db.houseTypes.create({
      projectId: project.id, name: 'Villa', price: 2_450_000_000, landArea: 90, buildingArea: 120,
      bedrooms: 3, bathrooms: 2, carport: 1,
    });
    const grand: HouseType = await db.houseTypes.create({
      projectId: project.id, name: 'Grand', price: 4_600_000_000, landArea: 150, buildingArea: 210,
      bedrooms: 4, bathrooms: 3, carport: 2,
    });

    const user = userEvent.setup();
    render(<ProjectDetail project={project} houseTypes={[villa, grand]} media={[]} />);

    await user.click(screen.getByRole('button', { name: /Villa/ }));
    expect(screen.getByLabelText(/Nama tipe/)).toHaveValue('Villa');
    await user.click(screen.getByRole('button', { name: 'Batal' }));

    await user.click(screen.getByRole('button', { name: /Grand/ }));
    // Kalau HouseTypeSheet tidak remount saat berpindah tipe, input ini masih
    // akan menampilkan "Villa" (state form lama) alih-alih "Grand".
    expect(screen.getByLabelText(/Nama tipe/)).toHaveValue('Grand');
    expect(screen.getByLabelText(/Harga/)).toHaveValue('4600000000');
  });
});
