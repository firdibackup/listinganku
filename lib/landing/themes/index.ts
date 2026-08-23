import type { ComponentType } from 'react';
import type { ResolvedBlock, ResolvedHouseType } from '../resolve';
import type { AgentProfile, PaletteName, Project, ThemeName } from '@/lib/data/types';
import { THEME_NAMES, THEME_LABELS, THEME_DEFAULT_PALETTE } from '../themeNames';
import { THEME_FONTS } from '../fonts';
import { tropicalWarmComponents, tropicalWarmChrome } from './tropicalWarm';
import { premiumDarkComponents, premiumDarkChrome } from './premiumDark';
import { editorialWhiteComponents, editorialWhiteChrome } from './editorialWhite';
import { corporateBlueComponents, corporateBlueChrome } from './corporateBlue';
import { softLuxuryComponents, softLuxuryChrome } from './softLuxury';
import { boldRetailComponents, boldRetailChrome } from './boldRetail';
import { architecturalComponents, architecturalChrome } from './architectural';
import { natureCalmComponents, natureCalmChrome } from './natureCalm';
import { classicNavyComponents, classicNavyChrome } from './classicNavy';
import { playfulPastelComponents, playfulPastelChrome } from './playfulPastel';

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

type ThemeImpl = { components: BlockComponents; Chrome: Theme['Chrome'] };

/**
 * Satu set komponen PER TEMA — bukan satu set bersama yang diwarnai ulang.
 *
 * Sampai 2026-08-19 sembilan tema memakai DOM tropicalWarm dengan CSS berbeda,
 * dan hasilnya tidak pernah menyerupai file desainnya masing-masing: urutan
 * section, cara tipe unit ditampilkan, dan komposisi hero memang berbeda
 * STRUKTUR, bukan cuma berbeda warna. Kesepuluhnya kini ditranskrip satu per
 * satu dari `design/project/NN *.dc.html`.
 *
 * Record ini SENGAJA tidak Partial: menambah nama di ThemeName tanpa menulis
 * komponennya harus gagal saat kompilasi, bukan diam-diam jatuh ke tema lain.
 */
const THEME_IMPL: Record<ThemeName, ThemeImpl> = {
  tropicalWarm: { components: tropicalWarmComponents, Chrome: tropicalWarmChrome },
  premiumDark: { components: premiumDarkComponents, Chrome: premiumDarkChrome },
  editorialWhite: { components: editorialWhiteComponents, Chrome: editorialWhiteChrome },
  corporateBlue: { components: corporateBlueComponents, Chrome: corporateBlueChrome },
  softLuxury: { components: softLuxuryComponents, Chrome: softLuxuryChrome },
  boldRetail: { components: boldRetailComponents, Chrome: boldRetailChrome },
  architectural: { components: architecturalComponents, Chrome: architecturalChrome },
  natureCalm: { components: natureCalmComponents, Chrome: natureCalmChrome },
  classicNavy: { components: classicNavyComponents, Chrome: classicNavyChrome },
  playfulPastel: { components: playfulPastelComponents, Chrome: playfulPastelChrome },
};

export const THEMES: Record<ThemeName, Theme> = Object.fromEntries(
  THEME_NAMES.map((name) => [
    name,
    {
      label: THEME_LABELS[name],
      fonts: (THEME_FONTS as Record<string, ThemeFonts>)[name] ?? THEME_FONTS.tropicalWarm,
      defaultPalette: THEME_DEFAULT_PALETTE[name],
      ...THEME_IMPL[name],
    } satisfies Theme,
  ]),
) as Record<ThemeName, Theme>;

/** Tema yang bisa dipilih agen di editor. */
export const AVAILABLE_THEMES: ThemeName[] = [
  'tropicalWarm', 'premiumDark', 'editorialWhite', 'softLuxury', 'boldRetail',
  'corporateBlue', 'architectural', 'natureCalm', 'classicNavy', 'playfulPastel',
];
