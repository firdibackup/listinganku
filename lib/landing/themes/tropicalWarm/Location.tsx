import type { ResolvedBlock } from '../../resolve';

export function Location({ block }: { block: Extract<ResolvedBlock, { type: 'location' }> }) {
  return (
    <section className="lp-tw-section" id="lokasi">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Lokasi</p>
        <h2 className="lp-tw-h2">Akses ke mana-mana</h2>
        {block.address ? <p className="lp-tw-lead">{block.address}</p> : null}

        {block.access.length ? (
          <div className="lp-tw-access">
            {block.access.map((a, i) => (
              <div key={`${a.place}-${i}`} className="lp-tw-access__item">
                <div className="lp-tw-access__time">{a.time}</div>
                <div className="lp-tw-access__place">{a.place}</div>
              </div>
            ))}
          </div>
        ) : null}

        {block.mapUrl ? (
          <div className="lp-tw-map">
            <iframe src={block.mapUrl} title={`Peta ${block.address || 'lokasi'}`} loading="lazy" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
