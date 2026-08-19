import type { ResolvedBlock } from '../../resolve';
import { WhatsAppLink } from '@/components/landing/WhatsAppLink';
import { normalizeIndonesianPhone } from '@/lib/phone';
import { initials } from './parts';

/** Tim marketing (desain #10). Satu kartu agen — multi-agen di luar scope MVP. */
export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-tw-agent" id="kontak">
      <div className="lp-tw-in">
        <p className="lp-tw-eyebrow">Tim marketing</p>
        <h2 className="lp-tw-h2">Butuh informasi lebih lanjut?</h2>
        <p className="lp-tw-lead">Siap membantu proses KPR hingga serah terima kunci.</p>

        <div className="lp-tw-agent__card">
          <div className="lp-tw-agent__avatar" aria-hidden>{initials(block.agentName)}</div>
          <div className="lp-tw-agent__info">
            <div className="lp-tw-agent__name">{block.agentName}</div>
            <div className="lp-tw-agent__role">Property Advisor</div>
            <div className="lp-tw-agent__actions">
              <WhatsAppLink
                projectId={block.projectId}
                waNumber={block.waNumber}
                message={block.defaultMessage}
                className="lp-tw-agent__btn lp-tw-agent__btn--wa"
              >
                WhatsApp
              </WhatsAppLink>
              <a href={`tel:${normalizeIndonesianPhone(block.waNumber)}`} className="lp-tw-agent__btn lp-tw-agent__btn--call">
                Telepon
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
