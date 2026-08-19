import Link from 'next/link';

export const SETTINGS_TABS = [
  { id: 'tampilan', label: 'Tampilan' },
  { id: 'profil', label: 'Profil' },
  { id: 'umum', label: 'Umum' },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]['id'];

export function isSettingsTab(value: string | undefined): value is SettingsTab {
  return SETTINGS_TABS.some((t) => t.id === value);
}

/**
 * Tab sebagai navigasi URL, bukan panel klien: tiap tab adalah form berbeda,
 * halaman tetap Server Component, dan tab yang dibuka bisa dibagikan lewat tautan.
 *
 * aria-current menandai tab aktif — pembeda warna saja tidak terbaca pembaca layar.
 */
export function SettingsTabs({ active }: { active: SettingsTab }) {
  return (
    <nav className="set__tabs">
      {SETTINGS_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/settings?tab=${tab.id}`}
          className="set__tab"
          aria-current={tab.id === active ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
