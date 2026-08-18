import type { ResolvedBlock } from '../../resolve';
import { WhatsAppLink } from '@/components/landing/WhatsAppLink';

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp__section" data-cta-block={block.id}>
      <div className="lp__inner">
        <h2 className="lw-h2">Tertarik dengan properti ini?</h2>
        <p className="lw-body" style={{ marginTop: 8, color: 'var(--sage)' }}>
          Hubungi {block.agentName} untuk jadwal survei dan simulasi KPR.
        </p>
        <div style={{ marginTop: 16 }}>
          <WhatsAppLink
            projectId={block.projectId}
            waNumber={block.waNumber}
            message={block.defaultMessage}
            className="ds-btn ds-btn--primary ds-btn--md"
          >
            Chat WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}
