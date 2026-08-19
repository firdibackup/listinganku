import type { ChipTone } from '@/components/ds/Chip';
import type { LeadSource, LeadStatus } from '@/lib/data/types';

/**
 * Label dan tone disalin dari `statusTone` di file design. Nilai tone-nya
 * kebetulan sudah persis sama dengan ChipTone yang ada, jadi tidak ada varian
 * Chip baru yang perlu dibuat.
 */
export const LEAD_STATUS_META: Record<LeadStatus, { label: string; tone: ChipTone }> = {
  new: { label: 'New', tone: 'accent' },
  contacted: { label: 'Contacted', tone: 'outline' },
  interested: { label: 'Interested', tone: 'tint' },
  negotiation: { label: 'Negotiation', tone: 'tint' },
  deal: { label: 'Deal', tone: 'primary' },
  lost: { label: 'Lost', tone: 'outline' },
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_META) as LeadStatus[];

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  form: 'Form',
  whatsapp: 'WhatsApp',
};

export function isLeadStatus(value: string | undefined): value is LeadStatus {
  return value !== undefined && value in LEAD_STATUS_META;
}
