import type { ComponentType } from 'react';
import type { ResolvedBlock } from './resolve';
import type { ThemeName } from '@/lib/data/types';
import { THEMES } from './themes';

/**
 * Satu-satunya tempat yang menerjemahkan ResolvedBlock[] menjadi markup nyata.
 * Landing publik (SSR) dan pratinjau editor memanggil komponen yang sama persis,
 * jadi pratinjau tidak bisa berbeda dari yang dilihat pengunjung.
 *
 * Blok bertipe tidak dikenal (mis. data lama dari versi skema berikutnya) dilewati
 * diam-diam, bukan meledakkan seluruh halaman publik karena satu blok asing.
 */
export function BlockRenderer({ blocks, theme }: { blocks: ResolvedBlock[]; theme: ThemeName }) {
  const set = (THEMES[theme] ?? THEMES.tropicalWarm).components;
  return (
    <>
      {blocks.map((block) => {
        const Component = (set as Record<string, ComponentType<{ block: ResolvedBlock }> | undefined>)[block.type];
        if (!Component) return null;
        return <Component key={block.id} block={block} />;
      })}
    </>
  );
}
