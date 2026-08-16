'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-body)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--type-body-sm-size)',
          boxShadow: 'var(--shadow-menu)',
        },
      }}
    />
  );
}
