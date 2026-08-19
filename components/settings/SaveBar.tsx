'use client';

import { Button } from '@/components/ds';

/**
 * Baris simpan bersama untuk ketiga form Settings: status pending, pesan galat
 * umum (key `_` dari ActionResult), dan konfirmasi berhasil.
 */
export function SaveBar({
  pending, saved, error,
}: { pending: boolean; saved: boolean; error?: string }) {
  return (
    <div className="set__savebar">
      <Button type="submit" variant="primary" size="sm" disabled={pending}>
        {pending ? 'Menyimpan…' : 'Simpan perubahan'}
      </Button>
      {/* role="status" supaya hasilnya diumumkan, bukan hanya terlihat. */}
      <span role="status" className="set__savemsg">
        {error ? <span className="set__error">{error}</span> : null}
        {!error && saved ? 'Perubahan tersimpan.' : null}
      </span>
    </div>
  );
}
