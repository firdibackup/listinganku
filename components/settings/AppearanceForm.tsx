'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Input } from '@/components/ds';
import { ACCENT_COLORS, PROFILE_THEMES } from '@/lib/schemas';
import { updateAppearanceAction } from '@/app/(dashboard)/settings/actions';
import { SaveBar } from './SaveBar';

/** Titik warna sampel di chip aksen — hanya untuk pratinjau, bukan sumber kebenaran. */
const ACCENT_SWATCH: Record<string, string> = {
  Oranye: 'var(--orange)',
  Hijau: 'var(--leaf)',
  Hitam: 'var(--evergreen)',
};

export function AppearanceForm({
  theme, colorScheme, siteName,
}: { theme: string; colorScheme: string; siteName: string }) {
  // State lokal supaya panel pratinjau ikut berubah sebelum disimpan.
  const [pickedTheme, setPickedTheme] = useState(theme);
  const [pickedAccent, setPickedAccent] = useState(colorScheme);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const themeLabelId = useId();
  const accentLabelId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setPending(true);
    setErrors({});
    setSaved(false);
    const result = await updateAppearanceAction({
      theme: pickedTheme,
      colorScheme: pickedAccent,
      siteName: String(fd.get('siteName') ?? ''),
    });
    setPending(false);
    if (result.ok) setSaved(true);
    else setErrors(result.fieldErrors);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="set__stack">
      {/* role="group" + aria-labelledby, bukan <fieldset>/<legend>: fieldset
          menggambar legend MENEMBUS garis border (takik), sehingga kartunya tidak
          sebentuk dengan kartu lain di halaman ini. Semantik pengelompokannya sama. */}
      <div className="set__card" role="group" aria-labelledby={themeLabelId}>
        <p id={themeLabelId} className="set__cardtitle">Tema Situs Profil</p>
        <div className="set__themes">
          {PROFILE_THEMES.map((name) => (
            <label key={name} className="set__theme" data-selected={name === pickedTheme || undefined}>
              {/* Radio sungguhan, bukan div ber-onClick: pemilihan tema harus
                  bisa dijangkau keyboard dan terbaca sebagai satu grup. */}
              <input
                type="radio"
                name="theme"
                value={name}
                checked={name === pickedTheme}
                onChange={() => setPickedTheme(name)}
                className="set__sronly"
              />
              <span className="set__themeswatch" aria-hidden="true" />
              <span className="set__themename">{name}</span>
            </label>
          ))}
        </div>
        {errors.theme?.[0] ? <p className="set__error">{errors.theme[0]}</p> : null}
      </div>

      <div className="set__card" role="group" aria-labelledby={accentLabelId}>
        <p id={accentLabelId} className="set__cardtitle">Warna Aksen</p>
        <div className="set__accents">
          {ACCENT_COLORS.map((name) => (
            <label key={name} className="set__accent" data-selected={name === pickedAccent || undefined}>
              <input
                type="radio"
                name="colorScheme"
                value={name}
                checked={name === pickedAccent}
                onChange={() => setPickedAccent(name)}
                className="set__sronly"
              />
              <span className="set__dot" style={{ background: ACCENT_SWATCH[name] }} aria-hidden="true" />
              {name}
            </label>
          ))}
        </div>
        {errors.colorScheme?.[0] ? <p className="set__error">{errors.colorScheme[0]}</p> : null}
      </div>

      <div className="set__card">
        <p className="set__cardtitle">Logo &amp; Nama Situs</p>
        <div className="set__logorow">
          {/* Unggah logo memakai pipeline media yang belum menerima aset milik
              profil (media selalu terikat projectId). Placeholder, bukan kontrol palsu. */}
          <div className="set__logoslot" aria-hidden="true">logo</div>
          <div className="set__logofield">
            <Input label="Nama Situs" name="siteName" defaultValue={siteName} error={errors.siteName?.[0]} />
          </div>
        </div>
      </div>

      <SaveBar pending={pending} saved={saved} error={errors._?.[0]} />
    </form>
  );
}
