import type { ReactNode } from 'react';

export type ChipTone = 'tint' | 'outline' | 'accent' | 'primary';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  tone?: ChipTone;
  size?: ChipSize;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Chip({ tone = 'tint', size = 'sm', icon, className = '', children }: ChipProps) {
  const classes = ['ds-chip', `ds-chip--${tone}`, `ds-chip--${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
