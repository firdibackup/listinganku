import type { HTMLAttributes } from 'react';

export type CardTone = 'light' | 'tint' | 'brand' | 'dark';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padded?: boolean;
}

export function Card({ tone = 'light', padded = true, className = '', children, ...rest }: CardProps) {
  const classes = ['ds-card', `ds-card--${tone}`, padded ? 'ds-card--padded' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
