'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ds';
import { Sheet, toast } from '@/components/ui';
import { MediaUploader } from '@/components/media/MediaUploader';
import { createHouseTypeAction, updateHouseTypeAction, deleteHouseTypeAction } from '@/app/(dashboard)/projects/[id]/houseTypeActions';
import type { HouseType, Media } from '@/lib/data/types';

const EMPTY = { name: '', price: '', landArea: '', buildingArea: '', bedrooms: '', bathrooms: '', carport: '' };

export interface HouseTypeSheetProps {
  projectId: string;
  houseType: HouseType | null;
  media: Media[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HouseTypeSheet({ projectId, houseType, media, open, onOpenChange }: HouseTypeSheetProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState(
    houseType
      ? {
          name: houseType.name,
          price: String(houseType.price),
          landArea: String(houseType.landArea),
          buildingArea: String(houseType.buildingArea),
          bedrooms: String(houseType.bedrooms),
          bathrooms: String(houseType.bathrooms),
          carport: String(houseType.carport),
        }
      : EMPTY,
  );

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  function save() {
    startTransition(async () => {
      const result = houseType
        ? await updateHouseTypeAction(houseType.id, projectId, form)
        : await createHouseTypeAction(projectId, form);

      if (!result.ok) {
        setErrors(result.fieldErrors);
        const generic = result.fieldErrors._?.[0];
        if (generic) toast.error(generic);
        return;
      }
      toast.success(houseType ? 'Tipe rumah tersimpan' : 'Tipe rumah ditambahkan');
      setErrors({});
      onOpenChange(false);
      router.refresh();
    });
  }

  function remove() {
    if (!houseType) return;
    startTransition(async () => {
      const result = await deleteHouseTypeAction(houseType.id, projectId);
      // deleteHouseTypeAction mengembalikan ActionResult<null> (bukan Promise<void>
      // seperti versi awal brief) supaya kegagalan — sesi habis, tipe sudah
      // terhapus di tab lain — tampil ke pengguna alih-alih diam-diam gagal
      // sementara sheet tetap menutup seolah berhasil.
      if (!result.ok) {
        toast.error(result.fieldErrors._?.[0] ?? 'Gagal menghapus tipe rumah.');
        return;
      }
      toast.success('Tipe rumah dihapus');
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={houseType ? `Edit ${houseType.name}` : 'Tambah tipe rumah'}
      description="Spesifikasi ini tampil sebagai section di landing page project."
      footer={
        <>
          {houseType ? (
            <Button variant="link" size="sm" onClick={remove} disabled={pending}>
              Hapus tipe
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} disabled={pending}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={save} disabled={pending}>
            Simpan tipe
          </Button>
        </>
      }
    >
      <Input label="Nama tipe" required value={form.name} error={errors.name?.[0]} onChange={(e) => set({ name: e.target.value })} />
      <Input label="Harga" required inputMode="numeric" suffix="rupiah" value={form.price} error={errors.price?.[0]} onChange={(e) => set({ price: e.target.value })} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Luas tanah" required inputMode="numeric" suffix="m²" value={form.landArea} error={errors.landArea?.[0]} onChange={(e) => set({ landArea: e.target.value })} />
        <Input label="Luas bangunan" required inputMode="numeric" suffix="m²" value={form.buildingArea} error={errors.buildingArea?.[0]} onChange={(e) => set({ buildingArea: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <Input label="Kamar tidur" inputMode="numeric" value={form.bedrooms} error={errors.bedrooms?.[0]} onChange={(e) => set({ bedrooms: e.target.value })} />
        <Input label="Kamar mandi" inputMode="numeric" value={form.bathrooms} error={errors.bathrooms?.[0]} onChange={(e) => set({ bathrooms: e.target.value })} />
        <Input label="Carport" inputMode="numeric" value={form.carport} error={errors.carport?.[0]} onChange={(e) => set({ carport: e.target.value })} />
      </div>

      {houseType ? (
        <>
          <MediaUploader
            projectId={projectId} houseTypeId={houseType.id} type="photo"
            items={media.filter((m) => m.houseTypeId === houseType.id && m.type === 'photo')}
            title="Unggah foto tipe" caption="Interior dan eksterior — JPG/PNG/WebP, maks 10MB, hingga 20 foto"
          />
          <MediaUploader
            projectId={projectId} houseTypeId={houseType.id} type="floor_plan"
            items={media.filter((m) => m.houseTypeId === houseType.id && m.type === 'floor_plan')}
            title="Unggah denah" caption="Floor plan atau site plan tipe ini"
          />
        </>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--sage)' }}>
          Foto dan denah bisa diunggah setelah tipe ini tersimpan.
        </p>
      )}
    </Sheet>
  );
}
