import { Card } from '@/components/ds';

/**
 * `delta` opsional supaya pemakaian lama di /dashboard (tiga kartu tanpa
 * sub-baris) tidak berubah, sementara halaman Leads bisa menampilkan
 * baris tren "+128 / 7 HARI" seperti di file design.
 */
export function MetricCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <Card className="dash__metric">
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
        {delta ? <dd className="dash__metric-delta">{delta}</dd> : null}
      </dl>
    </Card>
  );
}
