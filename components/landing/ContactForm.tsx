'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input } from '@/components/ds';
import { submitLeadAction } from '@/app/(public)/[slug]/actions';
import type { ResolvedHouseType } from '@/lib/landing/resolve';

/**
 * Form kontak publik. Tidak melakukan validasi Zod di klien: submitLeadAction
 * memvalidasi ulang setiap field di server (satu-satunya sumber kebenaran) dan
 * mengembalikan ActionResult, jadi pesan error yang tampil di sini adalah pesan
 * server yang sama persis. Hasil action selalu di-await dan diperiksa — tidak
 * pernah `void`-ed di dalam startTransition, supaya kegagalan tidak hilang diam.
 */
export function ContactForm({
  projectId,
  houseTypes,
  askHouseType,
}: {
  projectId: string;
  houseTypes: ResolvedHouseType[];
  askHouseType: boolean;
}) {
  const typeSelectId = useId();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const showTypes = askHouseType && houseTypes.length > 0;

  if (done) {
    return (
      <div role="status" className="lp__form-done">
        <p className="lw-h2" style={{ marginTop: 0 }}>Permintaan terkirim</p>
        <p className="lw-body" style={{ marginTop: 8, color: 'var(--lp-ink-soft)' }}>
          Terima kasih, kami akan menghubungi Anda lewat WhatsApp.
        </p>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      email: String(fd.get('email') ?? ''),
      message: String(fd.get('message') ?? ''),
      houseTypeId: showTypes ? String(fd.get('houseTypeId') ?? '') || undefined : undefined,
    };

    setPending(true);
    setErrors({});
    const result = await submitLeadAction(projectId, payload);
    setPending(false);

    if (result.ok) setDone(true);
    else setErrors(result.fieldErrors);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Input label="Nama" name="name" autoComplete="name" error={errors.name?.[0]} />
      <Input
        label="Nomor WhatsApp"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        hint="Contoh: 0812 3456 7890"
        error={errors.phone?.[0]}
      />
      <Input label="Email (opsional)" name="email" type="email" autoComplete="email" error={errors.email?.[0]} />

      {showTypes ? (
        <div className="ds-field">
          <label className="ds-field__label" htmlFor={typeSelectId}>
            Tipe yang diminati
          </label>
          <div className="ds-field__control">
            <select id={typeSelectId} name="houseTypeId" className="ds-field__input" defaultValue="">
              <option value="">Belum menentukan</option>
              {houseTypes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <Input label="Pesan" name="message" textarea rows={4} error={errors.message?.[0]} />

      {errors._?.[0] ? (
        <p className="ds-field__error" role="alert" style={{ marginBottom: 12 }}>
          {errors._[0]}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        Kirim pesan
      </Button>
    </form>
  );
}
