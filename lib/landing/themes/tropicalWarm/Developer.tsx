import type { ResolvedBlock } from '../../resolve';

export function Developer({ block }: { block: Extract<ResolvedBlock, { type: 'developer' }> }) {
  if (!block.name && !block.about && block.stats.length === 0) return null;
  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Developer</p>
        {block.name ? <h2 className="lp-tw-h2">{block.name}</h2> : null}
        {block.about ? <p className="lp-tw-lead">{block.about}</p> : null}

        {block.stats.length ? (
          <div className="lp-tw-dev__stats">
            {block.stats.map((s) => (
              <div key={s.label} className="lp-tw-dev__stat">
                <div className="lp-tw-dev__val">{s.value}</div>
                <div className="lp-tw-dev__lbl">{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
