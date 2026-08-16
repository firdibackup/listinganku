import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Dialog, Accordion, Progress } from '@/components/ui';

describe('Dialog', () => {
  it('menampilkan judul dan isi saat terbuka', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Publikasikan landing ini?">
        <p>Halaman akan live dan bisa dibagikan ke calon pembeli.</p>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Publikasikan landing ini?')).toBeInTheDocument();
  });

  it('memanggil onOpenChange saat Escape ditekan', async () => {
    const onOpenChange = vi.fn();
    render(<Dialog open onOpenChange={onOpenChange} title="Judul"><p>isi</p></Dialog>);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Accordion', () => {
  it('menyembunyikan jawaban sampai pertanyaannya diklik', async () => {
    render(<Accordion items={[{ id: 'kpr', question: 'Apakah bisa KPR?', answer: 'Bisa, lewat bank rekanan.' }]} />);
    expect(screen.queryByText('Bisa, lewat bank rekanan.')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Apakah bisa KPR?' }));
    expect(screen.getByText('Bisa, lewat bank rekanan.')).toBeVisible();
  });
});

describe('Progress', () => {
  it('mengekspos nilai ke pembaca layar dan menjepit ke rentang 0..100', () => {
    render(<Progress value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
