import type { ResolvedBlock } from '../../resolve';
import { WhatsAppLink } from '@/components/landing/WhatsAppLink';
import { normalizeIndonesianPhone } from '@/lib/phone';
import { initials } from './parts';

/** Satu kartu agen (multi-agen di luar scope MVP). Section id="kontak". */
export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp-tw-agent" id="kontak">
      <div className="lp-tw-in">
        <div className="lp-tw-agent__card">
          <div className="lp-tw-agent__avatar" aria-hidden>{initials(block.agentName)}</div>
          <div className="lp-tw-agent__name">{block.agentName}</div>
          <div className="lp-tw-agent__role">Marketing hunian ini</div>
          <div className="lp-tw-agent__actions">
            <WhatsAppLink
              projectId={block.projectId}
              waNumber={block.waNumber}
              message={block.defaultMessage}
              className="lp-tw-btn lp-tw-btn--primary lp-tw-btn--block"
            >
              WhatsApp
            </WhatsAppLink>
            <a
              href={`tel:${normalizeIndonesianPhone(block.waNumber)}`}
              className="lp-tw-btn lp-tw-btn--ghost lp-tw-btn--block"
            >
              Telepon
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
