import Image from 'next/image';
import { Button, Input } from '@/components/ds';
import { signInAction } from './actions';

export const metadata = { title: 'Masuk — Listingku' };

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', background: 'var(--white)',
      }}
    >
      <form action={signInAction} style={{ width: '100%', maxWidth: 380 }}>
        <Image src="/brand/listingku-logo.png" alt="Listingku" width={180} height={42} priority />
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--sage)' }}>
          Marketing website properti dalam hitungan menit
        </p>

        <div style={{ marginTop: 36 }}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="nama@email.com"
            hint="Kami kirim tautan masuk ke email ini."
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <Button type="submit" variant="primary" size="md" fullWidth>
            Kirim magic link
          </Button>
        </div>

        <div
          style={{
            margin: '22px 0', display: 'flex', alignItems: 'center', gap: 12,
            color: 'var(--sage)', fontSize: 12,
          }}
        >
          <span style={{ flex: 1, height: 1, background: 'var(--ash)' }} />
          atau
          <span style={{ flex: 1, height: 1, background: 'var(--ash)' }} />
        </div>

        <Button type="submit" variant="secondary" size="md" fullWidth>
          Masuk dengan Google
        </Button>
      </form>
    </main>
  );
}
