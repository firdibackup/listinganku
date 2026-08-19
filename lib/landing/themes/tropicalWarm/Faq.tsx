'use client';

import { useState } from 'react';
import type { ResolvedBlock } from '../../resolve';

export function Faq({ block }: { block: Extract<ResolvedBlock, { type: 'faq' }> }) {
  const [open, setOpen] = useState(0);
  if (block.items.length === 0) return null;

  return (
    <section className="lp-tw-section">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">FAQ</p>
        <div className="lp-tw-faq">
          {block.items.map((item, i) => {
            const isOpen = i === open;
            return (
              <div key={item.q} className="lp-tw-faq__item" data-open={isOpen}>
                <button
                  type="button"
                  className="lp-tw-faq__q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <span className="lp-tw-faq__mark" aria-hidden>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? <div className="lp-tw-faq__a">{item.a}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
