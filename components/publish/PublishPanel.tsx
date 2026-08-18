'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button, Card, Chip } from '@/components/ds';
import { Dialog, toast } from '@/components/ui';
import { publishProjectAction } from '@/app/(dashboard)/projects/actions';
import type { Project, ProjectAiContent } from '@/lib/data/types';

type Platform = 'instagram' | 'facebook' | 'whatsapp';

export function PublishPanel({
  project, captions,
}: {
  project: Project;
  captions: ProjectAiContent['captions'] | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [platform, setPlatform] = useState<Platform>('instagram');
  const published = project.status === 'published';
  const url = `listingku.app/${project.slug}`;

  function publish() {
    startTransition(async () => {
      const result = await publishProjectAction(project.id);
      setConfirming(false);
      if (!result.ok) {
        toast.error('Lengkapi deskripsi project sebelum publish.');
        return;
      }
      await navigator.clipboard.writeText(`https://${url}`).catch(() => {});
      toast.success('Link tersalin');
      router.refresh();
    });
  }

  if (!published) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', paddingTop: 24 }}>
        <h1 className="lw-h2">Publikasikan {project.name}</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          Halaman akan live di {url} dan bisa dibagikan ke calon pembeli.
        </p>
        <div style={{ marginTop: 24 }}>
          <Button variant="primary" size="md" onClick={() => setConfirming(true)}>Publikasikan</Button>
        </div>

        <Dialog
          open={confirming}
          onOpenChange={setConfirming}
          title="Publikasikan landing ini?"
          description="Halaman akan live dan bisa dibagikan ke calon pembeli."
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>Batal</Button>
              <Button variant="primary" size="sm" onClick={publish} disabled={pending}>Ya, publikasikan</Button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', paddingTop: 24 }}>
      <div
        style={{
          width: 48, height: 48, borderRadius: '50%', background: 'var(--mint)',
          color: 'var(--status-success)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto',
        }}
      >
        <Check size={22} />
      </div>
      <h1 className="lw-h2" style={{ marginTop: 20 }}>Landing Anda sudah live</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
        Bagikan link atau QR ke calon pembeli. Perubahan konten langsung tampil tanpa publish ulang.
      </p>

      <Card padded={false} style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 12px 18px', textAlign: 'left' }}>
        <span className="lw-label" style={{ flex: 1, color: 'var(--evergreen)' }}>{url}</span>
        <Button
          variant="primary" size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(`https://${url}`);
            toast.success('Link tersalin');
          }}
        >
          Salin
        </Button>
      </Card>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, textAlign: 'left' }}>
        <Card>
          <p className="lw-label">QR code</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr?slug=${project.slug}&format=svg`}
            alt={`QR menuju ${url}`}
            style={{ marginTop: 12, width: '100%', border: '1px solid var(--ash)', borderRadius: 'var(--radius-sm)' }}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <a className="ds-btn ds-btn--secondary ds-btn--sm ds-btn--block" href={`/api/qr?slug=${project.slug}&format=png&download=1`}>PNG</a>
            <a className="ds-btn ds-btn--secondary ds-btn--sm ds-btn--block" href={`/api/qr?slug=${project.slug}&format=svg&download=1`}>SVG</a>
          </div>
        </Card>

        <Card>
          <p className="lw-label">Bagikan</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {(['instagram', 'facebook', 'whatsapp'] as Platform[]).map((p) => (
              <button key={p} type="button" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => setPlatform(p)}>
                <Chip tone={platform === p ? 'accent' : 'outline'}>
                  {p === 'instagram' ? 'Instagram' : p === 'facebook' ? 'Facebook' : 'WhatsApp'}
                </Chip>
              </button>
            ))}
          </div>
          <p style={{ marginTop: 12, border: '1px solid var(--ash)', borderRadius: 'var(--radius-sm)', padding: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)', minHeight: 104 }}>
            {captions ? captions[platform] : 'Caption tersedia setelah konten AI dibuat.'}
          </p>
          <div style={{ marginTop: 12 }}>
            <Button
              variant="secondary" size="sm" disabled={!captions}
              onClick={async () => {
                if (!captions) return;
                await navigator.clipboard.writeText(captions[platform]);
                toast.success('Caption tersalin');
              }}
            >
              Salin caption
            </Button>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <a className="ds-btn ds-btn--primary ds-btn--sm" href={`/${project.slug}`} target="_blank" rel="noopener noreferrer">Buka landing</a>
        <a className="ds-btn ds-btn--secondary ds-btn--sm" href={`/projects/${project.id}`}>Kembali ke project</a>
      </div>
    </div>
  );
}
