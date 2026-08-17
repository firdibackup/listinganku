export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash__metric">
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
    </div>
  );
}
