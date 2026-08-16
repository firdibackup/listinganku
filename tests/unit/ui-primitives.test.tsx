import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Dialog, Accordion, Progress } from '@/components/ui';

const read = (p: string) => readFileSync(p, 'utf8');

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

  it('mengubah data-state dari closed ke open saat trigger diklik', async () => {
    render(<Accordion items={[{ id: 'kpr', question: 'Apakah bisa KPR?', answer: 'Bisa, lewat bank rekanan.' }]} />);
    const trigger = screen.getByRole('button', { name: 'Apakah bisa KPR?' });
    // Diperiksa di trigger, bukan di header pembungkusnya: selektor CSS penanda
    // +/- berpegang pada data-state milik .ui-acc__trigger.
    expect(trigger).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('data-state', 'open');
  });

  it('CSS mengandung data-state swap dan active press state', () => {
    const css = read(path.resolve(__dirname, '../../components/ui/ui.css'));
    expect(css).toContain('.ui-acc__trigger[data-state="closed"] .ui-acc__minus{display:none}');
    expect(css).toContain('.ui-acc__trigger[data-state="open"] .ui-acc__plus{display:none}');
    expect(css).toContain('.ui-acc__trigger:active:not(:disabled){transform:translateY(1px)}');
  });
});

describe('Progress', () => {
  it('mengekspos nilai ke pembaca layar dan menjepit ke rentang 0..100', () => {
    render(<Progress value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
