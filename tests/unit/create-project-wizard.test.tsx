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
// toast di-mock supaya kegagalan generik (tanpa field terkait) bisa diverifikasi
// benar-benar memberi tahu pengguna, bukan cuma diam-diam ditelan.
const toastMock = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock('@/components/ui', () => ({ toast: toastMock }));

import { db } from '@/lib/data';
import { CreateProjectWizard } from '@/components/wizard/CreateProjectWizard';

const DATA_DIR_ABS = path.resolve(process.cwd(), dataDirRel);

afterAll(() => {
  rmSync(DATA_DIR_ABS, { recursive: true, force: true });
});

afterEach(() => {
  pushMock.mockClear();
  toastMock.error.mockClear();
  toastMock.success.mockClear();
  session.userId = 'usr_wizard';
});

describe('CreateProjectWizard — simpan otomatis per langkah', () => {
  it('membuat TEPAT SATU project setelah dua langkah "Lanjut", bukan satu per langkah dan bukan nol sampai akhir', async () => {
    const user = userEvent.setup();
    render(<CreateProjectWizard />);

    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Uji Wizard');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));

    // Step 2 baru muncul setelah createProjectAction sukses — kalau simpan
    // langkah 1 gagal diam-diam, findByText ini yang akan timeout duluan.
    await screen.findByText('Materi landing page');

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
    await screen.findByText('Materi landing page');
    first.unmount();

    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Duplikat');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Materi landing page');

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
    expect(screen.queryByText('Materi landing page')).not.toBeInTheDocument();
    expect(await db.projects.list('usr_wizard')).toHaveLength(before);
  });

  it('kegagalan generik (tanpa field terkait) di step 2 tidak melempar pengguna balik ke step 1', async () => {
    const user = userEvent.setup();
    render(<CreateProjectWizard />);

    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Sesi Blip');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Materi landing page');

    // Simulasikan sesi yang tidak lagi memiliki project ini (mis. sesi berganti
    // di tab lain) — projectId di state komponen masih sama, tapi
    // updateProjectAction sekarang menolaknya lewat requireOwnedProject.
    session.userId = 'usr_intruder';
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));

    // Toast generik muncul...
    await vi.waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('Project tidak ditemukan.'));
    // ...dan pengguna TETAP di step 2 — bukan dilempar ke step 1. Kegagalan ini
    // sama sekali tidak terkait field "Nama project", jadi tidak ada alasan
    // untuk membuang progres tampilan yang sudah dicapai.
    expect(screen.getByText('Materi landing page')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Nama project/)).not.toBeInTheDocument();
  });
});

describe('CreateProjectWizard — step 1 basic info', () => {
  it('menyimpan tipe project yang dipilih', async () => {
    const user = userEvent.setup();
    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Tipe');
    await user.click(screen.getByRole('button', { name: 'Kavling' }));
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Materi landing page');

    const projects = await db.projects.list('usr_wizard');
    expect(projects.find((p) => p.name === 'Cluster Tipe')?.projectType).toBe('kavling');
  });

  it('memilih lokasi dari combobox menurunkan project.location', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ results: [{ district: 'Kelapa Dua', city: 'Kabupaten Tangerang', province: 'Banten' }] }),
      { status: 200 },
    )));
    const user = userEvent.setup();
    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Lokasi');
    await user.type(screen.getByRole('combobox', { name: /Cari kota atau kecamatan/i }), 'kelapa');
    await user.click(await screen.findByText('Kelapa Dua'));
    await user.type(screen.getByLabelText(/Nama kawasan/), 'Gading Serpong');
    await user.click(screen.getByRole('button', { name: 'Lanjut' }));
    await screen.findByText('Materi landing page');

    const projects = await db.projects.list('usr_wizard');
    const saved = projects.find((p) => p.name === 'Cluster Lokasi');
    expect(saved?.location).toBe('Gading Serpong, Kelapa Dua, Kabupaten Tangerang');
    expect(saved?.brief.location?.province).toBe('Banten');
    vi.unstubAllGlobals();
  });

  it('mengganti tipe project MEMINTA KONFIRMASI sebelum menyusun ulang section', async () => {
    const user = userEvent.setup();
    render(<CreateProjectWizard />);
    await user.type(screen.getByLabelText(/Nama project/), 'Cluster Konfirmasi');
    await user.click(screen.getByRole('button', { name: 'Perumahan' }));
    await user.click(screen.getByRole('button', { name: 'Kavling' }));

    expect(screen.getByText('Sesuaikan section untuk tipe project ini?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pertahankan pilihan saya' }));
    expect(screen.queryByText('Sesuaikan section untuk tipe project ini?')).not.toBeInTheDocument();
  });
});
