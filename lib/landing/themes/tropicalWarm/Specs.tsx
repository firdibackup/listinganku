import type { ResolvedBlock } from '../../resolve';
import { formatArea, formatRupiahShort } from '@/lib/format';

/** Tabel perbandingan semua tipe. Mati by default (spesifikasi sudah di kartu tipe unit). */
export function Specs({ block }: { block: Extract<ResolvedBlock, { type: 'specs' }> }) {
  if (block.houseTypes.length === 0) return null;
  const rows: { label: string; get: (h: (typeof block.houseTypes)[number]) => string }[] = [
    { label: 'Harga', get: (h) => formatRupiahShort(h.price) },
    { label: 'Luas tanah', get: (h) => formatArea(h.landArea) },
    { label: 'Luas bangunan', get: (h) => formatArea(h.buildingArea) },
    { label: 'Kamar tidur', get: (h) => String(h.bedrooms) },
    { label: 'Kamar mandi', get: (h) => String(h.bathrooms) },
    { label: 'Carport', get: (h) => String(h.carport) },
  ];

  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Spesifikasi</p>
        <h2 className="lp-tw-h2">Perbandingan tipe</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="lp-tw-table">
            <thead>
              <tr>
                <th scope="col">Spesifikasi</th>
                {block.houseTypes.map((h) => (
                  <th key={h.id} scope="col">{h.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {block.houseTypes.map((h) => (
                    <td key={h.id}>{row.get(h)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
