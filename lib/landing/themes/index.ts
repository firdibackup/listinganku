import type { ComponentType } from 'react';
import type { ResolvedBlock } from '../resolve';
import type { ThemeName } from '@/lib/data/types';
import { wireframe } from './wireframe';

export type BlockComponents = {
  [K in ResolvedBlock['type']]: ComponentType<{ block: Extract<ResolvedBlock, { type: K }> }>;
};

/**
 * Ketiga nama tema disimpan di data, tapi selama slice 1 semuanya dipetakan ke
 * satu set komponen wireframe. Saat desain tema asli datang, hanya isi peta ini
 * yang berubah — kolom projects.theme tidak perlu dimigrasi, dan konten JSON blok
 * tidak perlu berubah bentuk.
 */
export const THEMES: Record<ThemeName, BlockComponents> = {
  modern: wireframe,
  showcase: wireframe,
  luxury: wireframe,
};

/** Tema yang benar-benar sudah punya desain. Sisanya tampil disabled di editor. */
export const AVAILABLE_THEMES: ThemeName[] = ['modern'];
