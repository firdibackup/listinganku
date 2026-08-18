import type { ResolvedBlock } from '../../resolve';
import { ContactForm } from '@/components/landing/ContactForm';

export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section className="lp__section" data-form-block={block.id}>
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
