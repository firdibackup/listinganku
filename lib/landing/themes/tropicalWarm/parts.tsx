import type { Media } from '@/lib/data/types';

/** Placeholder proporsional saat sebuah slot media belum punya foto. Mengisi induknya. */
export function Ph({ label }: { label: string }) {
  return (
    <div className="lp-tw-ph" role="img" aria-label={label}>
      {label}
    </div>
  );
}

/** Foto yang mengisi induknya, atau placeholder ber-label saat media null. */
export function Img({ media, alt }: { media: Media | null; alt: string }) {
  if (!media) return <Ph label={alt} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.url} alt={alt} className="lp-tw-img" />;
}

/** Inisial untuk avatar (agen / testimoni) tanpa membebani dengan foto. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}
