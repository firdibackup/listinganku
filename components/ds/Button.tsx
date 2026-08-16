import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'link';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = ['ds-btn', `ds-btn--${variant}`, `ds-btn--${size}`, fullWidth ? 'ds-btn--block' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {iconLeft ? <span aria-hidden="true">{iconLeft}</span> : null}
      {children}
      {iconRight ? <span aria-hidden="true">{iconRight}</span> : null}
    </button>
  );
}
