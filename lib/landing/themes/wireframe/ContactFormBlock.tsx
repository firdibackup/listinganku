import type { ResolvedBlock } from '../../resolve';
import { ContactForm } from '@/components/landing/ContactForm';

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  // id="minta-info" adalah target lompat StickyCtaBar (components/landing/
  // StickyCtaBar.tsx). Diletakkan di blok, bukan di halaman, supaya anchornya
  // ikut ke mana pun blok form dipindahkan lewat editor.
  return (
    <section id="minta-info" className="lp__section" data-form-block={block.id}>
      <div className="lp__inner">
        <h2 className="lw-h2">Minta info</h2>
        <div style={{ marginTop: 16, maxWidth: 520 }}>
          <ContactForm
            projectId={block.projectId}
            houseTypes={block.houseTypes}
            askHouseType={block.askHouseType}
          />
        </div>
      </div>
    </section>
  );
}
