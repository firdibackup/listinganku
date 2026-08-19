import { Chip } from '@/components/ds';
import { formatDateTimeShort } from '@/lib/format';
import { formatPhoneDisplay } from '@/lib/phone';
import type { Lead } from '@/lib/data/types';
import { LEAD_SOURCE_LABEL, LEAD_STATUS_META } from './leadStatus';

export interface LeadRow extends Lead {
  /** Nama tipe rumah sudah diselesaikan di server; null bila lead tidak menyebut tipe. */
  houseTypeName: string | null;
}

/**
 * `<table>` sungguhan, bukan CSS grid seperti di file design. Hasil visualnya
 * sama lewat table-layout:fixed, tapi pembaca layar mendapat hubungan
 * baris/kolom yang tidak bisa ditiru oleh grid div.
 */
export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  return (
    <div className="leads__tablewrap">
      <table className="leads__table">
        <thead>
          <tr>
            <th scope="col">Nama</th>
            <th scope="col">Telepon</th>
            <th scope="col">Pesan</th>
            <th scope="col">Asal</th>
            <th scope="col">Tipe</th>
            <th scope="col">Tanggal</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const status = LEAD_STATUS_META[lead.status];
            return (
              <tr key={lead.id}>
                <td className="leads__name">{lead.name}</td>
                <td className="leads__phone">{formatPhoneDisplay(lead.phone)}</td>
                <td className="leads__msg" title={lead.message}>{lead.message}</td>
                <td><Chip tone="outline" size="sm">{LEAD_SOURCE_LABEL[lead.source]}</Chip></td>
                {/* Em dash, bukan sel kosong: kolom harus tetap sejajar saat lead
                    datang dari CTA WhatsApp yang tidak menyebut tipe rumah. */}
                <td className="leads__muted">{lead.houseTypeName ?? '—'}</td>
                <td className="leads__muted">{formatDateTimeShort(lead.createdAt)}</td>
                <td><Chip tone={status.tone} size="sm">{status.label}</Chip></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
