import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// LISTINGKU_DATA_DIR harus di-set SEBELUM '@/lib/data' dievaluasi (singleton db
// dibuat sekali saat modul dimuat) — sama seperti tests/unit/media-actions.test.ts
// dan tests/unit/project-actions.test.ts.
const { dataDirRel } = vi.hoisted(() => {
  const suffix = `${process.pid}-${Date.now()}`;
  const dataDirRel = `.tmp-test-data-wizard-${suffix}`;
  process.env.LISTINGKU_DATA_DIR = dataDirRel;
  return { dataDirRel };
});

const session = vi.hoisted(() => ({ userId: 'usr_wizard' }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => session.userId }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
const pushMock = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

import { db } from '@/lib/data';
import { CreateProjectWizard } from '@/components/wizard/CreateProjectWizard';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
});

afterEach(() => {
  pushMock.mockClear();
});

describe('CreateProjectWizard — simpan otomatis per langkah', () => {
  it('membuat TEPAT SATU project setelah dua langkah "Lanjut", bukan satu per langkah dan bukan nol sampai akhir', async () => {
    const user = userEvent.setup();
    render(<CreateProjectWizard />);

    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Uji Wizard');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));

    // Step 2 baru muncul setelah createProjectAction sukses — kalau simpan
    // langkah 1 gagal diam-diam, findByText ini yang akan timeout duluan.
    await screen.findByText('Fasilitas dan media');

    const afterStep1 = await db.projects.list('usr_wizard');
    expect(afterStep1).toHaveLength(1);
    const created = afterStep1[0];
    expect(created.name).toBe('Cluster Uji Wizard');

    await user.click(screen.getByRole('button', { name: 'Kolam renang' }));
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));

    await screen.findByText('Review');

    const afterStep2 = await db.projects.list('usr_wizard');
    // Masih satu baris: langkah 2 meng-UPDATE baris yang sama (bug klasiknya
    // adalah membuat baris kedua di sini), dan baris itu sudah membawa
    // perubahan dari langkah 2 (bug klasik satunya adalah baru menyimpan di
    // langkah terakhir, sehingga fasilitas belum ke database sama sekali).
    expect(afterStep2).toHaveLength(1);
    expect(afterStep2[0].id).toBe(created.id);
    expect(afterStep2[0].facilities).toEqual(['Kolam renang']);
  });

  it('mengetik nama project yang sama di dua sesi wizard terpisah tidak menghasilkan error', async () => {
    const user = userEvent.setup();
    const first = render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Duplikat');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Fasilitas dan media');
    first.unmount();

    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Duplikat');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Fasilitas dan media');

    const rows = (await db.projects.list('usr_wizard')).filter((p) => p.name === 'Cluster Duplikat');
    expect(rows).toHaveLength(2);
    expect(rows[0].slug).not.toBe(rows[1].slug);
  });

  it('klik "Lanjut" dengan nama kosong tidak membuat project dan menampilkan error inline, bukan pindah langkah', async () => {
    const user = userEvent.setup();
    const before = (await db.projects.list('usr_wizard')).length;
    render(<CreateProjectWizard />);

    await user.click(screen.getByRole('button', { name: 'Lanjut' }));

    await screen.findByText('Wajib diisi.');
    expect(screen.queryByText('Fasilitas dan media')).not.toBeInTheDocument();
    expect(await db.projects.list('usr_wizard')).toHaveLength(before);
  });
});
