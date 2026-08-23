import Link from 'next/link';
import type { Metadata } from 'next';
import { THEME_NAMES, THEME_LABELS } from '@/lib/landing/themeNames';

export const metadata: Metadata = {
  title: 'Sepuluh tema landing — Listingku',
  robots: { index: false, follow: false },
};

/**
 * Papan banding. Tiap bingkai memuat `/preview/{tema}` yang sungguhan, bukan
 * tangkapan layar — jadi apa yang dinilai di sini persis apa yang di-render.
 * Urutan THEME_NAMES sama dengan penomoran file desain 01–10.
 */
export default function ThemeGalleryPage() {
  return (
    <main className="pv">
      <header className="pv__head">
        <p className="pv__eyebrow">Parkspring · Kelapa Gading</p>
        <h1 className="pv__title">Sepuluh tema landing</h1>
        <p className="pv__sub">
          Konten identik di kesepuluhnya — harga, tipe unit, fasilitas, dan FAQ yang sama persis.
          Yang berbeda hanya tampilan dan urutan section. Setiap bingkai adalah halaman sungguhan selebar 390 px.
        </p>
      </header>

      <div className="pv__grid">
        {THEME_NAMES.map((name, i) => (
          <section key={name} className="pv__card">
            <div className="pv__meta">
              <span className="pv__no">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="pv__name">{THEME_LABELS[name]}</h2>
              <Link href={`/preview/${name}`} className="pv__open">Buka penuh</Link>
            </div>
            <div className="pv__frame">
              <iframe
                src={`/preview/${name}`}
                title={`Pratinjau tema ${THEME_LABELS[name]}`}
                loading="lazy"
                width={390}
                height={844}
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
