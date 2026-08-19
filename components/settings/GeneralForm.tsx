'use client';

import { useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ds';
import { Dialog } from '@/components/ui';
import { setProfilePublishedAction, updateGeneralAction } from '@/app/(dashboard)/settings/actions';

export function GeneralForm({
  email, notifyOnLead, isPublished, subdomain,
}: { email: string; notifyOnLead: boolean; isPublished: boolean; subdomain: string }) {
  const router = useRouter();
  const [notify, setNotify] = useState(notifyOnLead);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onToggleNotify(next: boolean) {
    // Optimistis supaya switch terasa langsung; dikembalikan bila server menolak.
    setNotify(next);
    setNotifyError(null);
    const result = await updateGeneralAction(next ? { notifyOnLead: 'on' } : {});
    if (!result.ok) {
      setNotify(!next);
      setNotifyError('Preferensi gagal disimpan. Coba lagi.');
    }
  }

  async function onConfirmVisibility() {
    setPending(true);
    const result = await setProfilePublishedAction(!isPublished);
    setPending(false);
    setConfirmOpen(false);
    // Status live dibaca ulang di server (halaman ini dan kartu di /dashboard).
    if (result.ok) router.refresh();
  }

  const actionLabel = isPublished ? 'Unpublish situs profil' : 'Publikasikan situs profil';

  return (
    <div className="set__stack">
      <div className="set__card set__stack">
        <div className="set__half set__readonly">
          {/* Email berasal dari autentikasi, bukan dari profil — diubah lewat
              penyedia login, jadi ditampilkan hanya-baca alih-alih dihilangkan. */}
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            readOnly
            hint="Email diambil dari akun login Anda."
            onChange={() => {}}
          />
        </div>

        <div className="set__toggle">
          <div>
            <p className="set__togglelabel">Notifikasi lead</p>
            <p className="set__togglehint">Email saat ada lead baru masuk.</p>
          </div>
          <Switch.Root
            checked={notify}
            onCheckedChange={onToggleNotify}
            aria-label="Notifikasi lead"
            className="set__switch"
            data-on={notify || undefined}
          >
            <Switch.Thumb className="set__switchthumb" />
          </Switch.Root>
        </div>
        {notifyError ? <p role="alert" className="set__error">{notifyError}</p> : null}
      </div>

      <div className="set__danger">
        <p className="set__dangertitle">Zona Berbahaya</p>
        <p className="set__dangertext">
          {isPublished
            ? 'Situs profil tidak lagi dapat diakses publik. Landing page tetap live.'
            : `Situs profil Anda sedang tidak dapat diakses publik. Publikasikan kembali untuk mengaktifkan ${subdomain}.listingku.app.`}
        </p>
        <Button variant="secondary" size="sm" className="set__dangerbtn" onClick={() => setConfirmOpen(true)}>
          {actionLabel}
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={actionLabel}
        description={
          isPublished
            ? `Pengunjung ${subdomain}.listingku.app tidak akan bisa membuka situs profil Anda. Landing page project tetap live dan bisa diakses.`
            : `Situs profil Anda akan bisa dibuka publik di ${subdomain}.listingku.app.`
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)} disabled={pending}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={onConfirmVisibility} disabled={pending}>
              {pending ? 'Memproses…' : actionLabel}
            </Button>
          </>
        }
      />
    </div>
  );
}
