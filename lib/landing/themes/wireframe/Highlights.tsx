import type { ResolvedBlock } from '../../resolve';

export function Highlights({ block }: { block: Extract<ResolvedBlock, { type: 'highlights' }> }) {
  if (block.items.length === 0) return null;
  return (
    <section className="lp__section">
      <div className="lp__inner">
        <h2 className="lw-h2">Highlights</h2>
        <ul className="lp__grid lp__grid--2" style={{ marginTop: 16, listStyle: 'none', padding: 0 }}>
          {block.items.map((item, i) => (
            <li key={i} className="lw-body">{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
