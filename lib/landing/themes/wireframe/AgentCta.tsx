// Tombol WhatsApp asli dipasang di Task 14; di sini strukturnya saja.
import type { ResolvedBlock } from '../../resolve';

export function AgentCta({ block }: { block: Extract<ResolvedBlock, { type: 'agentCta' }> }) {
  return (
    <section className="lp__section" data-cta-block={block.id}>
      <div className="lp__inner">
        <h2 className="lw-h2">Tertarik dengan properti ini?</h2>
        <p className="lw-body" style={{ marginTop: 8, color: 'var(--sage)' }}>
          Hubungi {block.agentName} untuk jadwal survei dan simulasi KPR.
        </p>
      </div>
    </section>
  );
}
