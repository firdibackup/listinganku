'use client';

import type { ReactNode } from 'react';
import { normalizeIndonesianPhone } from '@/lib/phone';
import { recordEventAction } from '@/app/(public)/[slug]/actions';

/**
 * Membentuk URL wa.me dari nomor Indonesia gaya apa pun (08.., +62.., 62.., dengan
 * spasi/tanda hubung) + pesan awal. Memakai normalizeIndonesianPhone yang sama
 * dengan submitLeadAction supaya nomor yang disimpan sebagai lead dan nomor di
 * link chat tidak pernah berbeda hanya karena gaya ketik. Nomor kosong tidak
 * melempar — menghasilkan https://wa.me/?text=... yang tetap well-formed.
 */
export function toWaHref(waNumber: string, message: string): string {
  const digits = normalizeIndonesianPhone(waNumber);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppLink({
  projectId,
  waNumber,
  message,
  children,
  className,
}: {
  projectId: string;
  waNumber: string;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={toWaHref(waNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      // Fire-and-forget: recordEventAction menelan kegagalannya sendiri (lihat
      // actions.ts), jadi klik WhatsApp tidak pernah tertahan menunggu analitik.
      onClick={() => {
        void recordEventAction(projectId, 'whatsapp_click');
      }}
    >
      {children}
    </a>
  );
}
