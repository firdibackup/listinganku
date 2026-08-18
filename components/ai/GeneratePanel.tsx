'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button, Card, Chip } from '@/components/ds';
import { Progress, Skeleton } from '@/components/ui';
import { generateContentAction } from '@/app/(dashboard)/projects/[id]/generate/actions';
import type { ProjectAiContent } from '@/lib/data/types';

type Phase = 'idle' | 'loading' | 'done' | 'error';

const STAGES = ['Menyusun deskripsi proyek…', 'Menyusun konten per tipe rumah…', 'Menyusun FAQ dan SEO…'];

export function GeneratePanel({
  projectId, projectName, houseTypeNames, existing,
}: {
  projectId: string;
  projectName: string;
  houseTypeNames: string[];
  existing: ProjectAiContent | null;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(existing ? 'done' : 'idle');
  const [stage, setStage] = useState(0);
  const [, startTransition] = useTransition();

  function run() {
    setPhase('loading');
    setStage(0);
    const ticker = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2500);

    startTransition(async () => {
      const result = await generateContentAction(projectId);
      clearInterval(ticker);
      if (!result.ok) setPhase('error');
      else {
        setPhase('done');
        router.refresh();
      }
    });
  }

  if (phase === 'loading') {
    return (
      <Card style={{ marginTop: 24 }}>
        <Progress value={((stage + 1) / STAGES.length) * 100} />
        <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500 }}>{STAGES[stage]}</p>
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Skeleton width="62%" />
          <Skeleton width="78%" />
          <Skeleton width="44%" />
        </div>
      </Card>
    );
  }

  if (phase === 'error') {
    return (
      <Card style={{ marginTop: 24, textAlign: 'center' }}>
        <p className="lw-label-lg">AI sedang gangguan</p>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          Konten Anda tidak hilang. Coba lagi atau lanjut isi manual.
        </p>
        <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="primary" size="sm" onClick={run}>Coba lagi</Button>
          <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${projectId}/editor`)}>
            Isi manual saja
          </Button>
        </div>
        <p style={{ marginTop: 24, background: 'var(--stone)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 12, color: 'var(--sage)' }}>
          AI opsional — Anda tetap bisa menyusun konten sendiri dan publish.
        </p>
      </Card>
    );
  }

  if (phase === 'done' && existing) {
    return (
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Headline proyek</p>
          <p className="lw-h3" style={{ marginTop: 10 }}>{existing.headline}</p>
        </Card>
        <Card>
          <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>
            Deskripsi proyek · {existing.description.split(/\s+/).length} kata
          </p>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: 'var(--sage)' }}>
            {existing.description.slice(0, 260)}…
          </p>
        </Card>
        <Card>
          <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Konten per tipe rumah</p>
          <p style={{ marginTop: 10, fontSize: 14, color: 'var(--sage)' }}>
            {houseTypeNames.join(' · ')} — tersusun.
          </p>
        </Card>
        <Card>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip tone="tint">Instagram</Chip>
            <Chip tone="outline">Facebook</Chip>
            <Chip tone="outline">WhatsApp</Chip>
          </div>
          <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)' }}>
            {existing.captions.instagram}
          </p>
        </Card>
        <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
          <Button variant="primary" size="sm" onClick={() => router.push(`/projects/${projectId}/editor`)}>
            Lanjut ke editor
          </Button>
          <Button variant="secondary" size="sm" onClick={run}>Ulangi</Button>
        </div>
      </div>
    );
  }

  return (
    <Card style={{ marginTop: 24, textAlign: 'center', padding: '56px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--orange)' }}>
        <Sparkles size={26} />
      </div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
        <Button variant="primary" size="md" onClick={run}>Generate AI</Button>
      </div>
      <p style={{ marginTop: 16, fontSize: 14, color: 'var(--sage)', maxWidth: 420, margin: '16px auto 0', lineHeight: 1.6 }}>
        Sekitar 15 detik — AI menyusun deskripsi proyek untuk {projectName}, konten per tipe rumah, selling points, FAQ, dan SEO.
      </p>
      <button
        type="button"
        style={{ marginTop: 22, background: 'none', border: 0, fontSize: 12, color: 'var(--sage)', cursor: 'pointer' }}
        onClick={() => setPhase('error')}
      >
        Lihat state error
      </button>
    </Card>
  );
}
