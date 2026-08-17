'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { Button, Card, Chip } from '@/components/ds';
import { HouseTypeCard } from './HouseTypeCard';
import { HouseTypeSheet } from './HouseTypeSheet';
import type { HouseType, Media, Project } from '@/lib/data/types';

export function ProjectDetail({
  project, houseTypes, media,
}: {
  project: Project;
  houseTypes: HouseType[];
  media: Media[];
}) {
  const [editing, setEditing] = useState<HouseType | null>(null);
  const [open, setOpen] = useState(false);

  const openSheet = (houseType: HouseType | null) => {
    setEditing(houseType);
    setOpen(true);
  };

  return (
    <>
      <Link href="/dashboard" className="pj__back lw-label-sm">
        <ArrowLeft size={14} /> Projects
      </Link>

      <div className="pj__head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="lw-h2">{project.name}</h1>
            <Chip tone={project.status === 'published' ? 'tint' : 'outline'}>
              {project.status === 'published' ? 'Published' : 'Draft'}
            </Chip>
          </div>
          <p style={{ marginTop: 7, fontSize: 14, color: 'var(--sage)' }}>
            {[project.location, project.developer, `${houseTypes.length} tipe unit`].filter(Boolean).join(' · ')}
          </p>
          {project.description ? (
            <p style={{ margin: '14px 0 0', maxWidth: 620, fontSize: 14, lineHeight: 1.6, color: 'var(--sage)' }}>
              {project.description}
            </p>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 className="lw-label-lg">Tipe rumah</h2>
        <Button variant="primary" size="sm" iconLeft={<Plus size={15} />} onClick={() => openSheet(null)}>
          Add house type
        </Button>
      </div>

      <div className="pj__types">
        {houseTypes.map((houseType) => (
          <HouseTypeCard
            key={houseType.id}
            houseType={houseType}
            media={media.filter((m) => m.houseTypeId === houseType.id)}
            onClick={() => openSheet(houseType)}
          />
        ))}
        <button type="button" className="pj__add" onClick={() => openSheet(null)}>
          <Plus size={18} />
          <span style={{ fontSize: 14 }}>Tambah tipe</span>
        </button>
      </div>

      {houseTypes.length > 0 ? (
        <Card tone="tint" padded={false} className="pj__aicta" style={{ padding: '26px 28px' }}>
          <div>
            <p className="lw-label-lg">Data siap. Biarkan AI membuatkan kontennya?</p>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
              Satu kali generate mencakup deskripsi proyek dan konten seluruh tipe rumah.
            </p>
          </div>
          <Link href={`/projects/${project.id}/generate`}>
            <Button variant="primary" size="md" iconLeft={<Sparkles size={16} />}>Generate AI</Button>
          </Link>
        </Card>
      ) : null}

      <HouseTypeSheet
        // `open` masuk ke key supaya remount terjadi setiap kali sheet dibuka
        // ulang — HouseTypeSheet sendiri TIDAK pernah unmount di antara buka/tutup
        // (hanya Radix Content-nya yang lepas dari DOM), jadi tanpa ini
        // useState(form) di dalamnya bertahan dari sesi buka sebelumnya. Bukti
        // konkretnya: buka tipe A, tutup, buka tipe B — tanpa key ini form
        // masih menampilkan data A karena initializer useState cuma jalan
        // sekali per instance komponen, bukan setiap kali prop houseType ganti.
        key={open ? (editing?.id ?? 'new') : 'closed'}
        projectId={project.id}
        houseType={editing}
        media={media}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
