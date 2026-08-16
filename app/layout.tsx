import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import '@/styles/globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Listingku',
  description: 'Marketing website properti dalam hitungan menit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
