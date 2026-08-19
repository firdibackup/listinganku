import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { AgentProfile } from '@/lib/data/types';

const { dbMock } = vi.hoisted(() => ({
  dbMock: { agentProfile: { get: vi.fn() } },
}));

vi.mock('@/lib/data', () => ({ db: dbMock }));
vi.mock('@/lib/session', () => ({ requireSessionUserId: async () => 'usr_audi' }));
// GeneralForm memakai useRouter().refresh() untuk membaca ulang status live
// dari server setelah publish/unpublish.
vi.mock('next/navigation', () => ({
  redirect: vi.fn(), usePathname: () => '/settings', useRouter: () => ({ refresh: vi.fn() }),
}));

import SettingsPage from '@/app/(dashboard)/settings/page';

const AGENT: AgentProfile = {
  id: 'agp_audi', userId: 'usr_audi', fullName: 'Audi', email: 'audi@listingku.app',
  whatsapp: '6281288994410', siteName: 'Audi Property', subdomain: 'audi', theme: 'Modern',
  logoUrl: null, colorScheme: 'Oranye',
  about: 'Agen properti untuk kawasan Gading Serpong.',
  stats: { closings: 64, listings: 18, years: 7 }, specialistArea: 'Gading Serpong',
  services: [], isPublished: true, notifyOnLead: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.agentProfile.get.mockResolvedValue(AGENT);
});

async function renderPage(search: Record<string, string> = {}) {
  render(await SettingsPage({ searchParams: Promise.resolve(search) }));
}

describe('SettingsPage — tab', () => {
  it('menampilkan tab Tampilan sebagai default', async () => {
    await renderPage();
    expect(screen.getByText('Tema Situs Profil')).toBeInTheDocument();
    expect(screen.queryByLabelText('About Me')).not.toBeInTheDocument();
  });

  it('menampilkan tab Profil dari query string dengan nilai yang sudah tersimpan', async () => {
    await renderPage({ tab: 'profil' });
    expect(screen.getByLabelText('About Me')).toHaveValue('Agen properti untuk kawasan Gading Serpong.');
    expect(screen.getByLabelText('Total Closing')).toHaveValue(64);
    expect(screen.getByLabelText('Wilayah Spesialis')).toHaveValue('Gading Serpong');
    // Ditampilkan gaya nasional walau tersimpan kanonik 62.
    expect(screen.getByLabelText('Nomor WhatsApp')).toHaveValue('0812-8899-4410');
  });

  it('jatuh ke tab Tampilan saat nilai tab tidak dikenal', async () => {
    await renderPage({ tab: 'entah' });
    expect(screen.getByText('Tema Situs Profil')).toBeInTheDocument();
  });

  it('menandai tab aktif dengan aria-current supaya bukan cuma perbedaan warna', async () => {
    await renderPage({ tab: 'umum' });
    expect(screen.getByRole('link', { name: 'Umum' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Profil' })).not.toHaveAttribute('aria-current');
  });
});

describe('SettingsPage — tab Umum', () => {
  it('menampilkan email sebagai hanya-baca; email berasal dari autentikasi', async () => {
    await renderPage({ tab: 'umum' });
    const email = screen.getByLabelText('Email');
    expect(email).toHaveValue('audi@listingku.app');
    expect(email).toHaveAttribute('readonly');
  });

  it('menawarkan unpublish saat situs profil live', async () => {
    await renderPage({ tab: 'umum' });
    expect(screen.getByRole('button', { name: 'Unpublish situs profil' })).toBeInTheDocument();
  });

  it('menawarkan publikasikan — bukan jalan buntu — saat situs profil sudah tidak live', async () => {
    dbMock.agentProfile.get.mockResolvedValue({ ...AGENT, isPublished: false });
    await renderPage({ tab: 'umum' });
    expect(screen.getByRole('button', { name: 'Publikasikan situs profil' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unpublish situs profil' })).not.toBeInTheDocument();
  });
});

describe('SettingsPage — pratinjau', () => {
  it('menampilkan nama situs dan tema terpilih di panel pratinjau', async () => {
    await renderPage();
    expect(screen.getByText('PREVIEW · Modern')).toBeInTheDocument();
    expect(screen.getAllByText('Audi Property').length).toBeGreaterThan(0);
  });
});

describe('SettingsPage — store lama', () => {
  it('merender tanpa "undefined" saat snapshot lama belum punya field baru', async () => {
    // repairShape hanya memperbaiki tabel level atas, bukan field per baris:
    // .data/store.json yang ditulis sebelum sesi ini tidak punya specialistArea.
    const legacy = { ...AGENT } as Partial<AgentProfile>;
    delete legacy.specialistArea;
    delete legacy.notifyOnLead;
    dbMock.agentProfile.get.mockResolvedValue(legacy);

    await renderPage({ tab: 'profil' });

    expect(screen.getByLabelText('Wilayah Spesialis')).toHaveValue('');
    expect(document.body.textContent).not.toContain('undefined');
  });
});
