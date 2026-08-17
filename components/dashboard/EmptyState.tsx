import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ds';

export function EmptyState() {
  return (
    <div className="dash__empty">
      <p className="lw-label-sm" style={{ color: 'var(--sage)' }}>Empty state</p>
      <p className="lw-h3" style={{ marginTop: 14 }}>Belum ada listing</p>
      <p style={{ marginTop: 6, fontSize: 14, color: 'var(--sage)' }}>
        Buat landing page profesional dalam hitungan menit.
      </p>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <Link href="/projects/new">
          <Button variant="primary" size="md" iconLeft={<Plus size={15} />}>
            Create project
          </Button>
        </Link>
      </div>
    </div>
  );
}
