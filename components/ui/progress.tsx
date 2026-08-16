export function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="ui-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div className="ui-progress__bar" style={{ width: `${clamped}%` }} />
    </div>
  );
}
