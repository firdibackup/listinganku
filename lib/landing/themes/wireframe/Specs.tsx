import { formatArea, formatRupiahShort } from '@/lib/format';
import type { ResolvedBlock } from '../../resolve';

export function Specs({ block }: { block: Extract<ResolvedBlock, { type: 'specs' }> }) {
  if (block.houseTypes.length === 0) return null;
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Spesifikasi per tipe</h2>
        <table className="lp__specs" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Tipe</th><th>Harga</th><th>Luas tanah</th><th>Luas bangunan</th>
              <th>Kamar tidur</th><th>Kamar mandi</th><th>Carport</th>
            </tr>
          </thead>
          <tbody>
            {block.houseTypes.map((h) => (
              <tr key={h.id}>
                <td style={{ fontWeight: 600 }}>{h.name}</td>
                <td>{formatRupiahShort(h.price)}</td>
                <td>{formatArea(h.landArea)}</td>
                <td>{formatArea(h.buildingArea)}</td>
                <td>{h.bedrooms}</td><td>{h.bathrooms}</td><td>{h.carport}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
