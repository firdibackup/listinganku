import type { ComponentType } from 'react';
import type { ResolvedBlock, ResolvedHouseType } from '../resolve';
import type { AgentProfile, PaletteName, Project, ThemeName } from '@/lib/data/types';
import { THEME_NAMES, THEME_LABELS, THEME_DEFAULT_PALETTE } from '../themeNames';
import { THEME_FONTS } from '../fonts';
import { tropicalWarmComponents, tropicalWarmChrome } from './tropicalWarm';
import { HouseTypesList } from './shared/HouseTypesList';

export type BlockComponents = {
  [K in ResolvedBlock['type']]: ComponentType<{ block: Extract<ResolvedBlock, { type: K }> }>;
};

/** Header dan Footer setiap tema menerima seluruh konteks project, bukan satu blok. */
export type ChromeProps = { project: Project; agent: AgentProfile; houseTypes: ResolvedHouseType[] };

export type ThemeFonts = { className: string; display: string; text: string };

export type Theme = {
  label: string;
  fonts: ThemeFonts;
  defaultPalette: PaletteName;
  components: BlockComponents;
  Chrome: { Header: ComponentType<ChromeProps>; Footer: ComponentType<ChromeProps> };
};

/**
 * Kesepuluh tema terdaftar, tapi baru `tropicalWarm` yang punya komponen sungguhan.
 * Sembilan sisanya (slice 2B–2J) memakai komponen + Chrome tropicalWarm sebagai
 * isian sementara — BUKAN null — supaya BlockRenderer tidak perlu cabang khusus
 * dan tidak ada halaman publik yang bisa kosong. AVAILABLE_THEMES yang menjaga
 * agar agen belum bisa memilih tema yang belum dibangun.
 */
/**
 * Sebagian tema mengganti presentasi blok tertentu (mis. tipe unit sebagai
 * daftar, bukan bertab). Hanya blok yang berbeda strukturnya di-override; sisanya
 * tetap memakai komponen bersama yang di-restyle lewat CSS per tema.
 */
const THEME_OVERRIDES: Partial<Record<ThemeName, Partial<BlockComponents>>> = {
  editorialWhite: { houseTypes: HouseTypesList },
  softLuxury: { houseTypes: HouseTypesList },
};

export const THEMES: Record<ThemeName, Theme> = Object.fromEntries(
  THEME_NAMES.map((name) => [
    name,
    {
      label: THEME_LABELS[name],
      fonts: (THEME_FONTS as Record<string, ThemeFonts>)[name] ?? THEME_FONTS.tropicalWarm,
      defaultPalette: THEME_DEFAULT_PALETTE[name],
      components: { ...tropicalWarmComponents, ...THEME_OVERRIDES[name] },
      Chrome: tropicalWarmChrome,
    } satisfies Theme,
  ]),
) as Record<ThemeName, Theme>;

/** Tema yang benar-benar sudah punya layout. Sisanya tampil disabled di editor. */
export const AVAILABLE_THEMES: ThemeName[] = [
  'tropicalWarm', 'premiumDark', 'editorialWhite', 'softLuxury', 'boldRetail',
  'corporateBlue', 'architectural', 'natureCalm', 'classicNavy', 'playfulPastel',
];
