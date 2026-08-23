import type { Media } from '@/lib/data/types';

/**
 * Primitif media bersama untuk kesepuluh tema.
 *
 * Kelasnya sengaja netral (`lp-ph`, `lp-img`) dan setiap tema yang menentukan
 * rupanya lewat `.lp[data-lp-theme='...'] .lp-ph`. Kesepuluh file desain
 * menggambar slot foto sebagai kotak berlabel dengan tekstur khasnya sendiri —
 * garis miring di Premium Gelap, grid teknis di Arsitektural, blok pastel di
 * Playful — jadi teksturnya milik tema, sementara bentuk komponennya sama.
 */
export function Ph({ label }: { label: string }) {
  return (
    <div className="lp-ph" role="img" aria-label={label}>
      <span className="lp-ph__label">{label}</span>
    </div>
  );
}

/** Foto yang mengisi induknya, atau placeholder ber-label saat media null. */
export function Img({ media, alt }: { media: Media | null; alt: string }) {
  if (!media) return <Ph label={alt} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.url} alt={alt} className="lp-img" />;
}

/** Inisial untuk avatar (agen / testimoni) tanpa membebani dengan foto. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}
