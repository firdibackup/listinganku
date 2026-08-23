'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Chip, Input } from '@/components/ds';
import { toast } from '@/components/ui';
import { PROJECT_TYPES, PROJECT_TYPE_LABELS } from '@/lib/schemas';
import { createProjectAction, updateProjectAction } from '@/app/(dashboard)/projects/actions';
import { emptyBrief } from '@/lib/data/types';
import type { ProjectBrief, ProjectType } from '@/lib/data/types';
import { composeLocationLabel } from '@/lib/places/regions';
import { defaultBlocksForTheme, toggleBlock, type Block } from '@/lib/landing/blocks';
import { DEFAULT_THEME } from '@/lib/landing/themeNames';
import { applySectionPreset } from '@/lib/landing/sectionPreset';
import { StepProgress } from './StepProgress';
import { LocationCombobox } from './LocationCombobox';
import { SectionPlanner } from './SectionPlanner';
import { HeroPanel } from './panels/HeroPanel';
import { HighlightsPanel } from './panels/HighlightsPanel';
import { FacilitiesPanel } from './panels/FacilitiesPanel';
import { LocationPanel } from './panels/LocationPanel';
import { PromoPanel } from './panels/PromoPanel';

const TOTAL = 3;

export function CreateProjectWizard({ developers = [] }: { developers?: string[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  /** Terisi begitu langkah 1 disimpan; langkah berikutnya meng-update baris yang sama. */
  const [projectId, setProjectId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', location: '', developer: '', description: '',
    facilities: [] as string[],
    projectType: null as ProjectType | null,
    brief: emptyBrief() as ProjectBrief,
  });
  /** Tipe yang menunggu konfirmasi karena penerapannya menyusun ulang section. */
  const [typeConfirm, setTypeConfirm] = useState<ProjectType | null>(null);
  /**
   * State blok section landing page. Diinisialisasi dengan preset SUDAH
   * diterapkan (bukan defaultBlocksForTheme telanjang) — form.projectType
   * di sini selalu null saat mount (wizard hanya dipakai untuk create baru),
   * jadi applySectionPreset(..., null) memang no-op, tapi konsisten dengan
   * applyType() di bawah supaya tidak ada dua sumber kebenaran untuk "state
   * blocks yang sudah di-preset".
   */
  const [blocks, setBlocks] = useState<Block[]>(
    () => applySectionPreset(defaultBlocksForTheme(DEFAULT_THEME), form.projectType),
  );

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const setBrief = (patch: Partial<ProjectBrief>) =>
    setForm((f) => ({ ...f, brief: { ...f.brief, ...patch } }));

  /**
   * Satu-satunya jalur yang benar-benar MENERAPKAN sebuah tipe project: menulis
   * projectType DAN menyusun ulang flag enabled blocks lewat applySectionPreset.
   * Dipanggil dari DUA tempat (chooseType saat tipe pertama kali dipilih, dan
   * tombol konfirmasi "Sesuaikan section" saat tipe diganti) — diekstrak supaya
   * keduanya tidak bisa berdivergensi lagi (dulu logika ini duplikat dan hanya
   * menulis projectType, bukan blocks, sehingga preset dari Task 6 tidak pernah
   * terlihat agen di step 2).
   */
  function applyType(next: ProjectType) {
    set({ projectType: next });
    setBlocks((b) => applySectionPreset(b, next));
  }

  /**
   * Tipe pertama kali dipilih: terapkan langsung, belum ada apa pun untuk
   * ditimpa. MENGGANTI tipe menyusun ulang flag section, jadi harus bertanya —
   * pola yang sama dengan "Terapkan urutan bawaan tema ini?" di editor.
   */
  function chooseType(next: ProjectType) {
    if (form.projectType && form.projectType !== next) setTypeConfirm(next);
    else applyType(next);
  }

  function pickRegion(r: { district: string; city: string; province: string }) {
    setForm((f) => {
      const area = f.brief.location?.area ?? '';
      const address = f.brief.location?.address ?? '';
      const location = { ...r, area, address };
      return { ...f, brief: { ...f.brief, location }, location: composeLocationLabel(location) };
    });
  }

  function setArea(area: string) {
    setForm((f) => {
      const base = f.brief.location ?? { area: '', district: '', city: '', province: '', address: '' };
      const next = { ...base, area };
      return { ...f, brief: { ...f.brief, location: next }, location: composeLocationLabel(next) };
    });
  }

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
      const payload = { ...form, blocks };
      const result = projectId
        ? await updateProjectAction(projectId, payload)
        : await createProjectAction(payload);

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
              placeholder="Contoh: ParkSpring Gading"
              error={errors.name?.[0]}
              onChange={(e) => set({ name: e.target.value })}
            />

            <div>
              <span className="lw-label">Tipe project</span>
              <div className="wz__chips">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t} type="button" className="wz__chip"
                    aria-pressed={form.projectType === t}
                    onClick={() => chooseType(t)}
                  >
                    <Chip tone={form.projectType === t ? 'accent' : 'outline'} size="md">
                      {PROJECT_TYPE_LABELS[t]}
                    </Chip>
                  </button>
                ))}
              </div>
            </div>

            {typeConfirm ? (
              <div className="wz__confirm" role="group" aria-label="Konfirmasi tipe project">
                <p className="lw-label-sm">Sesuaikan section untuk tipe project ini?</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button
                    variant="primary" size="sm"
                    onClick={() => { applyType(typeConfirm); setTypeConfirm(null); }}
                  >
                    Sesuaikan section
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setTypeConfirm(null)}>
                    Pertahankan pilihan saya
                  </Button>
                </div>
              </div>
            ) : null}

            <LocationCombobox value={form.brief.location} onSelect={pickRegion} />
            <Input
              label="Nama kawasan"
              hint="Opsional. Kawasan seperti Gading Serpong atau BSD City tidak ada di data wilayah resmi."
              placeholder="Contoh: Gading Serpong"
              value={form.brief.location?.area ?? ''}
              onChange={(e) => setArea(e.target.value)}
            />

            <Input
              label="Developer" list="wz-developers"
              placeholder="Contoh: Summarecon Agung"
              value={form.developer}
              onChange={(e) => set({ developer: e.target.value })}
            />
            <datalist id="wz-developers">
              {developers.map((d) => <option key={d} value={d} />)}
            </datalist>

            <Input
              label="Ceritakan singkat tentang project ini" textarea rows={3}
              placeholder="Contoh: Perumahan modern di Gading Serpong dengan akses tol dekat, fasilitas lengkap, dan pilihan tipe rumah 2–3 lantai."
              hint="Tidak perlu membuat copywriting. Tulis informasi seadanya, kami yang menyusunnya jadi copy marketing."
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="lw-h3">Materi landing page</h2>
            <SectionPlanner
              blocks={blocks}
              brief={form.brief}
              projectType={form.projectType}
              onToggle={(id) => setBlocks((b) => toggleBlock(b, id))}
              onUsePreset={() => setBlocks((b) => applySectionPreset(b, form.projectType))}
              onNote={(type, text) =>
                setBrief({ notes: { ...form.brief.notes, [type]: text || undefined } })
              }
              panelFor={(type) => {
                const p = { brief: form.brief, onChange: setBrief };
                if (type === 'hero') return <HeroPanel {...p} />;
                if (type === 'highlights') return <HighlightsPanel {...p} />;
                if (type === 'facilities') return <FacilitiesPanel {...p} />;
                if (type === 'location') return <LocationPanel {...p} />;
                if (type === 'pricePromo') return <PromoPanel {...p} />;
                return null;
              }}
            />
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
