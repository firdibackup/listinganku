import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button, Card, Chip, Input } from '@/components/ds';

describe('Button', () => {
  it('memakai kelas varian primer secara default', () => {
    render(<Button>Simpan project</Button>);
    const btn = screen.getByRole('button', { name: 'Simpan project' });
    expect(btn.className).toContain('ds-btn--primary');
    expect(btn.className).toContain('ds-btn--md');
  });

  it('menghormati varian, ukuran, dan full width', () => {
    render(<Button variant="secondary" size="sm" fullWidth>Kembali</Button>);
    const btn = screen.getByRole('button', { name: 'Kembali' });
    expect(btn.className).toContain('ds-btn--secondary');
    expect(btn.className).toContain('ds-btn--sm');
    expect(btn.className).toContain('ds-btn--block');
  });

  it('menyembunyikan ikon dari pembaca layar', () => {
    render(<Button iconLeft={<svg data-testid="ikon" />}>Create project</Button>);
    expect(screen.getByTestId('ikon').closest('span')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Card', () => {
  it('memakai tona terang secara default', () => {
    render(<Card data-testid="kartu">isi</Card>);
    expect(screen.getByTestId('kartu').className).toContain('ds-card--light');
  });

  it('mendukung tona mint', () => {
    render(<Card tone="tint" data-testid="kartu">isi</Card>);
    expect(screen.getByTestId('kartu').className).toContain('ds-card--tint');
  });
});

describe('Chip', () => {
  it('merender teks anak persis seperti yang diberikan', () => {
    render(<Chip>Published</Chip>);
    expect(screen.getByText('Published').textContent).toBe('Published');
  });
});

describe('Input', () => {
  it('menyambungkan label ke field', () => {
    render(<Input label="Nama Project" defaultValue="Parkspring Gading" />);
    expect(screen.getByLabelText(/Nama Project/)).toHaveValue('Parkspring Gading');
  });

  it('menampilkan error dan menandai field invalid', () => {
    render(<Input label="Harga" error="Wajib diisi." />);
    expect(screen.getByText('Wajib diisi.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Harga/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('merender textarea saat diminta', () => {
    render(<Input label="Deskripsi" textarea rows={3} />);
    expect(screen.getByLabelText(/Deskripsi/).tagName).toBe('TEXTAREA');
  });

  it('aria-describedby hanya merujuk id yang ada di DOM', () => {
    render(<Input label="Harga" hint="Masukkan harga dalam Rp" error="Wajib diisi." />);
    const input = screen.getByLabelText(/Harga/);
    // Tanpa assertion tanpa syarat, tes ini lulus diam-diam kalau atributnya hilang.
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    for (const id of describedBy!.split(/\s+/)) {
      expect(document.getElementById(id)).toBeInTheDocument();
    }
  });
});
