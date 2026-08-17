export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTOS_PER_HOUSE_TYPE = 20;

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateUpload(file: { type: string; size: number }, existingCount: number): ValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) return { ok: false, message: 'Format harus JPG, PNG, atau WebP.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: 'Ukuran maksimal 10MB per file.' };
  if (existingCount >= MAX_PHOTOS_PER_HOUSE_TYPE) return { ok: false, message: 'Maksimal 20 foto per tipe rumah.' };
  return { ok: true };
}

/**
 * Mengecilkan gambar di browser sebelum diunggah. Menjaga .data/store.json dan
 * public/uploads tetap ringan, dan meniru perilaku klien yang mengunggah
 * langsung ke Supabase Storage nanti.
 */
export async function downscaleImage(file: File, maxEdge = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.type === 'image/jpeg') return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', 0.82);
  });
}
