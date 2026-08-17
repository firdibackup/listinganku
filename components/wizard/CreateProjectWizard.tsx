'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Chip, Input } from '@/components/ds';
import { toast } from '@/components/ui';
import { FACILITY_OPTIONS } from '@/lib/schemas';
import { createProjectAction, updateProjectAction } from '@/app/(dashboard)/projects/actions';
import { StepProgress } from './StepProgress';

const TOTAL = 3;

export function CreateProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  /** Terisi begitu langkah 1 disimpan; langkah berikutnya meng-update baris yang sama. */
  const [projectId, setProjectId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', location: '', developer: '', description: '', facilities: [] as string[],
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const toggleFacility = (name: string) =>
    set({
      facilities: form.facilities.includes(name)
        ? form.facilities.filter((f) => f !== name)
        : [...form.facilities, name],
    });

  /**
   * Auto-save di level langkah: setiap "Lanjut" meng-upsert draft, sehingga wizard
   * yang ditinggalkan di tengah jalan tetap meninggalkan project berstatus Draft
   * (Fase 3 flow doc). Langkah pertama membuat baris (createProjectAction),
   * langkah-langkah berikutnya meng-update baris yang sama lewat projectId yang
   * sudah tersimpan di state — bukan membuat baris baru tiap langkah, dan bukan
   * menunda simpan sampai langkah terakhir. Langkah terakhir hanya menyimpan lalu
   * berpindah halaman.
   */
  function next() {
    startTransition(async () => {
      const result = projectId
        ? await updateProjectAction(projectId, form)
        : await createProjectAction(form);

      if (!result.ok) {
        setErrors(result.fieldErrors);
        if (result.fieldErrors.name) {
          // Nama cuma pernah diedit di step 1 — itu satu-satunya kegagalan yang
          // perlu memindahkan step, supaya errornya kelihatan tepat di field-nya
          // (prop error Input, bukan toast).
          setStep(1);
        } else {
          // Kegagalan generik (sesi habis, project tidak ditemukan lagi saat
          // update, exception tak terduga) tidak dimiliki field mana pun — TIDAK
          // memindahkan step. Melompat ke step 1 di sini pernah jadi masalah:
          // seseorang yang sudah di step 3 kehilangan progres tampilan gara-gara
          // sesi blip sesaat, padahal projectId di state masih valid dan retry
          // dari step yang sama akan berhasil. Tanpa toast ini juga silent
          // failure yang sama seperti bug-010 di uploader media.
          const fallback = result.fieldErrors._?.[0];
          if (fallback) toast.error(fallback);
        }
        return;
      }

      setErrors({});
      const id = projectId ?? (result as { data: { id: string } }).data.id;
      setProjectId(id);

      if (step < TOTAL) {
        setStep(step + 1);
        return;
      }
      toast.success('Project tersimpan');
      router.push(`/projects/${id}`);
    });
  }

  return (
    <div className="wz">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h1 className="lw-h3">Project baru</h1>
        <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>
          Langkah {step} dari {TOTAL}
        </span>
      </div>

      <StepProgress current={step} total={TOTAL} />

      <Card className="wz__panel">
        {step === 1 ? (
          <>
            <h2 className="lw-h3">Basic info</h2>
            <Input
              label="Nama project" required value={form.name}
              error={errors.name?.[0]}
              onChange={(e) => set({ name: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Lokasi" value={form.location} onChange={(e) => set({ location: e.target.value })} />
              <Input label="Developer" value={form.developer} onChange={(e) => set({ developer: e.target.value })} />
            </div>
            <Input
              label="Deskripsi" textarea rows={3} value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="lw-h3">Fasilitas dan media</h2>
            <div>
              <span className="lw-label">Fasilitas umum</span>
              <div className="wz__chips">
                {FACILITY_OPTIONS.map((name) => (
                  <button
                    key={name} type="button" className="wz__chip"
                    aria-pressed={form.facilities.includes(name)}
                    onClick={() => toggleFacility(name)}
                  >
                    <Chip tone={form.facilities.includes(name) ? 'accent' : 'outline'} size="md">
                      {name}
                    </Chip>
                  </button>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--sage)' }}>
              Foto proyek bisa diunggah setelah project tersimpan, di halaman detail. Langkah ini boleh dilewati.
            </p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h2 className="lw-h3">Review</h2>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Nama project</span><span style={{ fontWeight: 500 }}>{form.name || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Lokasi</span><span>{form.location || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Developer</span><span>{form.developer || '—'}</span></div>
            <div className="wz__review"><span style={{ color: 'var(--sage)' }}>Fasilitas</span><span>{form.facilities.join(' · ') || '—'}</span></div>
          </>
        ) : null}
      </Card>

      <div className="wz__foot">
        <Button variant="link" size="sm" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          Kembali
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="lw-label-sm" style={{ color: 'var(--sage)' }}>Tersimpan otomatis</span>
          <Button variant="primary" size="sm" onClick={next} disabled={pending}>
            {step === TOTAL ? 'Simpan project' : 'Lanjut'}
          </Button>
        </div>
      </div>
    </div>
  );
}
