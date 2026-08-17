import { Card } from '@/components/ds';

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="dash__metric">
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
    </Card>
  );
}
