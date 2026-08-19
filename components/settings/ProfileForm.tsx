'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input } from '@/components/ds';
import { updateProfileAction } from '@/app/(dashboard)/settings/actions';
import { SaveBar } from './SaveBar';

export function ProfileForm({
  about, closings, listings, specialistArea, whatsapp,
}: {
  about: string; closings: number; listings: number; specialistArea: string; whatsapp: string;
}) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setPending(true);
    setErrors({});
    setSaved(false);
    const result = await updateProfileAction({
      about: String(fd.get('about') ?? ''),
      closings: String(fd.get('closings') ?? ''),
      listings: String(fd.get('listings') ?? ''),
      specialistArea: String(fd.get('specialistArea') ?? ''),
      whatsapp: String(fd.get('whatsapp') ?? ''),
    });
    setPending(false);
    if (result.ok) setSaved(true);
    else setErrors(result.fieldErrors);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="set__stack">
      <div className="set__card set__stack">
        <Input
          label="About Me"
          name="about"
          textarea
          rows={4}
          defaultValue={about}
          error={errors.about?.[0]}
        />
        <div className="set__stats">
          <Input label="Total Closing" name="closings" type="number" min={0} defaultValue={closings} error={errors.closings?.[0]} />
          <Input label="Total Listing" name="listings" type="number" min={0} defaultValue={listings} error={errors.listings?.[0]} />
          <Input label="Wilayah Spesialis" name="specialistArea" defaultValue={specialistArea} error={errors.specialistArea?.[0]} />
        </div>
        <div className="set__half">
          <Input
            label="Nomor WhatsApp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={whatsapp}
            error={errors.whatsapp?.[0]}
          />
        </div>
      </div>

      <SaveBar pending={pending} saved={saved} error={errors._?.[0]} />
    </form>
  );
}
