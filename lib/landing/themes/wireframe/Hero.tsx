import type { ResolvedBlock } from '../../resolve';

export function PlaceholderBox({ label, height }: { label: string; height: number }) {
  return (
    <div className="lp__ph" style={{ height }} role="img" aria-label={label}>
      {label}
    </div>
  );
}

export function Hero({ block }: { block: Extract<ResolvedBlock, { type: 'hero' }> }) {
  return (
    <section className="lp__hero">
      <div className="lp__inner">
        {block.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.image.url} alt={block.title}
            style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 'var(--radius-xl)' }}
          />
        ) : (
          <PlaceholderBox label="Hero · foto utama" height={320} />
        )}
        <h1 className="lw-h1" style={{ marginTop: 24 }}>{block.title}</h1>
        <p className="lw-body-lg" style={{ marginTop: 8, color: 'var(--sage)' }}>{block.subtitle}</p>
      </div>
    </section>
  );
}
