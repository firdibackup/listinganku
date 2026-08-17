export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="wz__bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`wz__seg${i < current ? ' wz__seg--done' : ''}`} />
      ))}
    </div>
  );
}
