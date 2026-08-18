import QRCode from 'qrcode';
import { db } from '@/lib/data';
import { isValidQrFormat, qrTargetUrl } from './helpers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const format = searchParams.get('format') ?? 'png';
  const download = searchParams.get('download') === '1';

  if (!slug) return new Response('Slug wajib diisi.', { status: 400 });
  if (!isValidQrFormat(format)) return new Response('Format harus png atau svg.', { status: 400 });

  const project = await db.projects.getBySlug(slug);
  if (!project || project.status !== 'published') return new Response('Tidak ditemukan.', { status: 404 });

  const url = qrTargetUrl(slug);
  const disposition = download ? `attachment; filename="${slug}.${format}"` : 'inline';
  const options = { margin: 1, width: 512, color: { dark: '#233D2D', light: '#FFFFFF' } } as const;

  if (format === 'svg') {
    const svg = await QRCode.toString(url, { ...options, type: 'svg' });
    return new Response(svg, {
      headers: { 'content-type': 'image/svg+xml', 'content-disposition': disposition },
    });
  }

  const buffer = await QRCode.toBuffer(url, { ...options, type: 'png' });
  return new Response(new Uint8Array(buffer), {
    headers: { 'content-type': 'image/png', 'content-disposition': disposition },
  });
}
