'use client';

import { useRef, useState, useTransition } from 'react';
import { Star, X } from 'lucide-react';
import { downscaleImage, validateUpload, ACCEPTED_TYPES } from '@/lib/media/downscale';
import { uploadMediaAction, deleteMediaAction, setPrimaryMediaAction } from '@/lib/media/actions';
import type { Media } from '@/lib/data/types';

export interface MediaUploaderProps {
  projectId: string;
  houseTypeId?: string | null;
  type?: 'photo' | 'floor_plan';
  items: Media[];
  title: string;
  caption: string;
}

export function MediaUploader({
  projectId, houseTypeId = null, type = 'photo', items, title, caption,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError(null);

    let count = items.length;
    for (const file of Array.from(fileList)) {
      const check = validateUpload({ type: file.type, size: file.size }, count);
      if (!check.ok) {
        setError(`${file.name}: ${check.message}`);
        continue;
      }

      const blob = await downscaleImage(file);
      const data = new FormData();
      data.set('file', new File([blob], file.name, { type: blob.type || file.type }));
      data.set('projectId', projectId);
      data.set('houseTypeId', houseTypeId ?? '');
      data.set('type', type);

      const result = await uploadMediaAction(data);
      if (!result.ok) setError(`${file.name}: ${result.message}`);
      else count += 1;
    }
  }

  return (
    <div>
      <button
        type="button"
        className="mu__drop"
        style={{ width: '100%' }}
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
        <span style={{ display: 'block', marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>{caption}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(e) => startTransition(() => void handleFiles(e.target.files))}
      />

      {error ? <p className="mu__error">{error}</p> : null}

      {items.length > 0 ? (
        <div className="mu__grid">
          {items.map((item) => (
            <div key={item.id} className="mu__tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" />
              <button
                type="button"
                className="mu__remove"
                aria-label="Hapus foto"
                onClick={() => startTransition(() => void deleteMediaAction(item.id, projectId))}
              >
                <X size={12} />
              </button>
              {type === 'photo' ? (
                item.isPrimary ? (
                  <span className="mu__badge" role="img" aria-label="Foto utama">
                    <Star size={12} fill="currentColor" strokeWidth={0} />
                  </span>
                ) : (
                  <button
                    type="button"
                    className="mu__primary"
                    aria-label="Jadikan foto utama"
                    onClick={() => startTransition(() => void setPrimaryMediaAction(item.id, projectId))}
                  >
                    <Star size={12} />
                  </button>
                )
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
