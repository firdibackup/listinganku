import { describe, it, expect, vi } from 'vitest';
import { renameWithRetry } from '@/lib/data/mock/snapshot';

function errWithCode(code: string): NodeJS.ErrnoException {
  const e = new Error(`${code}: operation not permitted, rename`) as NodeJS.ErrnoException;
  e.code = code;
  return e;
}

describe('renameWithRetry', () => {
  it('mengulang saat EPERM sesaat lalu berhasil pada percobaan ketiga', () => {
    const rename = vi.fn()
      .mockImplementationOnce(() => { throw errWithCode('EPERM'); })
      .mockImplementationOnce(() => { throw errWithCode('EPERM'); })
      .mockImplementationOnce(() => undefined);

    expect(() => renameWithRetry('a', 'b', 10, rename)).not.toThrow();
    expect(rename).toHaveBeenCalledTimes(3);
  });

  it('melempar segera untuk error non-transien (ENOENT) tanpa retry', () => {
    const rename = vi.fn(() => { throw errWithCode('ENOENT'); });

    expect(() => renameWithRetry('a', 'b', 10, rename)).toThrow('ENOENT');
    expect(rename).toHaveBeenCalledTimes(1);
  });

  it('menyerah dan melempar setelah maxAttempts kalau EPERM terus-menerus', () => {
    const rename = vi.fn(() => { throw errWithCode('EPERM'); });

    expect(() => renameWithRetry('a', 'b', 3, rename)).toThrow('EPERM');
    expect(rename).toHaveBeenCalledTimes(3);
  });
});
