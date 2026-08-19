import type { ResolvedBlock } from '../../resolve';
import { ContactForm } from '@/components/landing/ContactForm';

/**
 * Blok penutup. Desain #10 tidak punya form, tapi menghapusnya berarti mematikan
 * pipeline lead yang sudah jalan (dan sudah ada e2e-nya). id="minta-info" adalah
 * target lompat StickyCtaBar — ikut ke mana pun blok ini dipindah lewat editor.
 */
export function ContactFormBlock({ block }: { block: Extract<ResolvedBlock, { type: 'contactForm' }> }) {
  return (
    <section id="minta-info" className="lp-tw-contact" data-form-block={block.id}>
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Minta info</p>
        <h2 className="lp-tw-h2">Tinggalkan kontak Anda</h2>
        <p className="lp-tw-lead">Isi form ini — kami balas lewat WhatsApp secepatnya.</p>
        <div className="lp-tw-contact__card">
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
